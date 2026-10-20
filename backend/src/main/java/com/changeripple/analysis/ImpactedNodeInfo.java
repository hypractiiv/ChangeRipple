package com.changeripple.analysis;

import com.changeripple.component.ComponentType;
import com.changeripple.component.Criticality;
import com.changeripple.risk.RiskBand;
import com.changeripple.risk.RiskScoreResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImpactedNodeInfo {

    private String componentId;
    private String componentName;
    private ComponentType componentType;
    private Criticality criticality;
    private ImpactType impactType;
    private int depth;
    private List<String> shortestPathIds;
    private List<String> shortestPathNames;
    private int downstreamDependentsCount;
    private double riskScore;
    private RiskBand riskBand;
    private RiskScoreResult riskDetails;
    private String explanation;
}
