package com.changeripple.history;

import com.changeripple.change.ChangeRequest;
import com.changeripple.project.Project;
import com.changeripple.risk.RiskBand;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "analysis_runs")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisRun {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "change_request_id", nullable = false)
    private ChangeRequest changeRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "COMPLETED";

    @Column(name = "overall_risk_score", nullable = false)
    private double overallRiskScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "overall_risk_band", nullable = false, length = 20)
    private RiskBand overallRiskBand;

    @Column(name = "total_affected_components", nullable = false)
    private int totalAffectedComponents;

    @Column(name = "direct_affected_count", nullable = false)
    private int directAffectedCount;

    @Column(name = "transitive_affected_count", nullable = false)
    private int transitiveAffectedCount;

    @Column(name = "max_impact_depth", nullable = false)
    private int maxImpactDepth;

    @Column(name = "candidate_test_count", nullable = false)
    private int candidateTestCount;

    @Column(name = "selected_test_count", nullable = false)
    private int selectedTestCount;

    @Column(name = "test_suite_reduction_percent", nullable = false)
    private double testSuiteReductionPercent;

    @Column(name = "test_coverage_percent", nullable = false)
    private double testCoveragePercent;

    @Column(name = "uncovered_component_count", nullable = false)
    private int uncoveredComponentCount;

    @Column(name = "algorithm_version", nullable = false, length = 30)
    @Builder.Default
    private String algorithmVersion = "v1.0-bfs-greedy";

    @CreatedDate
    @Column(name = "executed_at", nullable = false, updatable = false)
    private Instant executedAt;

    @OneToMany(mappedBy = "analysisRun", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ImpactResult> impactResults = new ArrayList<>();

    @OneToMany(mappedBy = "analysisRun", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SelectedTest> selectedTests = new ArrayList<>();

    @PrePersist
    public void init() {
        if (this.id == null || this.id.isBlank()) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.executedAt == null) {
            this.executedAt = Instant.now();
        }
    }
}
