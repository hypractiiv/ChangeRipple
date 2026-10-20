package com.changeripple.regression;

import com.changeripple.component.Component;
import com.changeripple.component.ComponentType;
import com.changeripple.dependency.TestCoverage;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Intelligent Regression-Test Selection Engine.
 *
 * Implements:
 * - Strategy A (BASIC): All candidate tests covering any affected runtime component.
 * - Strategy B (GREEDY SET-COVER): Minimized test set that maximizes coverage of affected components.
 *
 * Algorithmic Complexity of Greedy Set Cover:
 * - Time: O(T * C) where T = candidate tests, C = affected components
 * - Space: O(T + C)
 */
@Service
public class RegressionTestSelector {

    public RegressionTestSelectionResult selectTests(
            String strategy,
            Set<String> affectedComponentIds,
            List<TestCoverage> allCoverageRecords,
            Map<String, Component> componentLookup
    ) {
        if ("BASIC".equalsIgnoreCase(strategy)) {
            return selectBasic(affectedComponentIds, allCoverageRecords, componentLookup);
        } else {
            return selectGreedy(affectedComponentIds, allCoverageRecords, componentLookup);
        }
    }

    /**
     * Strategy A: Basic Selection
     * Selects all candidate tests that have explicit coverage links to any affected runtime component.
     */
    public RegressionTestSelectionResult selectBasic(
            Set<String> affectedComponentIds,
            List<TestCoverage> allCoverageRecords,
            Map<String, Component> componentLookup
    ) {
        Set<String> runtimeAffected = filterRuntimeComponents(affectedComponentIds, componentLookup);

        // Map: testComponentId -> Set of covered affected component IDs
        Map<String, Set<String>> testToAffectedCoverage = new LinkedHashMap<>();

        for (TestCoverage tc : allCoverageRecords) {
            String testId = tc.getTestComponent().getId();
            String targetId = tc.getTargetComponent().getId();

            if (runtimeAffected.contains(targetId)) {
                testToAffectedCoverage.computeIfAbsent(testId, k -> new LinkedHashSet<>()).add(targetId);
            }
        }

        List<SelectedTestDTO> selected = new ArrayList<>();
        int rank = 1;

        // Sort candidate tests deterministically by name
        List<String> sortedTestIds = new ArrayList<>(testToAffectedCoverage.keySet());
        sortedTestIds.sort((t1, t2) -> {
            Component c1 = componentLookup.get(t1);
            Component c2 = componentLookup.get(t2);
            String n1 = c1 != null ? c1.getName() : t1;
            String n2 = c2 != null ? c2.getName() : t2;
            return n1.compareToIgnoreCase(n2);
        });

        Set<String> coveredComponents = new HashSet<>();

        for (String testId : sortedTestIds) {
            Set<String> covers = testToAffectedCoverage.get(testId);
            coveredComponents.addAll(covers);

            Component testComp = componentLookup.get(testId);
            String testName = testComp != null ? testComp.getName() : testId;

            List<String> coveredNames = covers.stream()
                    .map(id -> componentLookup.containsKey(id) ? componentLookup.get(id).getName() : id)
                    .toList();

            selected.add(SelectedTestDTO.builder()
                    .testComponentId(testId)
                    .testComponentName(testName)
                    .selectionRank(rank++)
                    .coveredComponentIds(new ArrayList<>(covers))
                    .coveredComponentNames(coveredNames)
                    .selectionReason("Basic selection: covers " + covers.size() + " affected component(s)")
                    .build());
        }

        return buildResult("BASIC", runtimeAffected, coveredComponents, selected, sortedTestIds.size(), componentLookup);
    }

