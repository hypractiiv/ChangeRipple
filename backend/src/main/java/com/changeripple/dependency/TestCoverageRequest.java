package com.changeripple.dependency;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestCoverageRequest {

    @NotBlank(message = "Test component ID is required")
    private String testComponentId;

    @NotBlank(message = "Target component ID is required")
    private String targetComponentId;

    @Builder.Default
    private String coverageType = "UNIT";
}
