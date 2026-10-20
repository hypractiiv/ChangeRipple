package com.changeripple.report;

import com.changeripple.history.AnalysisDetailDto;
import com.changeripple.history.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final AnalysisService analysisService;
    private final MarkdownReportGenerator markdownReportGenerator;
    private final CsvReportGenerator csvReportGenerator;

    public String getMarkdownReport(String analysisId) {
        AnalysisDetailDto detail = analysisService.getAnalysis(analysisId);
        return markdownReportGenerator.generateMarkdown(detail);
    }

    public String getCsvReport(String analysisId) {
        AnalysisDetailDto detail = analysisService.getAnalysis(analysisId);
        return csvReportGenerator.generateCsv(detail);
    }
}
