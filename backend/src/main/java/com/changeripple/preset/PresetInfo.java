package com.changeripple.preset;

import com.changeripple.change.ChangeCategory;
import com.changeripple.change.ChangeSeverity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresetInfo {
    private String key;
    private String title;
    private String description;
    private String componentName;
    private ChangeCategory category;
    private ChangeSeverity severity;
    private String expectedOutcome;
}
