package com.changeripple.graph;

import com.changeripple.dependency.DependencyType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Objects;

/**
 * Directed edge:
 * "sourceId -> targetId" means sourceId depends on targetId.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GraphEdge {

    private String id;
    private String sourceId;
    private String targetId;
    private DependencyType dependencyType;
    private String description;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GraphEdge graphEdge = (GraphEdge) o;
        return Objects.equals(sourceId, graphEdge.sourceId) &&
               Objects.equals(targetId, graphEdge.targetId) &&
               dependencyType == graphEdge.dependencyType;
    }

    @Override
    public int hashCode() {
        return Objects.hash(sourceId, targetId, dependencyType);
    }
}
