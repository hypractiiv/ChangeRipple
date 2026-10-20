package com.changeripple.project;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, String> {
    Optional<ProjectMember> findByProjectIdAndUserId(String projectId, String userId);
    List<ProjectMember> findAllByProjectId(String projectId);
    boolean existsByProjectIdAndUserId(String projectId, String userId);
    void deleteByProjectIdAndUserId(String projectId, String userId);
}
