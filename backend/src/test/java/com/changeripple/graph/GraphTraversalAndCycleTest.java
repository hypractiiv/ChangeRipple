package com.changeripple.graph;

import com.changeripple.component.ComponentType;
import com.changeripple.component.Criticality;
import com.changeripple.dependency.DependencyType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class GraphTraversalAndCycleTest {

    @Test
    @DisplayName("A -> B implies A depends on B: When B changes, incoming edge reveals A as affected")
    void testReverseEdgeConvention() {
        DirectedGraph graph = new DirectedGraph();

        GraphNode compA = GraphNode.builder().id("A").name("OrderService").type(ComponentType.CLASS).criticality(Criticality.HIGH).build();
        GraphNode compB = GraphNode.builder().id("B").name("OrderRepository").type(ComponentType.CLASS).criticality(Criticality.CRITICAL).build();

        graph.addNode(compA);
        graph.addNode(compB);

        // A -> B: A depends on B
        graph.addEdge(GraphEdge.builder().id("e1").sourceId("A").targetId("B").dependencyType(DependencyType.RUNTIME).build());

        // B has incoming edge from A
        Set<GraphEdge> incomingToB = graph.getIncomingEdges("B");
        assertEquals(1, incomingToB.size());
        assertEquals("A", incomingToB.iterator().next().getSourceId());

        // A has outgoing edge to B
        Set<GraphEdge> outgoingFromA = graph.getOutgoingEdges("A");
        assertEquals(1, outgoingFromA.size());
        assertEquals("B", outgoingFromA.iterator().next().getTargetId());
    }

    @Test
    @DisplayName("Self-dependencies are strictly prevented")
    void testSelfDependencyDisallowed() {
        DirectedGraph graph = new DirectedGraph();
        GraphNode compA = GraphNode.builder().id("A").name("NodeA").type(ComponentType.CLASS).criticality(Criticality.LOW).build();
        graph.addNode(compA);

        assertThrows(IllegalArgumentException.class, () ->
                graph.addEdge(GraphEdge.builder().id("e-self").sourceId("A").targetId("A").dependencyType(DependencyType.RUNTIME).build()));
    }

    @Test
    @DisplayName("Cycle detection accurately discovers circular dependency loops")
    void testCycleDetection() {
        DirectedGraph graph = new DirectedGraph();

        graph.addNode(GraphNode.builder().id("N1").name("Module1").type(ComponentType.MODULE).criticality(Criticality.MEDIUM).build());
        graph.addNode(GraphNode.builder().id("N2").name("Module2").type(ComponentType.MODULE).criticality(Criticality.MEDIUM).build());
        graph.addNode(GraphNode.builder().id("N3").name("Module3").type(ComponentType.MODULE).criticality(Criticality.MEDIUM).build());

        // N1 -> N2 -> N3 -> N1 (Cycle)
        graph.addEdge(GraphEdge.builder().id("e1").sourceId("N1").targetId("N2").dependencyType(DependencyType.RUNTIME).build());
        graph.addEdge(GraphEdge.builder().id("e2").sourceId("N2").targetId("N3").dependencyType(DependencyType.RUNTIME).build());
        graph.addEdge(GraphEdge.builder().id("e3").sourceId("N3").targetId("N1").dependencyType(DependencyType.RUNTIME).build());

        assertTrue(CycleDetector.hasCycle(graph));
        List<List<String>> cycles = CycleDetector.findCycles(graph);
        assertFalse(cycles.isEmpty());
    }

    @Test
    @DisplayName("Acyclic Directed Graph passes cycle detector without false positives")
    void testAcyclicGraphPasses() {
        DirectedGraph graph = new DirectedGraph();

        graph.addNode(GraphNode.builder().id("A").name("A").type(ComponentType.CLASS).criticality(Criticality.LOW).build());
        graph.addNode(GraphNode.builder().id("B").name("B").type(ComponentType.CLASS).criticality(Criticality.LOW).build());
        graph.addNode(GraphNode.builder().id("C").name("C").type(ComponentType.CLASS).criticality(Criticality.LOW).build());

        // A -> B, B -> C
        graph.addEdge(GraphEdge.builder().id("e1").sourceId("A").targetId("B").dependencyType(DependencyType.RUNTIME).build());
        graph.addEdge(GraphEdge.builder().id("e2").sourceId("B").targetId("C").dependencyType(DependencyType.RUNTIME).build());

        assertFalse(CycleDetector.hasCycle(graph));
    }
}
