package com.changeripple.dependency;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DependencyResponse {

    private String id;
    private String projectId;
    private String sourceComponentId;
    private String sourceComponentName;
    private String targetComponentId;
    private String targetComponentName;
    private DependencyType dependencyType;
    private String description;
    private Instant createdAt;
}
