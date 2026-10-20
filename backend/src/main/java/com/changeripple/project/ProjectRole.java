package com.changeripple.project;

public enum ProjectRole {
    OWNER(3),
    ADMIN(2),
    MEMBER(1);

    private final int level;

    ProjectRole(int level) {
        this.level = level;
    }

    public int getLevel() {
        return level;
    }

    public boolean satisfies(ProjectRole requiredRole) {
        return this.level >= requiredRole.getLevel();
    }
}
