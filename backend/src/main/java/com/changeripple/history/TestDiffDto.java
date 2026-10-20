package com.changeripple.history;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestDiffDto {
    private String testComponentId;
    private String testComponentName;
    private String diffStatus; // ADDED, REMOVED, RETAINED
    private String selectionReason;
}
