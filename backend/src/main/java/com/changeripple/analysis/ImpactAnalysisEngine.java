package com.changeripple.analysis;

import com.changeripple.change.ChangeCategory;
import com.changeripple.change.ChangeSeverity;
import com.changeripple.component.ComponentType;
import com.changeripple.component.Criticality;
import com.changeripple.graph.DirectedGraph;
import com.changeripple.graph.GraphEdge;
import com.changeripple.graph.GraphNode;
import com.changeripple.risk.RiskBand;
import com.changeripple.risk.RiskScoreResult;
import com.changeripple.risk.RiskScoringEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Dedicated In-Memory Graph Impact Analysis Engine.
 *
 * Traversal Rule:
 * Edge convention: "A -> B" means "Component A depends on Component B".
 * When B is modified, any node A that depends on B is affected.
 * Therefore, impact propagation traverses INCOMING edges to B (B <- A).
 *
 * Algorithmic Complexity:
 * - Traversal: O(V + E) using BFS
 * - Shortest Path Reconstruction: O(V * depth)
 * - Overall Time Complexity: O(V + E)
 * - Space Complexity: O(V)
 */
@Service
@RequiredArgsConstructor
public class ImpactAnalysisEngine {

    private final RiskScoringEngine riskScoringEngine;

    public ImpactAnalysisResult analyzeImpact(
            DirectedGraph graph,
            String changedComponentId,
            ChangeCategory changeCategory,
            ChangeSeverity changeSeverity
    ) {
        GraphNode changedNode = graph.getNode(changedComponentId);
        if (changedNode == null) {
            throw new IllegalArgumentException("Changed component not found in graph: " + changedComponentId);
        }

        int totalComponents = graph.getAllNodes().size();

        // 1. Cycle-Safe BFS Traversal on incoming edges
        Map<String, Integer> depths = new LinkedHashMap<>();
        Map<String, String> predecessorMap = new HashMap<>(); // predecessor on impact propagation path
        Queue<String> queue = new ArrayDeque<>();

        depths.put(changedComponentId, 0);
        queue.add(changedComponentId);

        while (!queue.isEmpty()) {
            String current = queue.poll();
            int currentDepth = depths.get(current);

            // Traverse incoming edges (components that depend on current)
            for (GraphEdge edge : graph.getIncomingEdges(current)) {
                String dependent = edge.getSourceId();

                if (!depths.containsKey(dependent)) {
                    depths.put(dependent, currentDepth + 1);
                    predecessorMap.put(dependent, current);
                    queue.add(dependent);
                }
            }
        }

        // 2. Identify affected components (excluding changed node itself)
        List<ImpactedNodeInfo> affectedList = new ArrayList<>();
        List<String> criticalRequirementsImpacted = new ArrayList<>();
        int directCount = 0;
        int transitiveCount = 0;
        int maxDepth = 0;
        double maxRiskScore = 0.0;

        for (Map.Entry<String, Integer> entry : depths.entrySet()) {
            String componentId = entry.getKey();
            int depth = entry.getValue();

            if (componentId.equals(changedComponentId)) {
                continue; // Do not include changed component in affected list
            }

            GraphNode node = graph.getNode(componentId);
            if (node == null) continue;

            ImpactType impactType = (depth == 1) ? ImpactType.DIRECT : ImpactType.TRANSITIVE;
            if (impactType == ImpactType.DIRECT) {
                directCount++;
            } else {
                transitiveCount++;
            }
            if (depth > maxDepth) {
                maxDepth = depth;
            }

            // 3. Reconstruct Shortest Dependency Path: from affected node to changed component
            List<String> pathIds = reconstructPath(componentId, changedComponentId, predecessorMap);
            List<String> pathNames = pathIds.stream()
                    .map(id -> {
                        GraphNode n = graph.getNode(id);
                        return n != null ? n.getName() : id;
                    })
                    .toList();

            // Downstream dependent count
            int blastRadiusCount = graph.calculateBlastRadiusCount(componentId);

            // Requirement tracking
            boolean isCriticalReq = (node.getType() == ComponentType.REQUIREMENT &&
                    (node.getCriticality() == Criticality.CRITICAL || node.getCriticality() == Criticality.HIGH));
            if (isCriticalReq) {
                criticalRequirementsImpacted.add(node.getName());
            }

            // 4. Calculate Explainable Risk Score
            RiskScoreResult riskResult = riskScoringEngine.calculateRisk(
                    node.getCriticality(),
                    node.getType(),
                    depth,
                    blastRadiusCount,
                    totalComponents,
                    changeCategory,
                    changeSeverity,
                    isCriticalReq,
                    pathNames
            );

            if (riskResult.getTotalScore() > maxRiskScore) {
                maxRiskScore = riskResult.getTotalScore();
            }

            affectedList.add(ImpactedNodeInfo.builder()
                    .componentId(node.getId())
                    .componentName(node.getName())
                    .componentType(node.getType())
                    .criticality(node.getCriticality())
                    .impactType(impactType)
                    .depth(depth)
                    .shortestPathIds(pathIds)
                    .shortestPathNames(pathNames)
                    .downstreamDependentsCount(blastRadiusCount)
                    .riskScore(riskResult.getTotalScore())
                    .riskBand(riskResult.getRiskBand())
                    .riskDetails(riskResult)
                    .explanation(riskResult.getExplanation())
                    .build());
        }

        // 5. Deterministic Result Ordering:
        // Sort by Risk Score descending, then Depth ascending, then Name alphabetically
        affectedList.sort((a, b) -> {
            int scoreCmp = Double.compare(b.getRiskScore(), a.getRiskScore());
            if (scoreCmp != 0) return scoreCmp;
            int depthCmp = Integer.compare(a.getDepth(), b.getDepth());
            if (depthCmp != 0) return depthCmp;
            return a.getComponentName().compareToIgnoreCase(b.getComponentName());
        });

        // 6. Identify Unreachable Components
        List<String> unreachable = new ArrayList<>();
        for (GraphNode node : graph.getAllNodes()) {
            if (!depths.containsKey(node.getId())) {
                unreachable.add(node.getId());
            }
        }
        Collections.sort(unreachable);

        // Overall risk band
        RiskBand overallBand = RiskBand.fromScore(maxRiskScore);

        return ImpactAnalysisResult.builder()
                .changedComponentId(changedNode.getId())
                .changedComponentName(changedNode.getName())
                .overallRiskScore(maxRiskScore)
                .overallRiskBand(overallBand)
                .totalAffectedComponents(affectedList.size())
                .directAffectedCount(directCount)
                .transitiveAffectedCount(transitiveCount)
                .maxImpactDepth(maxDepth)
                .criticalRequirementsImpacted(criticalRequirementsImpacted)
                .unreachableComponentIds(unreachable)
                .affectedComponents(affectedList)
                .build();
    }

    private List<String> reconstructPath(String sourceId, String targetId, Map<String, String> predecessorMap) {
        List<String> path = new ArrayList<>();
        String current = sourceId;
        Set<String> visitedInPath = new HashSet<>();

        while (current != null && visitedInPath.add(current)) {
            path.add(current);
            if (current.equals(targetId)) {
                break;
            }
            current = predecessorMap.get(current);
        }

        return path;
    }
}
