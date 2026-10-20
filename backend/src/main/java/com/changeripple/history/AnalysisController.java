package com.changeripple.history;

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
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Change Impact Analysis", description = "Endpoints for executing graph impact analysis, retrieving explainable risk scores, and comparing historical runs")
public class AnalysisController {

    private final AnalysisService analysisService;

    @PostMapping("/changes/{changeId}/analyses")
    @Operation(summary = "Execute graph impact analysis and intelligent regression-test selection for a change request")
    public ResponseEntity<ApiResponse<AnalysisDetailDto>> runAnalysis(@PathVariable String changeId) {
        AnalysisDetailDto response = analysisService.runAnalysis(changeId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Impact analysis executed successfully", response));
    }

    @GetMapping("/analyses/{analysisId}")
    @Operation(summary = "Get complete analysis run details including impact results and test suites")
    public ResponseEntity<ApiResponse<AnalysisDetailDto>> getAnalysis(@PathVariable String analysisId) {
        AnalysisDetailDto response = analysisService.getAnalysis(analysisId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/analyses/{analysisId}/results")
    @Operation(summary = "Get list of affected components with explainable risk scores for an analysis run")
    public ResponseEntity<ApiResponse<List<ImpactResultDto>>> getAnalysisResults(@PathVariable String analysisId) {
        List<ImpactResultDto> response = analysisService.getAnalysisResults(analysisId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/analyses/{analysisId}/tests")
    @Operation(summary = "Get selected regression tests for an analysis run by strategy (BASIC or GREEDY)")
    public ResponseEntity<ApiResponse<List<SelectedTestResponseDto>>> getAnalysisTests(
            @PathVariable String analysisId,
            @RequestParam(defaultValue = "GREEDY") String strategy) {
        List<SelectedTestResponseDto> response = analysisService.getAnalysisTests(analysisId, strategy);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/projects/{projectId}/analyses")
    @Operation(summary = "List historical analysis runs for a project with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<AnalysisRunSummaryDto>>> getProjectAnalyses(
            @PathVariable String projectId,
            @PageableDefault(sort = "executedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PagedResponse<AnalysisRunSummaryDto> response = analysisService.getProjectAnalyses(projectId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/analyses/compare")
    @Operation(summary = "Compare two historical analysis runs and compute component, risk, and test suite diffs")
    public ResponseEntity<ApiResponse<HistoryCompareResponse>> compareAnalyses(
            @Valid @RequestBody HistoryCompareRequest request) {
        HistoryCompareResponse response = analysisService.compareAnalyses(request);
        return ResponseEntity.ok(ApiResponse.ok("Analysis comparison generated successfully", response));
    }
}
