package com.changeripple.preset;

import com.changeripple.common.ApiResponse;
import com.changeripple.history.AnalysisDetailDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/presets")
@RequiredArgsConstructor
@Tag(name = "Demonstration Presets", description = "Endpoints for quick-loading demonstration change scenarios")
public class PresetDemoController {

    private final PresetDemoService presetDemoService;

    @GetMapping
    @Operation(summary = "List all available demonstration presets")
    public ResponseEntity<ApiResponse<List<PresetInfo>>> getPresets() {
        List<PresetInfo> list = presetDemoService.getAvailablePresets();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/load/{presetKey}")
    @Operation(summary = "Load and execute a demonstration preset instantly")
    public ResponseEntity<ApiResponse<AnalysisDetailDto>> loadPreset(@PathVariable String presetKey) {
        AnalysisDetailDto result = presetDemoService.loadAndExecutePreset(presetKey);
        return ResponseEntity.ok(ApiResponse.ok("Preset executed successfully", result));
    }
}
