package com.changeripple.component;

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

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Components", description = "Endpoints for managing software components (Modules, Classes, APIs, Requirements, Tests)")
public class ComponentController {

    private final ComponentService componentService;

    @GetMapping("/projects/{projectId}/components")
    @Operation(summary = "List components in a project with filtering and pagination")
    public ResponseEntity<ApiResponse<PagedResponse<ComponentResponse>>> getComponents(
            @PathVariable String projectId,
            @RequestParam(required = false) ComponentType type,
            @RequestParam(required = false) Criticality criticality,
            @RequestParam(required = false) String search,
            @PageableDefault(sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        PagedResponse<ComponentResponse> response = componentService.getComponents(projectId, type, criticality, search, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/projects/{projectId}/components")
    @Operation(summary = "Create a new component in a project (Requires ADMIN or OWNER)")
    public ResponseEntity<ApiResponse<ComponentResponse>> createComponent(
            @PathVariable String projectId,
            @Valid @RequestBody ComponentRequest request) {
        ComponentResponse response = componentService.createComponent(projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Component created successfully", response));
    }

    @GetMapping("/components/{componentId}")
    @Operation(summary = "Get component details by ID")
    public ResponseEntity<ApiResponse<ComponentResponse>> getComponent(@PathVariable String componentId) {
        ComponentResponse response = componentService.getComponent(componentId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PatchMapping("/components/{componentId}")
    @Operation(summary = "Update an existing component (Requires ADMIN or OWNER)")
    public ResponseEntity<ApiResponse<ComponentResponse>> updateComponent(
            @PathVariable String componentId,
            @Valid @RequestBody ComponentRequest request) {
        ComponentResponse response = componentService.updateComponent(componentId, request);
        return ResponseEntity.ok(ApiResponse.ok("Component updated successfully", response));
    }

    @DeleteMapping("/components/{componentId}")
    @Operation(summary = "Delete a component (Requires ADMIN or OWNER)")
    public ResponseEntity<ApiResponse<Void>> deleteComponent(@PathVariable String componentId) {
        componentService.deleteComponent(componentId);
        return ResponseEntity.ok(ApiResponse.ok("Component deleted successfully", null));
    }
}
