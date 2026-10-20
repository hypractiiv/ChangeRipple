package com.changeripple.project;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {

    @Query("SELECT p FROM Project p JOIN p.members m WHERE m.user.id = :userId")
    Page<Project> findAllByMemberUserId(@Param("userId") String userId, Pageable pageable);

    @Query("SELECT p FROM Project p JOIN p.members m WHERE m.user.id = :userId AND LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Project> searchByMemberUserIdAndName(@Param("userId") String userId, @Param("search") String search, Pageable pageable);

    Optional<Project> findByIdAndOwnerId(String id, String ownerId);
}
