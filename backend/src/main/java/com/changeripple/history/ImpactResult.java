package com.changeripple.history;

import com.changeripple.analysis.ImpactType;
import com.changeripple.component.Component;
import com.changeripple.risk.RiskBand;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "impact_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImpactResult {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_run_id", nullable = false)
    private AnalysisRun analysisRun;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "component_id", nullable = false)
    private Component component;

    @Enumerated(EnumType.STRING)
    @Column(name = "impact_type", nullable = false, length = 20)
    private ImpactType impactType;

    @Column(name = "depth", nullable = false)
    private int depth;

    @Column(name = "shortest_path_json", columnDefinition = "TEXT")
    private String shortestPathJson;

    @Column(name = "downstream_dependents_count", nullable = false)
    private int downstreamDependentsCount;

    @Column(name = "risk_score", nullable = false)
    private double riskScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_band", nullable = false, length = 20)
    private RiskBand riskBand;

    @Column(name = "criticality_factor", nullable = false)
    private double criticalityFactor;

    @Column(name = "proximity_factor", nullable = false)
    private double proximityFactor;

    @Column(name = "blast_radius_factor", nullable = false)
    private double blastRadiusFactor;

    @Column(name = "category_factor", nullable = false)
    private double categoryFactor;

    @Column(name = "severity_factor", nullable = false)
    private double severityFactor;

    @Column(name = "critical_req_bonus", nullable = false)
    private double criticalReqBonus;

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    @PrePersist
    public void init() {
        if (this.id == null || this.id.isBlank()) {
            this.id = UUID.randomUUID().toString();
        }
    }
}
