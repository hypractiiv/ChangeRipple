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
 * Directed Dependency edge:
 * "Component A -> Component B" means "Component A depends on Component B".
 * When B changes, A is potentially affected.
 */
@Entity
@Table(name = "dependencies", uniqueConstraints = {
        @UniqueConstraint(name = "uk_dep_edge", columnNames = {"project_id", "source_component_id", "target_component_id", "dependency_type"})
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dependency {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_component_id", nullable = false)
    private Component sourceComponent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_component_id", nullable = false)
    private Component targetComponent;

    @Enumerated(EnumType.STRING)
    @Column(name = "dependency_type", nullable = false, length = 30)
    @Builder.Default
    private DependencyType dependencyType = DependencyType.RUNTIME;

    @Column(name = "description", length = 255)
    private String description;

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
