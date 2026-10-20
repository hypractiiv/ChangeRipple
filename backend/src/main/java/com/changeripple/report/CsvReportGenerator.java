package com.changeripple.report;

import com.changeripple.history.AnalysisDetailDto;
import com.changeripple.history.ImpactResultDto;
import org.springframework.stereotype.Component;

@Component
public class CsvReportGenerator {

    public String generateCsv(AnalysisDetailDto detail) {
        StringBuilder sb = new StringBuilder();

        // CSV Header
        sb.append("ComponentId,ComponentName,ComponentType,Criticality,ImpactType,Depth,RiskScore,RiskBand,BlastRadiusCount,ShortestPath,Explanation\n");

        for (ImpactResultDto ir : detail.getImpactResults()) {
            sb.append(escape(ir.getComponentId())).append(",");
            sb.append(escape(ir.getComponentName())).append(",");
            sb.append(escape(ir.getComponentType().name())).append(",");
            sb.append(escape(ir.getCriticality().name())).append(",");
            sb.append(escape(ir.getImpactType().name())).append(",");
            sb.append(ir.getDepth()).append(",");
            sb.append(String.format("%.1f", ir.getRiskScore())).append(",");
            sb.append(escape(ir.getRiskBand().name())).append(",");
            sb.append(ir.getDownstreamDependentsCount()).append(",");
            sb.append(escape(String.join(" -> ", ir.getShortestPath()))).append(",");
            sb.append(escape(ir.getExplanation())).append("\n");
        }

        return sb.toString();
    }

    private String escape(String value) {
        if (value == null) return "\"\"";
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }
}
