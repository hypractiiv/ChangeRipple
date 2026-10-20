package com.changeripple.report;

import com.changeripple.history.AnalysisDetailDto;
import com.changeripple.history.ImpactResultDto;
import com.changeripple.regression.RegressionTestSelectionResult;
import com.changeripple.regression.SelectedTestDTO;
import org.springframework.stereotype.Component;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Component
public class MarkdownReportGenerator {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss z")
            .withZone(ZoneId.of("UTC"));

    public String generateMarkdown(AnalysisDetailDto detail) {
        StringBuilder sb = new StringBuilder();

        sb.append("# ChangeRipple — Software Change Impact Intelligence Report\n\n");
        sb.append("> **Disclaimer**: Impact estimations and heuristic risk scores represent algorithmic dependency models ");
        sb.append("and should be used for test prioritization and code review guidance rather than guaranteed runtime behavior.\n\n");

        sb.append("## 1. Executive Summary\n\n");
        sb.append("| Metric | Value |\n");
        sb.append("| :--- | :--- |\n");
        sb.append(String.format("| **Change Request** | %s (`%s`) |\n", detail.getSummary().getChangeRequestTitle(), detail.getSummary().getChangeRequestId()));
        sb.append(String.format("| **Changed Component** | `%s` |\n", detail.getSummary().getChangedComponentName()));
        sb.append(String.format("| **Analysis Timestamp** | %s |\n", FORMATTER.format(detail.getSummary().getExecutedAt())));
        sb.append(String.format("| **Overall Risk Score** | **%.1f / 100** (%s) |\n", detail.getSummary().getOverallRiskScore(), detail.getSummary().getOverallRiskBand()));
        sb.append(String.format("| **Total Affected Components** | %d (Direct: %d, Transitive: %d) |\n",
                detail.getSummary().getTotalAffectedComponents(), detail.getSummary().getDirectAffectedCount(), detail.getSummary().getTransitiveAffectedCount()));
        sb.append(String.format("| **Max Impact Depth** | %d hops |\n", detail.getSummary().getMaxImpactDepth()));
        sb.append(String.format("| **Greedy Test Suite Reduction** | **%.1f%%** (%d selected from %d candidates) |\n",
                detail.getSummary().getTestSuiteReductionPercent(), detail.getSummary().getSelectedTestCount(), detail.getSummary().getCandidateTestCount()));
        sb.append(String.format("| **Test Coverage** | **%.1f%%** (%d uncovered) |\n\n",
                detail.getSummary().getTestCoveragePercent(), detail.getSummary().getUncoveredComponentCount()));

        sb.append("## 2. Affected Components & Explainable Risk Scoring\n\n");
        sb.append("| Component | Type | Criticality | Proximity | Depth | Risk Score | Risk Band | Blast Radius |\n");
        sb.append("| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n");

        for (ImpactResultDto item : detail.getImpactResults()) {
            sb.append(String.format("| `%s` | %s | %s | %s | %d | **%.1f** | %s | %d dependents |\n",
                    item.getComponentName(), item.getComponentType(), item.getCriticality(),
                    item.getImpactType(), item.getDepth(), item.getRiskScore(), item.getRiskBand(),
                    item.getDownstreamDependentsCount()));
        }
        sb.append("\n");

        sb.append("### Detailed Component Impact Explanations\n\n");
        for (ImpactResultDto item : detail.getImpactResults()) {
            sb.append(String.format("#### `%s` (%s)\n", item.getComponentName(), item.getRiskBand()));
            sb.append(String.format("- **Shortest Impact Path**: `%s`\n", String.join(" \u2192 ", item.getShortestPath())));
            sb.append(String.format("- **Explanation**: %s\n", item.getExplanation()));
            sb.append(String.format("- **Factor Breakdown**: Criticality: `%.1f`, Proximity: `%.1f`, Blast: `%.1f`, Category: `%.1f`, Severity: `%.1f`, Req Bonus: `%.1f`\n\n",
                    item.getCriticalityFactor(), item.getProximityFactor(), item.getBlastRadiusFactor(),
                    item.getCategoryFactor(), item.getSeverityFactor(), item.getCriticalReqBonus()));
        }

        sb.append("## 3. Recommended Regression-Test Suite (Greedy Optimization)\n\n");
        RegressionTestSelectionResult greedy = detail.getGreedyTestSelection();
        if (greedy != null && !greedy.getSelectedTests().isEmpty()) {
            sb.append("| Rank | Test Suite | Covered Components | Selection Reason |\n");
            sb.append("| :--- | :--- | :--- | :--- |\n");
            for (SelectedTestDTO test : greedy.getSelectedTests()) {
                sb.append(String.format("| #%d | `%s` | %s | %s |\n",
                        test.getSelectionRank(), test.getTestComponentName(),
                        String.join(", ", test.getCoveredComponentNames()),
                        test.getSelectionReason()));
            }
            sb.append("\n");
        } else {
            sb.append("_No automated tests are explicitly mapped to the affected components._\n\n");
        }

        if (greedy != null && !greedy.getUncoveredComponentNames().isEmpty()) {
            sb.append("### \u26A0\uFE0F Uncovered Affected Components Warning\n\n");
            sb.append("The following components are impacted by the change but have **no explicit test coverage** in the registry:\n");
            for (String uncovered : greedy.getUncoveredComponentNames()) {
                sb.append(String.format("- \u274C `%s`\n", uncovered));
            }
            sb.append("\n> **Action Item**: Add targeted automated integration or unit tests for these components before deploying.\n\n");
        }

        sb.append("## 4. Methodological Limitations\n\n");
        sb.append("1. **Static vs Dynamic Coupling**: Static dependency graphs cannot capture runtime reflection, dynamic dependency injection, or database trigger side-effects.\n");
        sb.append("2. **Coverage Registry Quality**: Test recommendations depend on explicitly documented test-to-component mappings.\n");
        sb.append("3. **Heuristic Calibration**: Risk scores provide relative prioritization rather than probabilistic failure guarantees.\n");

        return sb.toString();
    }
}
