package com.changeripple.component;

import lombok.Getter;

@Getter
public enum Criticality {
    LOW(10.0),
    MEDIUM(30.0),
    HIGH(65.0),
    CRITICAL(100.0);

    private final double baseScore;

    Criticality(double baseScore) {
        this.baseScore = baseScore;
    }
}
