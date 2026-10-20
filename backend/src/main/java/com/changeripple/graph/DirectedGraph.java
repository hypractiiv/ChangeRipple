package com.changeripple.graph;

import lombok.Getter;

import java.util.*;

/**
 * Deterministic In-Memory Directed Graph representation.
 * Edge convention: A -> B means "Component A depends on Component B".
 *
 * Impact propagation:
 * When B is modified, any node A that depends on B is affected.
 * Therefore, dependents are reached by traversing INCOMING edges (B <- A).
 */
@Getter
public class DirectedGraph {

    private final Map<String, GraphNode> nodes = new LinkedHashMap<>();
    private final Map<String, Set<GraphEdge>> outgoingEdges = new LinkedHashMap<>();
    private final Map<String, Set<GraphEdge>> incomingEdges = new LinkedHashMap<>();

    public void addNode(GraphNode node) {
        if (node != null && node.getId() != null) {
            nodes.put(node.getId(), node);
            outgoingEdges.putIfAbsent(node.getId(), new LinkedHashSet<>());
            incomingEdges.putIfAbsent(node.getId(), new LinkedHashSet<>());
        }
    }

    public void addEdge(GraphEdge edge) {
        if (edge == null || edge.getSourceId() == null || edge.getTargetId() == null) {
            return;
        }

        // Self-loops disallowed
        if (edge.getSourceId().equals(edge.getTargetId())) {
            throw new IllegalArgumentException("Self-dependency is not allowed: " + edge.getSourceId());
        }

        outgoingEdges.computeIfAbsent(edge.getSourceId(), k -> new LinkedHashSet<>()).add(edge);
        incomingEdges.computeIfAbsent(edge.getTargetId(), k -> new LinkedHashSet<>()).add(edge);
    }

    public GraphNode getNode(String id) {
        return nodes.get(id);
    }

    public Collection<GraphNode> getAllNodes() {
        return Collections.unmodifiableCollection(nodes.values());
    }

    public Set<GraphEdge> getAllEdges() {
        Set<GraphEdge> all = new LinkedHashSet<>();
        outgoingEdges.values().forEach(all::addAll);
        return Collections.unmodifiableSet(all);
    }

    /**
     * Components that source depends on (outgoing: source -> target).
     */
    public Set<GraphEdge> getOutgoingEdges(String nodeId) {
        return outgoingEdges.getOrDefault(nodeId, Collections.emptySet());
    }

    /**
     * Components that depend on target (incoming: source -> target).
     * This is the exact set used for propagating change impact!
     */
    public Set<GraphEdge> getIncomingEdges(String nodeId) {
        return incomingEdges.getOrDefault(nodeId, Collections.emptySet());
    }

    public Set<String> getDependents(String nodeId) {
        Set<String> result = new LinkedHashSet<>();
        for (GraphEdge edge : getIncomingEdges(nodeId)) {
            result.add(edge.getSourceId());
        }
        return result;
    }

    public Set<String> getDependencies(String nodeId) {
        Set<String> result = new LinkedHashSet<>();
        for (GraphEdge edge : getOutgoingEdges(nodeId)) {
            result.add(edge.getTargetId());
        }
        return result;
    }

    /**
     * Total downstream dependents count:
     * Counts how many distinct components directly or transitively depend on this component.
     */
    public int calculateBlastRadiusCount(String nodeId) {
        Set<String> visited = new HashSet<>();
        Queue<String> queue = new ArrayDeque<>();
        queue.add(nodeId);
        visited.add(nodeId);

        while (!queue.isEmpty()) {
            String current = queue.poll();
            for (GraphEdge edge : getIncomingEdges(current)) {
                String dependent = edge.getSourceId();
                if (visited.add(dependent)) {
                    queue.add(dependent);
                }
            }
        }

        // Subtract self
        return Math.max(0, visited.size() - 1);
    }
}
