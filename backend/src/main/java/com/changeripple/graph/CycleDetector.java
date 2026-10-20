package com.changeripple.graph;

import java.util.*;

/**
 * Cycle detection engine utilizing 3-color DFS marking.
 * Time Complexity: O(V + E)
 * Space Complexity: O(V)
 */
public class CycleDetector {

    private enum Color {
        WHITE, // Unvisited
        GRAY,  // Active in current traversal recursion stack
        BLACK  // Completed
    }

    public static boolean hasCycle(DirectedGraph graph) {
        return !findCycles(graph).isEmpty();
    }

    public static List<List<String>> findCycles(DirectedGraph graph) {
        Map<String, Color> colors = new HashMap<>();
        Map<String, String> parent = new HashMap<>();
        List<List<String>> cycles = new ArrayList<>();

        for (GraphNode node : graph.getAllNodes()) {
            colors.put(node.getId(), Color.WHITE);
        }

        for (GraphNode node : graph.getAllNodes()) {
            if (colors.get(node.getId()) == Color.WHITE) {
                dfs(node.getId(), graph, colors, parent, cycles);
            }
        }

        return cycles;
    }

    private static void dfs(String current,
                            DirectedGraph graph,
                            Map<String, Color> colors,
                            Map<String, String> parent,
                            List<List<String>> cycles) {
        colors.put(current, Color.GRAY);

        for (GraphEdge edge : graph.getOutgoingEdges(current)) {
            String neighbor = edge.getTargetId();
            Color neighborColor = colors.get(neighbor);

            if (neighborColor == Color.GRAY) {
                // Cycle detected: backtrack parent chain to reconstruct cycle
                List<String> cycle = new ArrayList<>();
                cycle.add(neighbor);
                String curr = current;
                while (curr != null && !curr.equals(neighbor)) {
                    cycle.add(curr);
                    curr = parent.get(curr);
                }
                cycle.add(neighbor);
                Collections.reverse(cycle);
                cycles.add(cycle);
            } else if (neighborColor == Color.WHITE) {
                parent.put(neighbor, current);
                dfs(neighbor, graph, colors, parent, cycles);
            }
        }

        colors.put(current, Color.BLACK);
    }
}
