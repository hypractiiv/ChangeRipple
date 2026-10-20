package com.changeripple.change;

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
@Tag(name = "Change Requests", description = "Endpoints for managing software change requests")
public class ChangeRequestController {

    private final ChangeRequestService changeRequestService;

    @GetMapping("/projects/{projectId}/changes")
    @Operation(summary = "List change requests for a project with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<ChangeRequestResponseDto>>> getChangeRequests(
            @PathVariable String projectId,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PagedResponse<ChangeRequestResponseDto> response = changeRequestService.getChangeRequests(projectId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/projects/{projectId}/changes")
    @Operation(summary = "Create a new change request")
    public ResponseEntity<ApiResponse<ChangeRequestResponseDto>> createChangeRequest(
            @PathVariable String projectId,
            @Valid @RequestBody ChangeRequestCreateDto request) {
        ChangeRequestResponseDto response = changeRequestService.createChangeRequest(projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Change request created successfully", response));
    }

    @GetMapping("/changes/{changeId}")
    @Operation(summary = "Get change request details by ID")
    public ResponseEntity<ApiResponse<ChangeRequestResponseDto>> getChangeRequest(@PathVariable String changeId) {
        ChangeRequestResponseDto response = changeRequestService.getChangeRequest(changeId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
