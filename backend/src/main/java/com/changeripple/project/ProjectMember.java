package com.changeripple.project;

import com.changeripple.auth.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "project_members", uniqueConstraints = {
        @UniqueConstraint(name = "uk_pm_project_user", columnNames = {"project_id", "user_id"})
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectMember {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private ProjectRole role;

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
