package com.changeripple.dependency;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestCoverageRepository extends JpaRepository<TestCoverage, String> {

    List<TestCoverage> findAllByProjectId(String projectId);

    List<TestCoverage> findAllByProjectIdAndTestComponentId(String projectId, String testComponentId);

    List<TestCoverage> findAllByProjectIdAndTargetComponentId(String projectId, String targetComponentId);

    boolean existsByProjectIdAndTestComponentIdAndTargetComponentId(
            String projectId, String testComponentId, String targetComponentId);

    Optional<TestCoverage> findByIdAndProjectId(String id, String projectId);

    void deleteAllByTestComponentIdOrTargetComponentId(String testComponentId, String targetComponentId);
}
