-- =========================================================================
-- ChangeRipple: V1 Schema Migration
-- =========================================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_project_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_members (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pm_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_pm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_pm_project_user UNIQUE (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS components (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    description TEXT,
    criticality VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    source_path VARCHAR(255),
    metadata_json TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_component_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT uk_comp_project_name UNIQUE (project_id, name)
);

CREATE INDEX idx_comp_project ON components(project_id);
CREATE INDEX idx_comp_type ON components(type);
CREATE INDEX idx_comp_criticality ON components(criticality);

CREATE TABLE IF NOT EXISTS dependencies (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    source_component_id VARCHAR(36) NOT NULL,
    target_component_id VARCHAR(36) NOT NULL,
    dependency_type VARCHAR(30) NOT NULL DEFAULT 'RUNTIME',
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dep_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_dep_source FOREIGN KEY (source_component_id) REFERENCES components(id) ON DELETE CASCADE,
    CONSTRAINT fk_dep_target FOREIGN KEY (target_component_id) REFERENCES components(id) ON DELETE CASCADE,
    CONSTRAINT uk_dep_edge UNIQUE (project_id, source_component_id, target_component_id, dependency_type)
);

CREATE INDEX idx_dep_source ON dependencies(source_component_id);
CREATE INDEX idx_dep_target ON dependencies(target_component_id);

CREATE TABLE IF NOT EXISTS test_coverages (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    test_component_id VARCHAR(36) NOT NULL,
    target_component_id VARCHAR(36) NOT NULL,
    coverage_type VARCHAR(30) NOT NULL DEFAULT 'UNIT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cov_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_cov_test FOREIGN KEY (test_component_id) REFERENCES components(id) ON DELETE CASCADE,
    CONSTRAINT fk_cov_target FOREIGN KEY (target_component_id) REFERENCES components(id) ON DELETE CASCADE,
    CONSTRAINT uk_test_cov UNIQUE (project_id, test_component_id, target_component_id)
);

CREATE INDEX idx_cov_test ON test_coverages(test_component_id);
CREATE INDEX idx_cov_target ON test_coverages(target_component_id);

CREATE TABLE IF NOT EXISTS change_requests (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    changed_component_id VARCHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(30) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    author_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cr_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_cr_component FOREIGN KEY (changed_component_id) REFERENCES components(id) ON DELETE CASCADE,
    CONSTRAINT fk_cr_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_cr_project ON change_requests(project_id);
CREATE INDEX idx_cr_status ON change_requests(status);

CREATE TABLE IF NOT EXISTS analysis_runs (
    id VARCHAR(36) PRIMARY KEY,
    change_request_id VARCHAR(36) NOT NULL,
    project_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    overall_risk_score DOUBLE NOT NULL DEFAULT 0.0,
    overall_risk_band VARCHAR(20) NOT NULL DEFAULT 'LOW',
    total_affected_components INT NOT NULL DEFAULT 0,
    direct_affected_count INT NOT NULL DEFAULT 0,
    transitive_affected_count INT NOT NULL DEFAULT 0,
    max_impact_depth INT NOT NULL DEFAULT 0,
    candidate_test_count INT NOT NULL DEFAULT 0,
    selected_test_count INT NOT NULL DEFAULT 0,
    test_suite_reduction_percent DOUBLE NOT NULL DEFAULT 0.0,
    test_coverage_percent DOUBLE NOT NULL DEFAULT 0.0,
    uncovered_component_count INT NOT NULL DEFAULT 0,
    algorithm_version VARCHAR(30) NOT NULL DEFAULT 'v1.0-bfs-greedy',
    executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ar_cr FOREIGN KEY (change_request_id) REFERENCES change_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_ar_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_ar_cr ON analysis_runs(change_request_id);
CREATE INDEX idx_ar_project ON analysis_runs(project_id);

CREATE TABLE IF NOT EXISTS impact_results (
    id VARCHAR(36) PRIMARY KEY,
    analysis_run_id VARCHAR(36) NOT NULL,
    component_id VARCHAR(36) NOT NULL,
    impact_type VARCHAR(20) NOT NULL,
    depth INT NOT NULL,
    shortest_path_json TEXT,
    downstream_dependents_count INT NOT NULL DEFAULT 0,
    risk_score DOUBLE NOT NULL,
    risk_band VARCHAR(20) NOT NULL,
    criticality_factor DOUBLE NOT NULL,
    proximity_factor DOUBLE NOT NULL,
    blast_radius_factor DOUBLE NOT NULL,
    category_factor DOUBLE NOT NULL,
    severity_factor DOUBLE NOT NULL,
    critical_req_bonus DOUBLE NOT NULL,
    explanation TEXT,
    CONSTRAINT fk_ir_run FOREIGN KEY (analysis_run_id) REFERENCES analysis_runs(id) ON DELETE CASCADE,
    CONSTRAINT fk_ir_component FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE
);

CREATE INDEX idx_ir_run ON impact_results(analysis_run_id);
CREATE INDEX idx_ir_component ON impact_results(component_id);

CREATE TABLE IF NOT EXISTS selected_tests (
    id VARCHAR(36) PRIMARY KEY,
    analysis_run_id VARCHAR(36) NOT NULL,
    test_component_id VARCHAR(36) NOT NULL,
    selection_strategy VARCHAR(30) NOT NULL,
    selection_rank INT NOT NULL,
    covered_components_json TEXT,
    selection_reason VARCHAR(255),
    CONSTRAINT fk_st_run FOREIGN KEY (analysis_run_id) REFERENCES analysis_runs(id) ON DELETE CASCADE,
    CONSTRAINT fk_st_test FOREIGN KEY (test_component_id) REFERENCES components(id) ON DELETE CASCADE
);

CREATE INDEX idx_st_run ON selected_tests(analysis_run_id);
