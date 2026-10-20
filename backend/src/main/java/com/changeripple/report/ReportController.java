package com.changeripple.report;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analyses/{analysisId}/report")
@RequiredArgsConstructor
@Tag(name = "Reports & Exports", description = "Endpoints for exporting analysis results as Markdown and CSV reports")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/markdown")
    @Operation(summary = "Export impact analysis report as Markdown")
    public ResponseEntity<String> getMarkdownReport(@PathVariable String analysisId) {
        String markdown = reportService.getMarkdownReport(analysisId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"changeripple-report-" + analysisId + ".md\"")
                .contentType(MediaType.parseMediaType("text/markdown"))
                .body(markdown);
    }

    @GetMapping("/csv")
    @Operation(summary = "Export impacted components table as CSV")
    public ResponseEntity<String> getCsvReport(@PathVariable String analysisId) {
        String csv = reportService.getCsvReport(analysisId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"changeripple-impact-" + analysisId + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}
