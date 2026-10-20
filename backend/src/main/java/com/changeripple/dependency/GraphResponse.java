package com.changeripple.dependency;

import com.changeripple.component.ComponentResponse;
import com.changeripple.graph.GraphValidationResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GraphResponse {

    private String projectId;
    private String projectName;

    @Builder.Default
    private List<ComponentResponse> nodes = new ArrayList<>();

    @Builder.Default
    private List<DependencyResponse> edges = new ArrayList<>();

    private GraphValidationResult validation;
}
