package com.changeripple.risk;

import com.changeripple.change.ChangeCategory;
import com.changeripple.change.ChangeSeverity;
import com.changeripple.component.ComponentType;
import com.changeripple.component.Criticality;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class RiskScoringEngineTest {

    private RiskScoringEngine engine;

    @BeforeEach
    void setUp() {
        engine = new RiskScoringEngine();
    }

    @Test
    @DisplayName("Direct critical component modification results in CRITICAL or HIGH risk score")
    void testDirectCriticalComponentRisk() {
        RiskScoreResult result = engine.calculateRisk(
                Criticality.CRITICAL,
                ComponentType.CLASS,
                1, // depth = 1 (direct)
                4, // blast radius
                10, // total components
                ChangeCategory.DATA_MODEL_CHANGE,
                ChangeSeverity.CRITICAL,
                true, // traces to critical req
                List.of("OrderService", "OrderRepository")
        );

        assertNotNull(result);
        assertTrue(result.getTotalScore() >= 80.0, "Score should be >= 80, was: " + result.getTotalScore());
        assertEquals(RiskBand.CRITICAL, result.getRiskBand());
        assertTrue(result.getExplanation().contains("Direct dependent"));
        assertTrue(result.getExplanation().contains("DATA_MODEL_CHANGE"));
    }

    @Test
    @DisplayName("Transitive low-criticality component modification produces lower risk score")
    void testTransitiveLowCriticalityRisk() {
        RiskScoreResult result = engine.calculateRisk(
                Criticality.LOW,
                ComponentType.CLASS,
                4, // depth = 4
                0, // blast radius
                10,
                ChangeCategory.LOGIC_CHANGE,
                ChangeSeverity.LOW,
                false,
                List.of("A", "B", "C", "D")
        );

        assertNotNull(result);
        assertTrue(result.getTotalScore() < 40.0, "Score should be low, was: " + result.getTotalScore());
        assertEquals(RiskBand.LOW, result.getRiskBand());
    }

    @Test
    @DisplayName("Risk scores never exceed 100 or fall below 0 under extreme boundary values")
    void testScoreBoundaryClamping() {
        // Maximal inputs
        RiskScoreResult maxResult = engine.calculateRisk(
                Criticality.CRITICAL,
                ComponentType.API,
                1,
                100,
                10,
                ChangeCategory.SECURITY_CHANGE,
                ChangeSeverity.CRITICAL,
                true,
                List.of("API", "Auth")
        );
        assertTrue(maxResult.getTotalScore() <= 100.0);

        // Minimal inputs
        RiskScoreResult minResult = engine.calculateRisk(
                Criticality.LOW,
                ComponentType.CLASS,
                10,
                0,
                10,
                ChangeCategory.LOGIC_CHANGE,
                ChangeSeverity.LOW,
                false,
                List.of("A")
        );
        assertTrue(minResult.getTotalScore() >= 0.0);
    }
}
