package com.changeripple.risk;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskScoreResult {

    private double totalScore;
    private RiskBand riskBand;

    private double criticalityFactor;
    private double proximityFactor;
    private double blastRadiusFactor;
    private double categoryModifier;
    private double severityModifier;
    private double criticalRequirementBonus;

    private Map<String, Double> factorBreakdown;
    private String explanation;
}