    /**
     * Strategy B: Greedy Coverage-Based Selection (Weighted Set Cover)
     *
     * 1. Collect affected runtime components needing coverage: U.
     * 2. Build candidate coverage sets.
     * 3. Greedily pick test covering greatest number of uncovered items in U.
     * 4. Break ties deterministically (test criticality, then lexical name).
     * 5. Remove covered items from U.
     * 6. Repeat until no candidate adds additional coverage.
     * 7. Report uncovered components explicitly.
     */
    public RegressionTestSelectionResult selectGreedy(
            Set<String> affectedComponentIds,
            List<TestCoverage> allCoverageRecords,
            Map<String, Component> componentLookup
    ) {
        Set<String> runtimeAffected = filterRuntimeComponents(affectedComponentIds, componentLookup);

        // Build candidate tests mapping: testId -> Set of covered affected component IDs
        Map<String, Set<String>> candidateTestCoverage = new LinkedHashMap<>();

        for (TestCoverage tc : allCoverageRecords) {
            String testId = tc.getTestComponent().getId();
            String targetId = tc.getTargetComponent().getId();

            if (runtimeAffected.contains(targetId)) {
                candidateTestCoverage.computeIfAbsent(testId, k -> new LinkedHashSet<>()).add(targetId);
            }
        }

        int totalCandidates = candidateTestCoverage.size();
        Set<String> uncovered = new LinkedHashSet<>(runtimeAffected);
        Set<String> covered = new LinkedHashSet<>();
        List<SelectedTestDTO> selectedTests = new ArrayList<>();
        Set<String> remainingTests = new LinkedHashSet<>(candidateTestCoverage.keySet());

        int rank = 1;

        while (!uncovered.isEmpty() && !remainingTests.isEmpty()) {
            String bestTestId = null;
            int maxNewCoverage = 0;

            for (String testId : remainingTests) {
                Set<String> testCovers = candidateTestCoverage.get(testId);
                // Calculate intersection with currently uncovered items
                int newCoverage = 0;
                for (String c : testCovers) {
                    if (uncovered.contains(c)) {
                        newCoverage++;
                    }
                }

                if (newCoverage > maxNewCoverage) {
                    maxNewCoverage = newCoverage;
                    bestTestId = testId;
                } else if (newCoverage == maxNewCoverage && newCoverage > 0) {
                    // Deterministic Tie Breaker:
                    // 1. Criticality of test
                    // 2. Lexical name
                    // 3. ID
                    if (shouldPrefer(testId, bestTestId, componentLookup)) {
                        bestTestId = testId;
                    }
                }
            }

            // If no test provides any additional coverage, terminate greedy loop
            if (bestTestId == null || maxNewCoverage == 0) {
                break;
            }

            remainingTests.remove(bestTestId);
            Set<String> newlyCovered = new LinkedHashSet<>();
            for (String c : candidateTestCoverage.get(bestTestId)) {
                if (uncovered.contains(c)) {
                    newlyCovered.add(c);
                    covered.add(c);
                }
            }
            uncovered.removeAll(newlyCovered);

            Component testComp = componentLookup.get(bestTestId);
            String testName = testComp != null ? testComp.getName() : bestTestId;

            List<String> coveredNames = newlyCovered.stream()
                    .map(id -> componentLookup.containsKey(id) ? componentLookup.get(id).getName() : id)
                    .toList();

            selectedTests.add(SelectedTestDTO.builder()
                    .testComponentId(bestTestId)
                    .testComponentName(testName)
                    .selectionRank(rank++)
                    .coveredComponentIds(new ArrayList<>(newlyCovered))
                    .coveredComponentNames(coveredNames)
                    .selectionReason(String.format("Greedy pick #%d: covers %d additional affected component(s)",
                            rank - 1, newlyCovered.size()))
                    .build());
        }

        return buildResult("GREEDY", runtimeAffected, covered, selectedTests, totalCandidates, componentLookup);
    }

    private boolean shouldPrefer(String candidateId, String currentBestId, Map<String, Component> lookup) {
        if (currentBestId == null) return true;

        Component c1 = lookup.get(candidateId);
        Component c2 = lookup.get(currentBestId);

        if (c1 != null && c2 != null) {
            // Compare criticality
            int critCmp = c2.getCriticality().compareTo(c1.getCriticality());
            if (critCmp != 0) return critCmp < 0; // Higher enum ordinal first

            // Compare names
            int nameCmp = c1.getName().compareToIgnoreCase(c2.getName());
            if (nameCmp != 0) return nameCmp < 0;
        }

        return candidateId.compareTo(currentBestId) < 0;
    }

    private Set<String> filterRuntimeComponents(Set<String> componentIds, Map<String, Component> lookup) {
        return componentIds.stream()
                .filter(id -> {
                    Component comp = lookup.get(id);
                    // Only MODULE, CLASS, and API components represent executable runtime components requiring test execution
                    return comp != null && (comp.getType() == ComponentType.CLASS ||
                                           comp.getType() == ComponentType.API ||
                                           comp.getType() == ComponentType.MODULE);
                })
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private RegressionTestSelectionResult buildResult(
            String strategy,
            Set<String> runtimeAffected,
            Set<String> covered,
            List<SelectedTestDTO> selectedTests,
            int totalCandidates,
            Map<String, Component> lookup
    ) {
        int totalRuntime = runtimeAffected.size();
        int coveredCount = covered.size();
        int uncoveredCount = Math.max(0, totalRuntime - coveredCount);

        List<String> uncoveredIds = runtimeAffected.stream()
                .filter(id -> !covered.contains(id))
                .sorted()
                .toList();

        List<String> uncoveredNames = uncoveredIds.stream()
                .map(id -> lookup.containsKey(id) ? lookup.get(id).getName() : id)
                .toList();

        double coveragePercent = totalRuntime > 0
                ? round(((double) coveredCount / totalRuntime) * 100.0, 1)
                : 100.0;

        int selectedCount = selectedTests.size();
        double reductionPercent = totalCandidates > 0
                ? round(((double) (totalCandidates - selectedCount) / totalCandidates) * 100.0, 1)
                : 0.0;

        return RegressionTestSelectionResult.builder()
                .strategy(strategy)
                .candidateTestCount(totalCandidates)
                .selectedTestCount(selectedCount)
                .testSuiteReductionPercent(Math.max(0.0, reductionPercent))
                .testCoveragePercent(coveragePercent)
                .affectedRuntimeComponentCount(totalRuntime)
                .coveredComponentCount(coveredCount)
                .uncoveredComponentCount(uncoveredCount)
                .coveredComponentIds(new ArrayList<>(covered))
                .uncoveredComponentIds(uncoveredIds)
                .uncoveredComponentNames(uncoveredNames)
                .selectedTests(selectedTests)
                .build();
    }

    private double round(double value, int places) {
        if (places < 0) throw new IllegalArgumentException();
        BigDecimal bd = BigDecimal.valueOf(value);
        bd = bd.setScale(places, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }
}
