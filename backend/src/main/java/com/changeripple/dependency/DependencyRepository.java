package com.changeripple.dependency;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DependencyRepository extends JpaRepository<Dependency, String> {

    List<Dependency> findAllByProjectId(String projectId);

    long countByProjectId(String projectId);

    Optional<Dependency> findByIdAndProjectId(String id, String projectId);

    boolean existsByProjectIdAndSourceComponentIdAndTargetComponentIdAndDependencyType(
            String projectId, String sourceComponentId, String targetComponentId, DependencyType dependencyType);

    @Query("SELECT d FROM Dependency d WHERE d.sourceComponent.id = :componentId OR d.targetComponent.id = :componentId")
    List<Dependency> findAllConnectedToComponent(@Param("componentId") String componentId);

    List<Dependency> findAllByProjectIdAndDependencyType(String projectId, DependencyType dependencyType);

    void deleteAllBySourceComponentIdOrTargetComponentId(String sourceComponentId, String targetComponentId);
}
