package com.changeripple.history;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SelectedTestResponseDto {

    private String id;
    private String testComponentId;
    private String testComponentName;
    private String selectionStrategy;
    private int selectionRank;
    private List<String> coveredComponentIds;
    private List<String> coveredComponentNames;
    private String selectionReason;
}
