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
public class TestCoverageResponse {

    private String id;
    private String projectId;
    private String testComponentId;
    private String testComponentName;
    private String targetComponentId;
    private String targetComponentName;
    private String coverageType;
    private Instant createdAt;
}
