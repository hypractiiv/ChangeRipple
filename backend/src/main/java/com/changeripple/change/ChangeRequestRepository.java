package com.changeripple.change;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChangeRequestRepository extends JpaRepository<ChangeRequest, String> {

    List<ChangeRequest> findAllByProjectIdOrderByCreatedAtDesc(String projectId);

    Page<ChangeRequest> findAllByProjectId(String projectId, Pageable pageable);

    Optional<ChangeRequest> findByIdAndProjectId(String id, String projectId);

    long countByProjectId(String projectId);

    List<ChangeRequest> findTop5ByProjectIdOrderByCreatedAtDesc(String projectId);
}
