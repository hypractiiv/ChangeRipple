package com.changeripple.history;

import com.changeripple.regression.RegressionTestSelectionResult;
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
public class AnalysisDetailDto {

    private AnalysisRunSummaryDto summary;

    @Builder.Default
    private List<ImpactResultDto> impactResults = new ArrayList<>();

    private RegressionTestSelectionResult basicTestSelection;
    private RegressionTestSelectionResult greedyTestSelection;
}
