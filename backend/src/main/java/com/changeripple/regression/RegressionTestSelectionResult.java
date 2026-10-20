package com.changeripple.regression;

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
public class RegressionTestSelectionResult {

    private String strategy; // BASIC or GREEDY
    private int candidateTestCount;
    private int selectedTestCount;
    private double testSuiteReductionPercent;
    private double testCoveragePercent;

    private int affectedRuntimeComponentCount;
    private int coveredComponentCount;
    private int uncoveredComponentCount;

    @Builder.Default
    private List<String> coveredComponentIds = new ArrayList<>();

    @Builder.Default
    private List<String> uncoveredComponentIds = new ArrayList<>();

    @Builder.Default
    private List<String> uncoveredComponentNames = new ArrayList<>();

    @Builder.Default
    private List<SelectedTestDTO> selectedTests = new ArrayList<>();
}
