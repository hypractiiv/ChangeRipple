package com.changeripple.graph;

import com.changeripple.component.ComponentType;
import com.changeripple.component.Criticality;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Objects;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GraphNode {

    private String id;
    private String name;
    private ComponentType type;
    private Criticality criticality;
    private String description;
    private String sourcePath;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GraphNode graphNode = (GraphNode) o;
        return Objects.equals(id, graphNode.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
