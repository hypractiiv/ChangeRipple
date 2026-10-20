# ChangeRipple Testing Strategy & Test Suite Guide

ChangeRipple employs a multi-tiered automated verification strategy covering unit, integration, and UI testing across both backend and frontend codebases.

---

## 1. Backend Automated Testing

The backend test suite is built on **JUnit 5**, **Mockito**, and **Spring Boot Test** with `MockMvc`. All database interactions in the test profile execute against an in-memory **H2 Database** configured to emulate MySQL 8 dialect.

### 1.1 Test Suite Breakdown

| Test Suite | Class Name | Scope | Key Assertions / Invariants |
| :--- | :--- | :--- | :--- |
| **Impact Analysis Engine** | [`ImpactAnalysisEngineTest`](file:///e:/ChangeRipple/backend/src/test/java/com/changeripple/analysis/ImpactAnalysisEngineTest.java) | Graph Algorithms / Unit | • Reverse-edge BFS traversal correctness ($A \to B \implies$ impact $B \leftarrow A$)<br>• Shortest-path reconstruction via predecessor pointer backtracking<br>• Correct blast-radius percentage computation<br>• Graceful traversal in the presence of directed cycles without infinite recursion |
| **Risk Scoring Calibration** | [`RiskScoringEngineTest`](file:///e:/ChangeRipple/backend/src/test/java/com/changeripple/risk/RiskScoringEngineTest.java) | Math & Heuristic / Unit | • Risk score strictly calibrated to $[0, 100]$ range<br>• Weighted factors: blast radius (25%), criticality (25%), change type (20%), depth (15%), test coverage deficit (15%)<br>• Risk level thresholds: Low ($<35$), Medium ($35\text{--}69$), High ($70\text{--}89$), Critical ($\ge 90$)<br>• Natural language justification generated for all key drivers |
| **Greedy Regression Selection** | [`GreedyTestSelectorTest`](file:///e:/ChangeRipple/backend/src/test/java/com/changeripple/regression/GreedyTestSelectorTest.java) | Algorithm / Unit | • Set-cover optimization minimizes test suite execution time while achieving maximum component coverage<br>• Deterministic tie-breaking by test name<br>• Accurately reports uncovered affected components |
| **Cycle & Graph Integrity** | [`GraphTraversalAndCycleTest`](file:///e:/ChangeRipple/backend/src/test/java/com/changeripple/graph/GraphTraversalAndCycleTest.java) | Directed Graph / Unit | • 3-color DFS cycle detector flags cyclic dependencies and extracts exact cycle path<br>• Orphaned node and disconnected subgraphs handled cleanly |
| **Authentication & JWT** | [`AuthIntegrationTest`](file:///e:/ChangeRipple/backend/src/test/java/com/changeripple/auth/AuthIntegrationTest.java) | Spring Security / Integration | • User registration with BCrypt password hashing<br>• Successful login returns valid HS256 JWT<br>• Invalid credentials return 401 Unauthorized<br>• Access to secured endpoints without bearer token returns 401/403 |
| **Project-Level Authorization (IDOR)** | [`ProjectSecurityIntegrationTest`](file:///e:/ChangeRipple/backend/src/test/java/com/changeripple/project/ProjectSecurityIntegrationTest.java) | Spring Security / Integration | • IDOR prevention: Non-member access to private project returns 403 Forbidden<br>• Project owners have full edit rights; viewers have read-only access<br>• Multi-tenant project boundary integrity |

### 1.2 Running Backend Tests

Run from the command line:
```bash
cd backend
mvn test
```
Or use the launcher menu:
```cmd
run-local.bat
:: Select option [3] Run Backend Test Suite
```

---

## 2. Frontend Automated Testing

The frontend test suite is built on **Vitest**, **React Testing Library**, and **@testing-library/jest-dom** operating inside a `jsdom` simulated browser environment.

### 2.1 Test Suite Breakdown

| Component Test | Path | Invariants Verified |
| :--- | :--- | :--- |
| **Risk Gauge** | [`RiskGauge.test.tsx`](file:///e:/ChangeRipple/frontend/src/test/RiskGauge.test.tsx) | • Renders SVG arc gauge with dynamic needle angle corresponding to 0–100 score<br>• Displays numeric score, status badge, and calibrated color coding (Emerald, Amber, Orange, Rose)<br>• Renders driver contribution breakdown breakdown bars |
| **Regression Test Optimizer** | [`RegressionTestView.test.tsx`](file:///e:/ChangeRipple/frontend/src/test/RegressionTestView.test.tsx) | • Displays recommended test suites with duration and coverage metrics<br>• Allows toggling between Greedy Set-Cover and All Tests mode<br>• Renders uncovered component warnings if coverage gaps exist<br>• Exports CSV and Markdown artifacts |

### 2.2 Running Frontend Tests

Run from the command line:
```bash
cd frontend
npm test
```
Or use the launcher menu:
```cmd
run-local.bat
:: Select option [4] Run Frontend Test Suite
```

---

## 3. Presets & End-to-End Demonstration Verification

ChangeRipple includes 4 built-in system presets for zero-friction demonstration. Evaluators can load these presets via the **Demo Presets** button in the top navigation bar:

1. **CloudCommerce Core**: 15 components across 3 tiers (API Gateway, Order Service, Payment Gateway, Kafka Event Bus, Postgres DB). Demonstrates reverse-edge blast radius when `order-service` is modified.
2. **FinTech High-Risk Ledger**: High-criticality financial accounting ledger with cyclical transactions. Demonstrates cycle detection and Critical Risk ($>90$) categorization.
3. **Microservices Circular Pipeline**: Multi-service pipeline with intentional circular dependencies. Validates Cycle Detector warnings and impact mitigation recommendations.
4. **Minimal Fast Demo**: 4-node canonical graph ($A \to B \to C \to D$) for fast algorithmic tracing and mathematical verification.
