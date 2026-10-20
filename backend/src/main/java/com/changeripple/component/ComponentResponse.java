package com.changeripple.component;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComponentResponse {

    private String id;
    private String projectId;
    private String projectName;
    private String name;
    private ComponentType type;
    private String description;
    private Criticality criticality;
    private String sourcePath;
    private String metadataJson;
    private int incomingDependencyCount; // Number of components that depend on this
    private int outgoingDependencyCount; // Number of components this depends on
    private Instant createdAt;
    private Instant updatedAt;
}
