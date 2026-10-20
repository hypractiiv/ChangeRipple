package com.changeripple.dependency;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Directed Dependency Request:
 * "sourceComponentId -> targetComponentId" means sourceComponent depends on targetComponent.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DependencyRequest {

    @NotBlank(message = "Source component ID is required")
    private String sourceComponentId;

    @NotBlank(message = "Target component ID is required")
    private String targetComponentId;

    @NotNull(message = "Dependency type is required")
    private DependencyType dependencyType;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;
}
