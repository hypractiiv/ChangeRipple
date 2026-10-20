package com.changeripple.component;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComponentRepository extends JpaRepository<Component, String> {

    List<Component> findAllByProjectId(String projectId);

    Page<Component> findAllByProjectId(String projectId, Pageable pageable);

    @Query("SELECT c FROM Component c WHERE c.project.id = :projectId " +
            "AND (:type IS NULL OR c.type = :type) " +
            "AND (:criticality IS NULL OR c.criticality = :criticality) " +
            "AND (:search IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Component> findFiltered(@Param("projectId") String projectId,
                                 @Param("type") ComponentType type,
                                 @Param("criticality") Criticality criticality,
                                 @Param("search") String search,
                                 Pageable pageable);

    Optional<Component> findByIdAndProjectId(String id, String projectId);

    boolean existsByProjectIdAndName(String projectId, String name);

    long countByProjectId(String projectId);

    List<Component> findAllByProjectIdAndType(String projectId, ComponentType type);
}
