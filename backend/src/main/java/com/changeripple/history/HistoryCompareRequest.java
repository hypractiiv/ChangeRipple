package com.changeripple.history;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistoryCompareRequest {

    @NotBlank(message = "Baseline run ID (runId1) is required")
    private String runId1;

    @NotBlank(message = "Comparison run ID (runId2) is required")
    private String runId2;
}
