package com.changeripple.change;

import lombok.Getter;

@Getter
public enum ChangeCategory {
    LOGIC_CHANGE(8.0, "Internal algorithmic or logic modification with unchanged signatures"),
    INTERFACE_CHANGE(15.0, "Public API or method signature alteration affecting contracts"),
    DATA_MODEL_CHANGE(18.0, "Database schema, entity mapping, or state persistence mutation"),
    CONFIGURATION_CHANGE(6.0, "Application, environment, or dependency configuration tweak"),
    SECURITY_CHANGE(20.0, "Authentication, authorization, cryptography, or token validation update");

    private final double weight;
    private final String description;

    ChangeCategory(double weight, String description) {
        this.weight = weight;
        this.description = description;
    }
}
