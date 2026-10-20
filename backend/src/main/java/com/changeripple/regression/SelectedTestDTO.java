package com.changeripple.regression;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SelectedTestDTO {

    private String testComponentId;
    private String testComponentName;
    private int selectionRank;

    @Builder.Default
    private List<String> coveredComponentIds = new ArrayList<>();

    @Builder.Default
    private List<String> coveredComponentNames = new ArrayList<>();

    private String selectionReason;
}
