package com.changeripple.risk;

import com.changeripple.change.ChangeCategory;
import com.changeripple.change.ChangeSeverity;
import com.changeripple.component.ComponentType;
import com.changeripple.component.Criticality;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Heuristic Explainable Risk-Scoring Engine.
 * Calculates calibrated risk scores (0-100) using multi-factor contribution weighting.
 *
 * NOTE: As required by architecture principles, this heuristic score represents
 * an engineering prioritization model and not a statistically validated failure probability.
 */
@Service
public class RiskScoringEngine {

    public static final double WEIGHT_CRITICALITY = 0.35;
    public static final double WEIGHT_PROXIMITY = 0.25;
    public static final double WEIGHT_BLAST_RADIUS = 0.15;
    public static final double WEIGHT_CATEGORY = 0.15;
    public static final double WEIGHT_SEVERITY = 0.10;

    public RiskScoreResult calculateRisk(
            Criticality componentCriticality,
            ComponentType componentType,
            int impactDepth,
            int blastRadiusCount,
            int totalProjectComponents,
            ChangeCategory changeCategory,
            ChangeSeverity changeSeverity,
            boolean isCriticalRequirementOrTracesToRequirement,
            List<String> pathNames
    ) {
        // 1. Criticality Contribution (0 - 100)
        double critScore = componentCriticality != null ? componentCriticality.getBaseScore() : 30.0;
        double critContrib = critScore * WEIGHT_CRITICALITY;

        // 2. Proximity Contribution (0 - 100)
        double proxScore;
        if (impactDepth <= 1) {
            proxScore = 100.0;
        } else if (impactDepth == 2) {
            proxScore = 65.0;
        } else if (impactDepth == 3) {
            proxScore = 40.0;
        } else {
            proxScore = Math.max(10.0, 100.0 / (impactDepth * 1.5));
        }
        double proxContrib = proxScore * WEIGHT_PROXIMITY;

        // 3. Blast Radius Contribution (0 - 100)
        double blastScore = 0.0;
        if (totalProjectComponents > 0) {
            double ratio = (double) blastRadiusCount / Math.max(1, totalProjectComponents);
            blastScore = Math.min(100.0, ratio * 200.0); // Reach of 50% of components saturates blast score to 100
        }
        double blastContrib = blastScore * WEIGHT_BLAST_RADIUS;

        // 4. Change Category Contribution (scaled to 100)
        double catBase = changeCategory != null ? changeCategory.getWeight() : 8.0;
        double catScore = (catBase / 20.0) * 100.0;
        double catContrib = catScore * WEIGHT_CATEGORY;

        // 5. Change Severity Contribution (scaled to 100)
        double sevBase = changeSeverity != null ? changeSeverity.getWeight() : 6.0;
        double sevScore = (sevBase / 18.0) * 100.0;
        double sevContrib = sevScore * WEIGHT_SEVERITY;

        // 6. Critical Requirement Bonus
        double reqBonus = 0.0;
        if (isCriticalRequirementOrTracesToRequirement) {
            reqBonus = 12.0;
        }

        // Sum and clamp to [0.0, 100.0]
        double rawScore = critContrib + proxContrib + blastContrib + catContrib + sevContrib + reqBonus;
        double totalScore = Math.min(100.0, Math.max(0.0, round(rawScore, 1)));
        RiskBand riskBand = RiskBand.fromScore(totalScore);

        Map<String, Double> breakdown = new LinkedHashMap<>();
        breakdown.put("criticalityContribution", round(critContrib, 1));
        breakdown.put("proximityContribution", round(proxContrib, 1));
        breakdown.put("blastRadiusContribution", round(blastContrib, 1));
        breakdown.put("categoryContribution", round(catContrib, 1));
        breakdown.put("severityContribution", round(sevContrib, 1));
        breakdown.put("criticalRequirementBonus", round(reqBonus, 1));

        String explanation = generateExplanation(
                totalScore, riskBand, componentCriticality, componentType,
                impactDepth, blastRadiusCount, changeCategory, changeSeverity,
                isCriticalRequirementOrTracesToRequirement, pathNames
        );

        return RiskScoreResult.builder()
                .totalScore(totalScore)
                .riskBand(riskBand)
                .criticalityFactor(round(critScore, 1))
                .proximityFactor(round(proxScore, 1))
                .blastRadiusFactor(round(blastScore, 1))
                .categoryModifier(round(catScore, 1))
                .severityModifier(round(sevScore, 1))
                .criticalRequirementBonus(round(reqBonus, 1))
                .factorBreakdown(breakdown)
                .explanation(explanation)
                .build();
    }

    private String generateExplanation(
            double totalScore,
            RiskBand riskBand,
            Criticality criticality,
            ComponentType type,
            int depth,
            int blastCount,
            ChangeCategory category,
            ChangeSeverity severity,
            boolean hasReqBonus,
            List<String> pathNames
    ) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Assessed as %s risk (score: %.1f/100). ", riskBand, totalScore));

        if (depth == 1) {
            sb.append("Direct dependent (depth 1) with immediate coupling to changed component. ");
        } else {
            sb.append(String.format("Transitive dependent at depth %d. ", depth));
            if (pathNames != null && pathNames.size() > 1) {
                sb.append(String.format("Impact chain: %s. ", String.join(" \u2192 ", pathNames)));
            }
        }

        sb.append(String.format("Component tier is rated %s (%s). ", criticality, type));

        if (blastCount > 0) {
            sb.append(String.format("Downstream cascade impacts %d other component(s). ", blastCount));
        }

        if (category != null && severity != null) {
            sb.append(String.format("Amplified by %s (%s severity). ", category.name(), severity.name()));
        }

        if (hasReqBonus) {
            sb.append("Elevated due to direct association with critical business/compliance requirements. ");
        }

        return sb.toString().trim();
    }

    private double round(double value, int places) {
        if (places < 0) throw new IllegalArgumentException();
        BigDecimal bd = BigDecimal.valueOf(value);
        bd = bd.setScale(places, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }
}
