package com.changeripple.change;

import lombok.Getter;

@Getter
public enum ChangeSeverity {
    LOW(0.0),
    MEDIUM(6.0),
    HIGH(12.0),
    CRITICAL(18.0);

    private final double weight;

    ChangeSeverity(double weight) {
        this.weight = weight;
    }
}
