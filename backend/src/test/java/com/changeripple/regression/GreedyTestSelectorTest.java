package com.changeripple.regression;

import com.changeripple.component.Component;
import com.changeripple.component.ComponentType;
import com.changeripple.component.Criticality;
import com.changeripple.dependency.TestCoverage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class GreedyTestSelectorTest {

    private RegressionTestSelector selector;

    @BeforeEach
    void setUp() {
        selector = new RegressionTestSelector();
    }

    @Test
    @DisplayName("Greedy selection picks minimal test set maximizing coverage and reducing test suite size")
    void testGreedyOptimizationReducesSuite() {
        // Runtime components needing test coverage: C1, C2, C3
        Component c1 = Component.builder().name("Comp1").type(ComponentType.CLASS).criticality(Criticality.HIGH).build();
        c1.setId("c1");
        Component c2 = Component.builder().name("Comp2").type(ComponentType.CLASS).criticality(Criticality.MEDIUM).build();
        c2.setId("c2");
        Component c3 = Component.builder().name("Comp3").type(ComponentType.CLASS).criticality(Criticality.LOW).build();
        c3.setId("c3");

        // Tests:
        // T1 covers C1, C2, C3 (broad suite)
        // T2 covers C1
        // T3 covers C2
        // T4 covers C3
        Component t1 = Component.builder().name("ComprehensiveSuite").type(ComponentType.TEST).criticality(Criticality.CRITICAL).build();
        t1.setId("t1");
        Component t2 = Component.builder().name("Test1").type(ComponentType.TEST).criticality(Criticality.LOW).build();
        t2.setId("t2");
        Component t3 = Component.builder().name("Test2").type(ComponentType.TEST).criticality(Criticality.LOW).build();
        t3.setId("t3");
        Component t4 = Component.builder().name("Test3").type(ComponentType.TEST).criticality(Criticality.LOW).build();
        t4.setId("t4");

        Map<String, Component> lookup = Map.of(
                "c1", c1, "c2", c2, "c3", c3,
                "t1", t1, "t2", t2, "t3", t3, "t4", t4
        );

        List<TestCoverage> coverages = List.of(
                TestCoverage.builder().testComponent(t1).targetComponent(c1).build(),
                TestCoverage.builder().testComponent(t1).targetComponent(c2).build(),
                TestCoverage.builder().testComponent(t1).targetComponent(c3).build(),
                TestCoverage.builder().testComponent(t2).targetComponent(c1).build(),
                TestCoverage.builder().testComponent(t3).targetComponent(c2).build(),
                TestCoverage.builder().testComponent(t4).targetComponent(c3).build()
        );

        Set<String> affected = Set.of("c1", "c2", "c3");

        // Strategy A: Basic selects all 4 candidate tests
        RegressionTestSelectionResult basicResult = selector.selectBasic(affected, coverages, lookup);
        assertEquals(4, basicResult.getSelectedTestCount());
        assertEquals(0.0, basicResult.getTestSuiteReductionPercent());

        // Strategy B: Greedy selects ONLY T1 (covering all 3 in one test!)
        RegressionTestSelectionResult greedyResult = selector.selectGreedy(affected, coverages, lookup);
        assertEquals(1, greedyResult.getSelectedTestCount());
        assertEquals("t1", greedyResult.getSelectedTests().get(0).getTestComponentId());
        assertEquals(100.0, greedyResult.getTestCoveragePercent());
        assertEquals(75.0, greedyResult.getTestSuiteReductionPercent(), "Reduced from 4 to 1 test = 75% reduction");
        assertEquals(0, greedyResult.getUncoveredComponentCount());
    }

    @Test
    @DisplayName("Uncovered affected runtime components are explicitly reported")
    void testUncoveredComponentsReporting() {
        Component c1 = Component.builder().name("TestedComponent").type(ComponentType.CLASS).criticality(Criticality.MEDIUM).build();
        c1.setId("c1");
        Component c2 = Component.builder().name("UntestedComponent").type(ComponentType.CLASS).criticality(Criticality.CRITICAL).build();
        c2.setId("c2");

        Component t1 = Component.builder().name("TestOnlyC1").type(ComponentType.TEST).criticality(Criticality.HIGH).build();
        t1.setId("t1");

        Map<String, Component> lookup = Map.of("c1", c1, "c2", c2, "t1", t1);
        List<TestCoverage> coverages = List.of(
                TestCoverage.builder().testComponent(t1).targetComponent(c1).build()
        );

        Set<String> affected = Set.of("c1", "c2");

        RegressionTestSelectionResult result = selector.selectGreedy(affected, coverages, lookup);

        assertEquals(1, result.getCoveredComponentCount());
        assertEquals(1, result.getUncoveredComponentCount());
        assertEquals(50.0, result.getTestCoveragePercent());
        assertTrue(result.getUncoveredComponentIds().contains("c2"));
        assertTrue(result.getUncoveredComponentNames().contains("UntestedComponent"));
    }
}
