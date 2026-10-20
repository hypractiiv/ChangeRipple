package com.changeripple.history;

import com.changeripple.risk.RiskBand;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisRunSummaryDto {

    private String id;
    private String changeRequestId;
    private String changeRequestTitle;
    private String changedComponentId;
    private String changedComponentName;
    private String projectId;
    private String status;
    private double overallRiskScore;
    private RiskBand overallRiskBand;
    private int totalAffectedComponents;
    private int directAffectedCount;
    private int transitiveAffectedCount;
    private int maxImpactDepth;
    private int candidateTestCount;
    private int selectedTestCount;
    private double testSuiteReductionPercent;
    private double testCoveragePercent;
    private int uncoveredComponentCount;
    private String algorithmVersion;
    private Instant executedAt;
}
