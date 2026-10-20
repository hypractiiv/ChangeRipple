package com.changeripple.parser;

import com.changeripple.component.ComponentRequest;
import com.changeripple.dependency.DependencyRequest;
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
public class ParsedProjectPreviewDto {

    private String packageName;

    @Builder.Default
    private List<ComponentRequest> detectedComponents = new ArrayList<>();

    @Builder.Default
    private List<DependencyRequest> detectedDependencies = new ArrayList<>();

    @Builder.Default
    private List<String> warnings = new ArrayList<>();
}
