package com.changeripple.dependency;

import com.changeripple.component.Component;
import com.changeripple.project.Project;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Explicit Test -> Runtime Component coverage mapping.
 * Keeps test coverage relationships logically distinct from runtime dependencies.
 */
@Entity
@Table(name = "test_coverages", uniqueConstraints = {
        @UniqueConstraint(name = "uk_test_cov", columnNames = {"project_id", "test_component_id", "target_component_id"})
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCoverage {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_component_id", nullable = false)
    private Component testComponent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_component_id", nullable = false)
    private Component targetComponent;

    @Column(name = "coverage_type", nullable = false, length = 30)
    @Builder.Default
    private String coverageType = "UNIT";

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void init() {
        if (this.id == null || this.id.isBlank()) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }
}
