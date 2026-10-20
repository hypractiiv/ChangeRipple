package com.changeripple.history;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnalysisRunRepository extends JpaRepository<AnalysisRun, String> {

    List<AnalysisRun> findAllByProjectIdOrderByExecutedAtDesc(String projectId);

    Page<AnalysisRun> findAllByProjectIdOrderByExecutedAtDesc(String projectId, Pageable pageable);

    List<AnalysisRun> findAllByChangeRequestIdOrderByExecutedAtDesc(String changeRequestId);

    Optional<AnalysisRun> findByIdAndProjectId(String id, String projectId);

    List<AnalysisRun> findTop5ByProjectIdOrderByExecutedAtDesc(String projectId);

    long countByProjectId(String projectId);
}
