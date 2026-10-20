package com.changeripple.history;

import com.changeripple.analysis.ImpactAnalysisEngine;
import com.changeripple.analysis.ImpactAnalysisResult;
import com.changeripple.analysis.ImpactedNodeInfo;
import com.changeripple.change.AnalysisStatus;
import com.changeripple.change.ChangeRequest;
import com.changeripple.change.ChangeRequestRepository;
import com.changeripple.common.ForbiddenException;
import com.changeripple.common.PagedResponse;
import com.changeripple.common.ResourceNotFoundException;
import com.changeripple.component.Component;
import com.changeripple.component.ComponentRepository;
import com.changeripple.dependency.TestCoverage;
import com.changeripple.dependency.TestCoverageRepository;
import com.changeripple.graph.DirectedGraph;
import com.changeripple.graph.GraphBuilder;
import com.changeripple.regression.RegressionTestSelectionResult;
import com.changeripple.regression.RegressionTestSelector;
import com.changeripple.regression.SelectedTestDTO;
import com.changeripple.security.ProjectSecurityService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalysisService {

    private static final Logger log = LoggerFactory.getLogger(AnalysisService.class);

    private final ChangeRequestRepository changeRequestRepository;
    private final AnalysisRunRepository analysisRunRepository;
    private final ImpactResultRepository impactResultRepository;
    private final SelectedTestRepository selectedTestRepository;
    private final ComponentRepository componentRepository;
    private final TestCoverageRepository testCoverageRepository;
    private final GraphBuilder graphBuilder;
    private final ImpactAnalysisEngine impactAnalysisEngine;
    private final RegressionTestSelector regressionTestSelector;
    private final ProjectSecurityService projectSecurityService;
    private final ObjectMapper objectMapper;

    @Transactional
    public AnalysisDetailDto runAnalysis(String changeRequestId) {
        ChangeRequest cr = changeRequestRepository.findById(changeRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("ChangeRequest", "id", changeRequestId));

        String projectId = cr.getProject().getId();
        validateAccess(projectId, "MEMBER");

        cr.setStatus(AnalysisStatus.RUNNING);
        changeRequestRepository.save(cr);

        try {
            // 1. Build project graph in memory
            DirectedGraph graph = graphBuilder.buildGraphForProject(projectId);

            // 2. Run graph impact analysis traversal
            ImpactAnalysisResult impactResult = impactAnalysisEngine.analyzeImpact(
                    graph,
                    cr.getChangedComponent().getId(),
                    cr.getCategory(),
                    cr.getSeverity()
            );

            // 3. Load test coverage data and components
            List<TestCoverage> coverages = testCoverageRepository.findAllByProjectId(projectId);
            Map<String, Component> componentLookup = componentRepository.findAllByProjectId(projectId).stream()
                    .collect(Collectors.toMap(Component::getId, Function.identity()));

            Set<String> affectedIds = impactResult.getAffectedComponents().stream()
                    .map(ImpactedNodeInfo::getComponentId)
                    .collect(Collectors.toCollection(LinkedHashSet::new));
            // Also include changed component itself as an affected target needing testing
            affectedIds.add(cr.getChangedComponent().getId());

            // 4. Run both Basic and Greedy test selection strategies
            RegressionTestSelectionResult basicTests = regressionTestSelector.selectBasic(
                    affectedIds, coverages, componentLookup);

            RegressionTestSelectionResult greedyTests = regressionTestSelector.selectGreedy(
                    affectedIds, coverages, componentLookup);

            // 5. Persist AnalysisRun snapshot
            AnalysisRun run = AnalysisRun.builder()
                    .changeRequest(cr)
                    .project(cr.getProject())
                    .status("COMPLETED")
                    .overallRiskScore(impactResult.getOverallRiskScore())
                    .overallRiskBand(impactResult.getOverallRiskBand())
                    .totalAffectedComponents(impactResult.getTotalAffectedComponents())
                    .directAffectedCount(impactResult.getDirectAffectedCount())
                    .transitiveAffectedCount(impactResult.getTransitiveAffectedCount())
                    .maxImpactDepth(impactResult.getMaxImpactDepth())
                    .candidateTestCount(greedyTests.getCandidateTestCount())
                    .selectedTestCount(greedyTests.getSelectedTestCount())
                    .testSuiteReductionPercent(greedyTests.getTestSuiteReductionPercent())
                    .testCoveragePercent(greedyTests.getTestCoveragePercent())
                    .uncoveredComponentCount(greedyTests.getUncoveredComponentCount())
                    .algorithmVersion("v2.0-bfs-greedy")
                    .build();

            run = analysisRunRepository.save(run);

            // 6. Persist individual ImpactResult records
            for (ImpactedNodeInfo info : impactResult.getAffectedComponents()) {
                Component comp = componentLookup.get(info.getComponentId());
                if (comp == null) continue;

                String pathJson = toJson(info.getShortestPathNames());

                ImpactResult ir = ImpactResult.builder()
                        .analysisRun(run)
                        .component(comp)
                        .impactType(info.getImpactType())
                        .depth(info.getDepth())
                        .shortestPathJson(pathJson)
                        .downstreamDependentsCount(info.getDownstreamDependentsCount())
                        .riskScore(info.getRiskScore())
                        .riskBand(info.getRiskBand())
                        .criticalityFactor(info.getRiskDetails().getCriticalityFactor())
                        .proximityFactor(info.getRiskDetails().getProximityFactor())
                        .blastRadiusFactor(info.getRiskDetails().getBlastRadiusFactor())
                        .categoryFactor(info.getRiskDetails().getCategoryModifier())
                        .severityFactor(info.getRiskDetails().getSeverityModifier())
                        .criticalReqBonus(info.getRiskDetails().getCriticalRequirementBonus())
                        .explanation(info.getExplanation())
                        .build();

                impactResultRepository.save(ir);
            }

            // 7. Persist SelectedTest records for both strategies
            persistSelectedTests(run, greedyTests.getSelectedTests(), "GREEDY", componentLookup);
            persistSelectedTests(run, basicTests.getSelectedTests(), "BASIC", componentLookup);

            cr.setStatus(AnalysisStatus.COMPLETED);
            changeRequestRepository.save(cr);

            return buildDetailResponse(run, basicTests, greedyTests);

        } catch (Exception ex) {
            log.error("Analysis execution failed for change request " + changeRequestId, ex);
            cr.setStatus(AnalysisStatus.FAILED);
            changeRequestRepository.save(cr);
            throw ex;
        }
    }

    private void persistSelectedTests(AnalysisRun run,
                                      List<SelectedTestDTO> testDTOs,
                                      String strategy,
                                      Map<String, Component> lookup) {
        for (SelectedTestDTO dto : testDTOs) {
            Component testComp = lookup.get(dto.getTestComponentId());
            if (testComp == null) continue;

            SelectedTest st = SelectedTest.builder()
                    .analysisRun(run)
                    .testComponent(testComp)
                    .selectionStrategy(strategy)
                    .selectionRank(dto.getSelectionRank())
                    .coveredComponentsJson(toJson(dto.getCoveredComponentNames()))
                    .selectionReason(dto.getSelectionReason())
                    .build();

            selectedTestRepository.save(st);
        }
    }

    @Transactional(readOnly = true)
    public AnalysisDetailDto getAnalysis(String analysisId) {
        AnalysisRun run = analysisRunRepository.findById(analysisId)
                .orElseThrow(() -> new ResourceNotFoundException("AnalysisRun", "id", analysisId));

        validateAccess(run.getProject().getId(), "MEMBER");

        // Reconstruct or read saved selections
        List<SelectedTest> savedGreedy = selectedTestRepository.findAllByAnalysisRunIdAndSelectionStrategyOrderBySelectionRankAsc(analysisId, "GREEDY");
        List<SelectedTest> savedBasic = selectedTestRepository.findAllByAnalysisRunIdAndSelectionStrategyOrderBySelectionRankAsc(analysisId, "BASIC");

        RegressionTestSelectionResult greedyResult = toTestResult(run, "GREEDY", savedGreedy);
        RegressionTestSelectionResult basicResult = toTestResult(run, "BASIC", savedBasic);

        return buildDetailResponse(run, basicResult, greedyResult);
    }

    @Transactional(readOnly = true)
    public List<ImpactResultDto> getAnalysisResults(String analysisId) {
        AnalysisRun run = analysisRunRepository.findById(analysisId)
                .orElseThrow(() -> new ResourceNotFoundException("AnalysisRun", "id", analysisId));

        validateAccess(run.getProject().getId(), "MEMBER");

        List<ImpactResult> list = impactResultRepository.findAllByAnalysisRunIdOrderByRiskScoreDesc(analysisId);
        return list.stream().map(this::toImpactResultDto).toList();
    }

    @Transactional(readOnly = true)
    public List<SelectedTestResponseDto> getAnalysisTests(String analysisId, String strategy) {
        AnalysisRun run = analysisRunRepository.findById(analysisId)
                .orElseThrow(() -> new ResourceNotFoundException("AnalysisRun", "id", analysisId));

        validateAccess(run.getProject().getId(), "MEMBER");

        String strat = (strategy != null && !strategy.isBlank()) ? strategy.toUpperCase() : "GREEDY";
        List<SelectedTest> list = selectedTestRepository.findAllByAnalysisRunIdAndSelectionStrategyOrderBySelectionRankAsc(analysisId, strat);

        return list.stream().map(st -> SelectedTestResponseDto.builder()
                .id(st.getId())
                .testComponentId(st.getTestComponent().getId())
                .testComponentName(st.getTestComponent().getName())
                .selectionStrategy(st.getSelectionStrategy())
                .selectionRank(st.getSelectionRank())
                .coveredComponentNames(fromJsonList(st.getCoveredComponentsJson()))
                .selectionReason(st.getSelectionReason())
                .build()).toList();
    }

    @Transactional(readOnly = true)
    public PagedResponse<AnalysisRunSummaryDto> getProjectAnalyses(String projectId, Pageable pageable) {
        validateAccess(projectId, "MEMBER");
        Page<AnalysisRun> page = analysisRunRepository.findAllByProjectIdOrderByExecutedAtDesc(projectId, pageable);
        return PagedResponse.of(page.map(this::toSummaryDto));
    }

    @Transactional(readOnly = true)
    public HistoryCompareResponse compareAnalyses(HistoryCompareRequest request) {
        AnalysisRun run1 = analysisRunRepository.findById(request.getRunId1())
                .orElseThrow(() -> new ResourceNotFoundException("AnalysisRun (baseline)", "id", request.getRunId1()));

        AnalysisRun run2 = analysisRunRepository.findById(request.getRunId2())
                .orElseThrow(() -> new ResourceNotFoundException("AnalysisRun (comparison)", "id", request.getRunId2()));

        validateAccess(run1.getProject().getId(), "MEMBER");
        validateAccess(run2.getProject().getId(), "MEMBER");

        List<ImpactResult> list1 = impactResultRepository.findAllByAnalysisRunIdOrderByRiskScoreDesc(run1.getId());
        List<ImpactResult> list2 = impactResultRepository.findAllByAnalysisRunIdOrderByRiskScoreDesc(run2.getId());

        Map<String, ImpactResult> map1 = list1.stream().collect(Collectors.toMap(ir -> ir.getComponent().getId(), Function.identity()));
        Map<String, ImpactResult> map2 = list2.stream().collect(Collectors.toMap(ir -> ir.getComponent().getId(), Function.identity()));

        Set<String> allComponentIds = new LinkedHashSet<>();
        allComponentIds.addAll(map1.keySet());
        allComponentIds.addAll(map2.keySet());

        List<ComponentDiffDto> componentDiffs = new ArrayList<>();
        int newlyAffected = 0;
        int noLongerAffected = 0;
        int commonAffected = 0;

        for (String cId : allComponentIds) {
            ImpactResult ir1 = map1.get(cId);
            ImpactResult ir2 = map2.get(cId);

            if (ir2 != null && ir1 == null) {
                // Newly affected
                newlyAffected++;
                componentDiffs.add(ComponentDiffDto.builder()
                        .componentId(cId)
                        .componentName(ir2.getComponent().getName())
                        .componentType(ir2.getComponent().getType().name())
                        .criticality(ir2.getComponent().getCriticality().name())
                        .diffType("NEWLY_AFFECTED")
                        .run1RiskScore(null)
                        .run2RiskScore(ir2.getRiskScore())
                        .scoreDelta(ir2.getRiskScore())
                        .run1Depth(null)
                        .run2Depth(ir2.getDepth())
                        .explanation("Component is newly impacted in comparison run (" + ir2.getImpactType() + ", depth " + ir2.getDepth() + ")")
                        .build());
            } else if (ir1 != null && ir2 == null) {
                // No longer affected
                noLongerAffected++;
                componentDiffs.add(ComponentDiffDto.builder()
                        .componentId(cId)
                        .componentName(ir1.getComponent().getName())
                        .componentType(ir1.getComponent().getType().name())
                        .criticality(ir1.getComponent().getCriticality().name())
                        .diffType("NO_LONGER_AFFECTED")
                        .run1RiskScore(ir1.getRiskScore())
                        .run2RiskScore(null)
                        .scoreDelta(-ir1.getRiskScore())
                        .run1Depth(ir1.getDepth())
                        .run2Depth(null)
                        .explanation("Component is no longer affected in comparison run")
                        .build());
            } else if (ir1 != null && ir2 != null) {
                // Common
                commonAffected++;
                double delta = round(ir2.getRiskScore() - ir1.getRiskScore(), 1);
                String diffType = (delta != 0.0) ? "MODIFIED_RISK" : "UNCHANGED";

                componentDiffs.add(ComponentDiffDto.builder()
                        .componentId(cId)
                        .componentName(ir2.getComponent().getName())
                        .componentType(ir2.getComponent().getType().name())
                        .criticality(ir2.getComponent().getCriticality().name())
                        .diffType(diffType)
                        .run1RiskScore(ir1.getRiskScore())
                        .run2RiskScore(ir2.getRiskScore())
                        .scoreDelta(delta)
                        .run1Depth(ir1.getDepth())
                        .run2Depth(ir2.getDepth())
                        .explanation(delta != 0.0
                                ? String.format("Risk score shifted by %+.1f (from %.1f to %.1f)", delta, ir1.getRiskScore(), ir2.getRiskScore())
                                : "Risk score and impact depth remain identical")
                        .build());
            }
        }

        // Test suite diff
        List<SelectedTest> tests1 = selectedTestRepository.findAllByAnalysisRunIdAndSelectionStrategyOrderBySelectionRankAsc(run1.getId(), "GREEDY");
        List<SelectedTest> tests2 = selectedTestRepository.findAllByAnalysisRunIdAndSelectionStrategyOrderBySelectionRankAsc(run2.getId(), "GREEDY");

        Map<String, SelectedTest> testMap1 = tests1.stream().collect(Collectors.toMap(t -> t.getTestComponent().getId(), Function.identity()));
        Map<String, SelectedTest> testMap2 = tests2.stream().collect(Collectors.toMap(t -> t.getTestComponent().getId(), Function.identity()));

        Set<String> allTestIds = new LinkedHashSet<>();
        allTestIds.addAll(testMap1.keySet());
        allTestIds.addAll(testMap2.keySet());

        List<TestDiffDto> testDiffs = new ArrayList<>();
        for (String tId : allTestIds) {
            SelectedTest st1 = testMap1.get(tId);
            SelectedTest st2 = testMap2.get(tId);

            if (st2 != null && st1 == null) {
                testDiffs.add(TestDiffDto.builder()
                        .testComponentId(tId)
                        .testComponentName(st2.getTestComponent().getName())
                        .diffStatus("ADDED")
                        .selectionReason(st2.getSelectionReason())
                        .build());
            } else if (st1 != null && st2 == null) {
                testDiffs.add(TestDiffDto.builder()
                        .testComponentId(tId)
                        .testComponentName(st1.getTestComponent().getName())
                        .diffStatus("REMOVED")
                        .selectionReason("No longer required for optimal set-cover")
                        .build());
            } else {
                testDiffs.add(TestDiffDto.builder()
                        .testComponentId(tId)
                        .testComponentName(st2.getTestComponent().getName())
                        .diffStatus("RETAINED")
                        .selectionReason(st2.getSelectionReason())
                        .build());
            }
        }

        double riskDelta = round(run2.getOverallRiskScore() - run1.getOverallRiskScore(), 1);
        double covDelta = round(run2.getTestCoveragePercent() - run1.getTestCoveragePercent(), 1);
        double redDelta = round(run2.getTestSuiteReductionPercent() - run1.getTestSuiteReductionPercent(), 1);

        return HistoryCompareResponse.builder()
                .baselineRun(toSummaryDto(run1))
                .comparisonRun(toSummaryDto(run2))
                .newlyAffectedCount(newlyAffected)
                .noLongerAffectedCount(noLongerAffected)
                .commonAffectedCount(commonAffected)
                .overallRiskScoreDelta(riskDelta)
                .testCoverageDelta(covDelta)
                .testSuiteReductionDelta(redDelta)
                .componentDiffs(componentDiffs)
                .testDiffs(testDiffs)
                .build();
    }

    private void validateAccess(String projectId, String minRole) {
        if (!projectSecurityService.hasAccess(projectId, minRole)) {
            throw new ForbiddenException("You do not have required " + minRole + " access for project " + projectId);
        }
    }

    public AnalysisRunSummaryDto toSummaryDto(AnalysisRun run) {
        return AnalysisRunSummaryDto.builder()
                .id(run.getId())
                .changeRequestId(run.getChangeRequest().getId())
                .changeRequestTitle(run.getChangeRequest().getTitle())
                .changedComponentId(run.getChangeRequest().getChangedComponent().getId())
                .changedComponentName(run.getChangeRequest().getChangedComponent().getName())
                .projectId(run.getProject().getId())
                .status(run.getStatus())
                .overallRiskScore(run.getOverallRiskScore())
                .overallRiskBand(run.getOverallRiskBand())
                .totalAffectedComponents(run.getTotalAffectedComponents())
                .directAffectedCount(run.getDirectAffectedCount())
                .transitiveAffectedCount(run.getTransitiveAffectedCount())
                .maxImpactDepth(run.getMaxImpactDepth())
                .candidateTestCount(run.getCandidateTestCount())
                .selectedTestCount(run.getSelectedTestCount())
                .testSuiteReductionPercent(run.getTestSuiteReductionPercent())
                .testCoveragePercent(run.getTestCoveragePercent())
                .uncoveredComponentCount(run.getUncoveredComponentCount())
                .algorithmVersion(run.getAlgorithmVersion())
                .executedAt(run.getExecutedAt())
                .build();
    }

    public ImpactResultDto toImpactResultDto(ImpactResult ir) {
        Map<String, Double> breakdown = new LinkedHashMap<>();
        breakdown.put("criticalityContribution", ir.getCriticalityFactor());
        breakdown.put("proximityContribution", ir.getProximityFactor());
        breakdown.put("blastRadiusContribution", ir.getBlastRadiusFactor());
        breakdown.put("categoryContribution", ir.getCategoryFactor());
        breakdown.put("severityContribution", ir.getSeverityFactor());
        breakdown.put("criticalRequirementBonus", ir.getCriticalReqBonus());

        return ImpactResultDto.builder()
                .id(ir.getId())
                .componentId(ir.getComponent().getId())
                .componentName(ir.getComponent().getName())
                .componentType(ir.getComponent().getType())
                .criticality(ir.getComponent().getCriticality())
                .impactType(ir.getImpactType())
                .depth(ir.getDepth())
                .shortestPath(fromJsonList(ir.getShortestPathJson()))
                .downstreamDependentsCount(ir.getDownstreamDependentsCount())
                .riskScore(ir.getRiskScore())
                .riskBand(ir.getRiskBand())
                .criticalityFactor(ir.getCriticalityFactor())
                .proximityFactor(ir.getProximityFactor())
                .blastRadiusFactor(ir.getBlastRadiusFactor())
                .categoryFactor(ir.getCategoryFactor())
                .severityFactor(ir.getSeverityFactor())
                .criticalReqBonus(ir.getCriticalReqBonus())
                .factorContributions(breakdown)
                .explanation(ir.getExplanation())
                .build();
    }

    private AnalysisDetailDto buildDetailResponse(
            AnalysisRun run,
            RegressionTestSelectionResult basic,
            RegressionTestSelectionResult greedy
    ) {
        List<ImpactResult> list = impactResultRepository.findAllByAnalysisRunIdOrderByRiskScoreDesc(run.getId());
        List<ImpactResultDto> dtoList = list.stream().map(this::toImpactResultDto).toList();

        return AnalysisDetailDto.builder()
                .summary(toSummaryDto(run))
                .impactResults(dtoList)
                .basicTestSelection(basic)
                .greedyTestSelection(greedy)
                .build();
    }

    private RegressionTestSelectionResult toTestResult(AnalysisRun run, String strategy, List<SelectedTest> tests) {
        List<SelectedTestDTO> dtos = tests.stream().map(t -> SelectedTestDTO.builder()
                .testComponentId(t.getTestComponent().getId())
                .testComponentName(t.getTestComponent().getName())
                .selectionRank(t.getSelectionRank())
                .coveredComponentNames(fromJsonList(t.getCoveredComponentsJson()))
                .selectionReason(t.getSelectionReason())
                .build()).toList();

        return RegressionTestSelectionResult.builder()
                .strategy(strategy)
                .candidateTestCount(run.getCandidateTestCount())
                .selectedTestCount(dtos.size())
                .testSuiteReductionPercent(run.getTestSuiteReductionPercent())
                .testCoveragePercent(run.getTestCoveragePercent())
                .uncoveredComponentCount(run.getUncoveredComponentCount())
                .selectedTests(dtos)
                .build();
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private List<String> fromJsonList(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }

    private double round(double val, int places) {
        BigDecimal bd = BigDecimal.valueOf(val).setScale(places, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }
}
