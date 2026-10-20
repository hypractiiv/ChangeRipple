package com.changeripple.dependency;

import com.changeripple.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Dependency Graph", description = "Endpoints for managing directed dependencies, graph views, and test coverage sets")
public class DependencyController {

    private final DependencyService dependencyService;

    @GetMapping("/projects/{projectId}/graph")
    @Operation(summary = "Get full interactive dependency graph representation for a project")
    public ResponseEntity<ApiResponse<GraphResponse>> getProjectGraph(@PathVariable String projectId) {
        GraphResponse response = dependencyService.getProjectGraph(projectId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/projects/{projectId}/dependencies")
    @Operation(summary = "Create a directed dependency edge (Requires ADMIN or OWNER)")
    public ResponseEntity<ApiResponse<DependencyResponse>> createDependency(
            @PathVariable String projectId,
            @Valid @RequestBody DependencyRequest request) {
        DependencyResponse response = dependencyService.createDependency(projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Dependency created successfully", response));
    }

    @DeleteMapping("/dependencies/{dependencyId}")
    @Operation(summary = "Delete a dependency edge (Requires ADMIN or OWNER)")
    public ResponseEntity<ApiResponse<Void>> deleteDependency(@PathVariable String dependencyId) {
        dependencyService.deleteDependency(dependencyId);
        return ResponseEntity.ok(ApiResponse.ok("Dependency deleted successfully", null));
    }

    @GetMapping("/components/{componentId}/dependencies")
    @Operation(summary = "Get incoming and outgoing dependencies for a specific component")
    public ResponseEntity<ApiResponse<Map<String, List<DependencyResponse>>>> getComponentDependencies(
            @PathVariable String componentId) {
        Map<String, List<DependencyResponse>> response = dependencyService.getComponentDependencies(componentId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/projects/{projectId}/test-coverages")
    @Operation(summary = "Get test coverage mappings for a project")
    public ResponseEntity<ApiResponse<List<TestCoverageResponse>>> getTestCoverages(@PathVariable String projectId) {
        List<TestCoverageResponse> response = dependencyService.getTestCoverages(projectId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/projects/{projectId}/test-coverages")
    @Operation(summary = "Create a test coverage mapping (Requires ADMIN or OWNER)")
    public ResponseEntity<ApiResponse<TestCoverageResponse>> createTestCoverage(
            @PathVariable String projectId,
            @Valid @RequestBody TestCoverageRequest request) {
        TestCoverageResponse response = dependencyService.createTestCoverage(projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Test coverage created successfully", response));
    }

    @DeleteMapping("/test-coverages/{coverageId}")
    @Operation(summary = "Delete a test coverage mapping (Requires ADMIN or OWNER)")
    public ResponseEntity<ApiResponse<Void>> deleteTestCoverage(@PathVariable String coverageId) {
        dependencyService.deleteTestCoverage(coverageId);
        return ResponseEntity.ok(ApiResponse.ok("Test coverage deleted successfully", null));
    }
}
