package com.changeripple.history;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComponentDiffDto {

    private String componentId;
    private String componentName;
    private String componentType;
    private String criticality;
    private String diffType; // NEWLY_AFFECTED, NO_LONGER_AFFECTED, MODIFIED_RISK, UNCHANGED
    private Double run1RiskScore;
    private Double run2RiskScore;
    private Double scoreDelta; // run2 - run1
    private Integer run1Depth;
    private Integer run2Depth;
    private String explanation;
}
