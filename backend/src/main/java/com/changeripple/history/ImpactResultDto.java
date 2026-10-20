package com.changeripple.history;

import com.changeripple.analysis.ImpactType;
import com.changeripple.component.ComponentType;
import com.changeripple.component.Criticality;
import com.changeripple.risk.RiskBand;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImpactResultDto {

    private String id;
    private String componentId;
    private String componentName;
    private ComponentType componentType;
    private Criticality criticality;
    private ImpactType impactType;
    private int depth;
    private List<String> shortestPath;
    private int downstreamDependentsCount;
    private double riskScore;
    private RiskBand riskBand;
    private double criticalityFactor;
    private double proximityFactor;
    private double blastRadiusFactor;
    private double categoryFactor;
    private double severityFactor;
    private double criticalReqBonus;
    private Map<String, Double> factorContributions;
    private String explanation;
}
