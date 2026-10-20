package com.changeripple.component;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComponentRequest {

    @NotBlank(message = "Component name is required")
    @Size(min = 2, max = 100, message = "Component name must be between 2 and 100 characters")
    private String name;

    @NotNull(message = "Component type is required")
    private ComponentType type;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    @NotNull(message = "Criticality level is required")
    private Criticality criticality;

    @Size(max = 255, message = "Source path cannot exceed 255 characters")
    private String sourcePath;

    private String metadataJson;
}
