package com.changeripple.risk;

public enum RiskBand {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL;

    public static RiskBand fromScore(double score) {
        if (score >= 80.0) {
            return CRITICAL;
        } else if (score >= 60.0) {
            return HIGH;
        } else if (score >= 30.0) {
            return MEDIUM;
        } else {
            return LOW;
        }
    }
}
