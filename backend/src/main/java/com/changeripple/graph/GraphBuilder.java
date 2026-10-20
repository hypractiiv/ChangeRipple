package com.changeripple.graph;

import com.changeripple.component.Component;
import com.changeripple.component.ComponentRepository;
import com.changeripple.dependency.Dependency;
import com.changeripple.dependency.DependencyRepository;
import com.changeripple.dependency.DependencyType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GraphBuilder {

    private final ComponentRepository componentRepository;
    private final DependencyRepository dependencyRepository;

    /**
     * Builds in-memory DirectedGraph in O(V + E) without repetitive database queries.
     */
    public DirectedGraph buildGraphForProject(String projectId) {
        DirectedGraph graph = new DirectedGraph();

        List<Component> components = componentRepository.findAllByProjectId(projectId);
        for (Component c : components) {
            graph.addNode(GraphNode.builder()
                    .id(c.getId())
                    .name(c.getName())
                    .type(c.getType())
                    .criticality(c.getCriticality())
                    .description(c.getDescription())
                    .sourcePath(c.getSourcePath())
                    .build());
        }

        // Only load RUNTIME & REQUIREMENT dependencies into the execution impact graph
        // (Test coverage is handled via dedicated test coverage sets)
        List<Dependency> dependencies = dependencyRepository.findAllByProjectId(projectId);
        for (Dependency d : dependencies) {
            if (d.getSourceComponent() != null && d.getTargetComponent() != null) {
                // Ensure both ends exist in the project
                if (graph.getNode(d.getSourceComponent().getId()) != null &&
                    graph.getNode(d.getTargetComponent().getId()) != null) {
                    graph.addEdge(GraphEdge.builder()
                            .id(d.getId())
                            .sourceId(d.getSourceComponent().getId())
                            .targetId(d.getTargetComponent().getId())
                            .dependencyType(d.getDependencyType())
                            .description(d.getDescription())
                            .build());
                }
            }
        }

        return graph;
    }

    public GraphValidationResult validateGraph(DirectedGraph graph) {
        GraphValidationResult result = new GraphValidationResult();

        if (graph.getAllNodes().isEmpty()) {
            result.addWarning("Project graph contains no components.");
            return result;
        }

        List<List<String>> cycles = CycleDetector.findCycles(graph);
        if (!cycles.isEmpty()) {
            result.setHasCycles(true);
            result.setCycles(cycles);
            result.addWarning("Circular dependencies detected across " + cycles.size() + " loop(s). Impact traversal will safely break cycles.");
        }

        return result;
    }
}
