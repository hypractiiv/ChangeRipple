package com.changeripple.project;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {

    private String id;
    private String name;
    private String description;
    private String ownerId;
    private String ownerName;
    private String userRole; // Current user's role in this project
    private long componentCount;
    private long dependencyCount;
    private long changeRequestCount;
    private Instant createdAt;
    private Instant updatedAt;
}
