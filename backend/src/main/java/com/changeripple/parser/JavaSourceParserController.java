package com.changeripple.parser;

import com.changeripple.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/import")
@RequiredArgsConstructor
@Tag(name = "Java Source Importer", description = "Endpoints for static Java source code AST parsing and architecture extraction")
public class JavaSourceParserController {

    private final JavaSourceParserService parserService;

    @Data
    public static class SourceParseRequest {
        private String fileName;
        private String sourceCode;
    }

    @PostMapping("/preview")
    @Operation(summary = "Parse Java source code and preview detected components and import dependencies")
    public ResponseEntity<ApiResponse<ParsedProjectPreviewDto>> previewSource(
            @PathVariable String projectId,
            @RequestBody SourceParseRequest request) {
        ParsedProjectPreviewDto preview = parserService.parseSourceCode(request.getFileName(), request.getSourceCode());
        return ResponseEntity.ok(ApiResponse.ok("Source code parsed successfully", preview));
    }

    @PostMapping("/apply")
    @Operation(summary = "Apply previewed components and dependencies to the project without overwriting")
    public ResponseEntity<ApiResponse<Map<String, Object>>> applyImport(
            @PathVariable String projectId,
            @RequestBody ParsedProjectPreviewDto preview) {
        Map<String, Object> result = parserService.applyImport(projectId, preview);
        return ResponseEntity.ok(ApiResponse.ok("Import applied successfully", result));
    }
}
