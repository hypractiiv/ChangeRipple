package com.changeripple.history;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistoryCompareResponse {

    private AnalysisRunSummaryDto baselineRun;
    private AnalysisRunSummaryDto comparisonRun;

    private int newlyAffectedCount;
    private int noLongerAffectedCount;
    private int commonAffectedCount;

    private double overallRiskScoreDelta;
    private double testCoverageDelta;
    private double testSuiteReductionDelta;

    @Builder.Default
    private List<ComponentDiffDto> componentDiffs = new ArrayList<>();

    @Builder.Default
    private List<TestDiffDto> testDiffs = new ArrayList<>();
}
