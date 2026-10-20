package com.changeripple.analysis;

import com.changeripple.change.ChangeCategory;
import com.changeripple.change.ChangeSeverity;
import com.changeripple.component.ComponentType;
import com.changeripple.component.Criticality;
import com.changeripple.dependency.DependencyType;
import com.changeripple.graph.DirectedGraph;
import com.changeripple.graph.GraphEdge;
import com.changeripple.graph.GraphNode;
import com.changeripple.risk.RiskScoringEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ImpactAnalysisEngineTest {

    private ImpactAnalysisEngine engine;

    @BeforeEach
    void setUp() {
        RiskScoringEngine riskEngine = new RiskScoringEngine();
        engine = new ImpactAnalysisEngine(riskEngine);
    }

    @Test
    @DisplayName("Impact propagation correctly traverses incoming edges and separates direct from transitive dependents")
    void testImpactPropagationAndPathReconstruction() {
        DirectedGraph graph = new DirectedGraph();

        // Pipeline: CheckoutAPI -> CheckoutController -> OrderService -> OrderRepository
        // A -> B means A depends on B.
        // Therefore:
        // CheckoutAPI depends on CheckoutController
        // CheckoutController depends on OrderService
        // OrderService depends on OrderRepository
        GraphNode repo = GraphNode.builder().id("repo").name("OrderRepository").type(ComponentType.CLASS).criticality(Criticality.CRITICAL).build();
        GraphNode svc = GraphNode.builder().id("svc").name("OrderService").type(ComponentType.CLASS).criticality(Criticality.CRITICAL).build();
        GraphNode ctrl = GraphNode.builder().id("ctrl").name("CheckoutController").type(ComponentType.CLASS).criticality(Criticality.HIGH).build();
        GraphNode api = GraphNode.builder().id("api").name("CheckoutAPI").type(ComponentType.API).criticality(Criticality.CRITICAL).build();
        GraphNode unreach = GraphNode.builder().id("other").name("IsolatedHelper").type(ComponentType.CLASS).criticality(Criticality.LOW).build();

        graph.addNode(repo);
        graph.addNode(svc);
        graph.addNode(ctrl);
        graph.addNode(api);
        graph.addNode(unreach);

        graph.addEdge(GraphEdge.builder().id("e1").sourceId("svc").targetId("repo").dependencyType(DependencyType.RUNTIME).build());
        graph.addEdge(GraphEdge.builder().id("e2").sourceId("ctrl").targetId("svc").dependencyType(DependencyType.RUNTIME).build());
        graph.addEdge(GraphEdge.builder().id("e3").sourceId("api").targetId("ctrl").dependencyType(DependencyType.RUNTIME).build());

        // When OrderRepository changes:
        ImpactAnalysisResult result = engine.analyzeImpact(
                graph,
                "repo",
                ChangeCategory.DATA_MODEL_CHANGE,
                ChangeSeverity.CRITICAL
        );

        assertNotNull(result);
        assertEquals(3, result.getTotalAffectedComponents(), "Should affect svc, ctrl, api");
        assertEquals(1, result.getDirectAffectedCount(), "Direct affected should be svc (depth 1)");
        assertEquals(2, result.getTransitiveAffectedCount(), "Transitive affected should be ctrl and api");
        assertEquals(3, result.getMaxImpactDepth(), "Max depth should be 3 (api)");

        // Check path reconstruction for api: api -> ctrl -> svc -> repo
        ImpactedNodeInfo apiInfo = result.getAffectedComponents().stream()
                .filter(c -> c.getComponentId().equals("api"))
                .findFirst().orElseThrow();
        assertEquals(3, apiInfo.getDepth());
        assertEquals(List.of("CheckoutAPI", "CheckoutController", "OrderService", "OrderRepository"), apiInfo.getShortestPathNames());

        // Check unreachable component
        assertTrue(result.getUnreachableComponentIds().contains("other"));
    }
}
