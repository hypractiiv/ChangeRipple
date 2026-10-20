package com.changeripple.history;

import com.changeripple.component.Component;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "selected_tests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SelectedTest {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_run_id", nullable = false)
    private AnalysisRun analysisRun;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_component_id", nullable = false)
    private Component testComponent;

    @Column(name = "selection_strategy", nullable = false, length = 30)
    private String selectionStrategy;

    @Column(name = "selection_rank", nullable = false)
    private int selectionRank;

    @Column(name = "covered_components_json", columnDefinition = "TEXT")
    private String coveredComponentsJson;

    @Column(name = "selection_reason", length = 255)
    private String selectionReason;

    @PrePersist
    public void init() {
        if (this.id == null || this.id.isBlank()) {
            this.id = UUID.randomUUID().toString();
        }
    }
}
