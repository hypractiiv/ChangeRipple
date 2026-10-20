package com.changeripple.component;

import com.changeripple.common.BaseEntity;
import com.changeripple.project.Project;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "components", uniqueConstraints = {
        @UniqueConstraint(name = "uk_comp_project_name", columnNames = {"project_id", "name"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Component extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private ComponentType type;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "criticality", nullable = false, length = 20)
    @Builder.Default
    private Criticality criticality = Criticality.MEDIUM;

    @Column(name = "source_path", length = 255)
    private String sourcePath;

    @Column(name = "metadata_json", columnDefinition = "TEXT")
    private String metadataJson;
}
