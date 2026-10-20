package com.changeripple.project;

import com.changeripple.common.ApiResponse;
import com.changeripple.common.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Endpoints for managing projects and team memberships")
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    @Operation(summary = "List all projects accessible to the authenticated user")
    public ResponseEntity<ApiResponse<PagedResponse<ProjectResponse>>> getProjects(
            @RequestParam(required = false) String search,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PagedResponse<ProjectResponse> response = projectService.getProjects(search, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    @Operation(summary = "Create a new project")
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(@Valid @RequestBody ProjectRequest request) {
        ProjectResponse response = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Project created successfully", response));
    }

    @GetMapping("/{projectId}")
    @Operation(summary = "Get project details by ID")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProject(@PathVariable String projectId) {
        ProjectResponse response = projectService.getProject(projectId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PatchMapping("/{projectId}")
    @Operation(summary = "Update an existing project (Requires ADMIN or OWNER)")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable String projectId,
            @Valid @RequestBody ProjectRequest request) {
        ProjectResponse response = projectService.updateProject(projectId, request);
        return ResponseEntity.ok(ApiResponse.ok("Project updated successfully", response));
    }

    @DeleteMapping("/{projectId}")
    @Operation(summary = "Delete a project (Requires OWNER)")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable String projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.ok(ApiResponse.ok("Project deleted successfully", null));
    }

    @GetMapping("/{projectId}/members")
    @Operation(summary = "List all team members of a project")
    public ResponseEntity<ApiResponse<List<ProjectMemberResponse>>> getMembers(@PathVariable String projectId) {
        List<ProjectMemberResponse> members = projectService.getMembers(projectId);
        return ResponseEntity.ok(ApiResponse.ok(members));
    }

    @PostMapping("/{projectId}/members")
    @Operation(summary = "Add or update a project member role")
    public ResponseEntity<ApiResponse<ProjectMemberResponse>> addOrUpdateMember(
            @PathVariable String projectId,
            @Valid @RequestBody AddMemberRequest request) {
        ProjectMemberResponse response = projectService.addOrUpdateMember(projectId, request);
        return ResponseEntity.ok(ApiResponse.ok("Project member updated successfully", response));
    }

    @DeleteMapping("/{projectId}/members/{userId}")
    @Operation(summary = "Remove a member from the project")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable String projectId,
            @PathVariable String userId) {
        projectService.removeMember(projectId, userId);
        return ResponseEntity.ok(ApiResponse.ok("Member removed successfully", null));
    }
}
