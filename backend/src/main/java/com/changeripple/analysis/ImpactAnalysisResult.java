package com.changeripple.analysis;

import com.changeripple.risk.RiskBand;
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
public class ImpactAnalysisResult {

    private String changedComponentId;
    private String changedComponentName;
    private double overallRiskScore;
    private RiskBand overallRiskBand;

    private int totalAffectedComponents;
    private int directAffectedCount;
    private int transitiveAffectedCount;
    private int maxImpactDepth;

    @Builder.Default
    private List<String> criticalRequirementsImpacted = new ArrayList<>();

    @Builder.Default
    private List<String> unreachableComponentIds = new ArrayList<>();

    @Builder.Default
    private List<ImpactedNodeInfo> affectedComponents = new ArrayList<>();
}
