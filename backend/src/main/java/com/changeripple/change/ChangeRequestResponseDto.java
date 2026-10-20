package com.changeripple.change;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangeRequestResponseDto {

    private String id;
    private String projectId;
    private String projectName;
    private String changedComponentId;
    private String changedComponentName;
    private String title;
    private String description;
    private ChangeCategory category;
    private ChangeSeverity severity;
    private AnalysisStatus status;
    private String authorId;
    private String authorName;
    private String latestAnalysisRunId;
    private Double latestRiskScore;
    private Instant createdAt;
    private Instant updatedAt;
}
