# ChangeRipple — Advanced Software Change Impact Intelligence Platform

[![Java 21](https://img.shields.io/badge/Java-21%20LTS-007396?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React Flow](https://img.shields.io/badge/React%20Flow-12.3-FF0072)](https://reactflow.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

ChangeRipple is an enterprise-grade full-stack developer intelligence platform that models software architectures as directed dependency graphs, predicts the cascading blast radius of proposed source changes, visualizes ripple effects through an interactive graph canvas, computes explainable 0–100 heuristic risk scores, and selects an optimized regression test suite using a greedy set-cover algorithm.

---

## 🌟 Key Features

1. **Interactive Dependency Graph Visualization (`@xyflow/react` + Dagre)**:
   - Visualizes components as color-coded nodes (Services, Controllers, Repositories, Databases, Third-Party APIs, Queues) with hierarchical Dagre auto-layout.
   - Interactive zoom, pan, minimap, component inspection sidebar, and impact highlighting.
   - Distinct representation of runtime dependencies ($A \to B$) and test coverage associations ($T \to C$).

2. **Reverse-Edge Impact Propagation Engine**:
   - Directed edge $A \to B$ strictly denotes "$A$ calls/depends on $B$".
   - When component $B$ changes, impact cascades along reverse edges ($B \leftarrow A$).
   - Traversal via breadth-first search (BFS) tracking shortest propagation paths, component depths, and blast radius percentage.
   - Handles cycles gracefully via 3-color cycle detection without infinite loops.

3. **Calibrated Explainable Heuristic Risk Scoring (0–100)**:
   - Multi-factor mathematical scoring: Blast Radius (25%), Target Criticality (25%), Change Type (20%), Propagation Depth (15%), and Test Coverage Deficit (15%).
   - Transparent natural language driver explanations (e.g., *"Large blast radius: 53.3% of platform affected"*, *"Critical database change without integration test coverage"*).
   - Calibrated into 4 severity bands: Low ($0\text{--}34$), Medium ($35\text{--}69$), High ($70\text{--}89$), and Critical ($90\text{--}100$).

4. **Greedy Set-Cover Regression Test Optimizer**:
   - Compares standard execution ("Run All Affected Tests") against a greedy set-cover heuristic optimizer that maximizes component coverage while minimizing execution duration.
   - Clear visual breakdown of saved test time, test count reduction, and explicit alerts for uncovered affected components.
   - Export test plans to CSV and Markdown.

5. **Static Java AST Scanner (JavaParser)**:
   - Ingests Java source files or ZIP packages, performs static AST analysis to extract classes, interfaces, Spring annotations (`@RestController`, `@Service`, `@Repository`), and method call dependencies, automatically constructing the dependency graph.

6. **Historical Evolution & Diff Analysis**:
   - Compares previous analysis runs side-by-side to highlight newly affected components, resolved impacts, and risk score progression over time.

7. **One-Click Demonstration Presets**:
   - Includes 4 instant preset scenarios (CloudCommerce Core, FinTech High-Risk Ledger, Microservices Circular Pipeline, Minimal Fast Demo) allowing evaluators to experience full platform functionality with zero manual setup.

---

## 📐 System Architecture

ChangeRipple follows a clean, decoupled client-server architecture:

```mermaid
flowchart TD
    subgraph Client["Frontend Tier (React 18 + TypeScript + Vite)"]
        UI[Tailwind UI & Modals]
        Canvas[React Flow Interactive Graph]
        Gauge[Risk Gauge & Metrics]
        TestView[Regression Test Optimizer]
        State[TanStack Query & Axios Client]
    end

    subgraph Backend["Application Tier (Spring Boot 3.3.4 + Java 21)"]
        Sec[Spring Security + JWT + RBAC]
        Ctrl[REST API Layer /api/v1]
        
        subgraph CoreEngines["Intelligence Engines"]
            GraphEng[In-Memory DirectedGraph Engine]
            ImpactEng[Reverse-Edge Impact BFS]
            RiskEng[Explainable Heuristic Risk Engine]
            TestEng[Greedy Set-Cover Test Selector]
            DiffEng[Historical Evolution Comparator]
        end
        
        Parser[JavaParser Static AST Scanner]
    end

    subgraph Data["Persistence Tier (MySQL 8 / Flyway / H2)"]
        Flyway[Flyway Versioned Migrations]
        MySQL[(MySQL 8 Database)]
    end

    Canvas --> State
    Gauge --> State
    TestView --> State
    State -->|REST / JSON (Bearer JWT)| Sec
    Sec --> Ctrl
    Ctrl --> CoreEngines
    Ctrl --> Parser
    CoreEngines --> Flyway
    Flyway --> MySQL
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Java JDK 21+**
- **Node.js 20+**
- **Maven 3.9+** (or use the built-in NetBeans/JetBrains tooling)
- *(Optional)* **Docker & Docker Compose**

---

### Option A: One-Click Windows Launcher (Fastest)

Double-click [`run-local.bat`](file:///e:/ChangeRipple/run-local.bat) or run from PowerShell:
```cmd
run-local.bat
```
Select **`[5]` Start Both Backend and Frontend in separate windows**.

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8080/api/v1](http://localhost:8080/api/v1)
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

### Option B: Docker Compose (Full Stack with MySQL 8)

Run from the root directory:
```bash
docker-compose up -d --build
```
This automatically brings up MySQL 8, executes Flyway migrations, starts the Spring Boot backend, and launches the Nginx-served React frontend.

---

### Option C: Manual CLI Startup

#### 1. Backend Startup
```bash
cd backend
mvn spring-boot:run
```
*Runs on port 8080 with in-memory H2 database (or MySQL if configured).*

#### 2. Frontend Startup
```bash
cd frontend
npm install
npm run dev
```
*Runs on port 5173 with hot-module replacement (Vite).*

---

## 🔑 Default Credentials

The platform is pre-seeded with test accounts for role-based testing:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin / Architect** | `admin@changeripple.io` | `Password123!` | Full admin access, all projects |
| **Lead Developer** | `lead@changeripple.io` | `Password123!` | Project Owner / Editor |
| **Reviewer / QA** | `viewer@changeripple.io` | `Password123!` | Read-only viewer access |

---

## 🎯 Evaluator Walkthrough (5-Minute Tour)

1. **Sign In**: Navigate to [http://localhost:5173](http://localhost:5173) and sign in using `admin@changeripple.io` / `Password123!`.
2. **Load a Preset**:
   - In the top navigation bar, click **"Demo Presets"**.
   - Select **"CloudCommerce Core Platform"** and click **"Load Preset"**.
3. **Explore the Graph**:
   - View the 15-node interactive graph. Click on `order-service` to inspect its type, criticality, inbound callers, and outbound dependencies in the sidebar.
4. **Trigger an Impact Analysis**:
   - Switch to the **"Impact Workspace"** tab.
   - Choose `order-service` as the target component and select `SCHEMA_CHANGE` (Database Schema Refactoring).
   - Click **"Run Impact Analysis"**.
5. **Inspect the Explainable Risk Score**:
   - View the animated **Risk Gauge** displaying the calculated score (e.g., 78/100 — High Risk).
   - Review the driver breakdown bars: blast radius, depth, target criticality, change type weight, and test gap penalty.
   - Inspect the shortest propagation paths leading to affected components (`api-gateway`, `checkout-controller`, etc.).
6. **Optimize the Regression Test Suite**:
   - Switch to the **"Regression Suite"** tab.
   - Toggle between **"Greedy Set-Cover (Optimized)"** and **"Run All Affected Tests"**.
   - Observe how the Greedy Set-Cover algorithm eliminates redundant tests, saving up to 45% execution time while preserving 100% component coverage!
   - Click **"Export CSV"** or **"Export Markdown"** to download the test plan.
7. **Static AST Java Importer**:
   - Click **"Import Java Code"** in the navigation bar to parse Java source snippets or directory structures into graph components.

---

## 🧪 Testing and Verification

### Backend Tests (JUnit 5 + MockMvc)
```bash
cd backend
mvn test
```
*Executes all 14 integration and unit tests covering reverse-edge BFS, cycle detection, greedy set cover, risk scoring calibration, JWT authentication, and IDOR project security.*

### Frontend Tests (Vitest + React Testing Library)
```bash
cd frontend
npm test
```
*Executes UI component test suites verifying gauge calculations, SVG needle rendering, and greedy test selector interactions.*

---

## 📚 Technical Documentation

Deep-dive architecture, algorithm, and security documentation is available in the [`docs/`](file:///e:/ChangeRipple/docs/) directory:

- [System Architecture](file:///e:/ChangeRipple/docs/architecture.md) — Multi-tier design, data flow, in-memory graph management.
- [Algorithmic Foundations](file:///e:/ChangeRipple/docs/algorithms.md) — Reverse BFS, cycle detection, shortest paths, and greedy set-cover mathematics.
- [Heuristic Risk Model](file:///e:/ChangeRipple/docs/risk-model.md) — Formula, calibration boundaries, weighting matrix, and natural language justifications.
- [API Specification](file:///e:/ChangeRipple/docs/api-specification.md) — Full REST API contracts, request/response models, and error envelopes.
- [Database Schema](file:///e:/ChangeRipple/docs/database-schema.md) — Relational schema design, foreign keys, indexes, and Flyway migration versions.
- [Security & Access Control](file:///e:/ChangeRipple/docs/security.md) — Spring Security, JWT authentication, BCrypt, and project-level authorization (IDOR).
- [Testing Strategy](file:///e:/ChangeRipple/docs/testing.md) — Test pyramid, unit/integration test matrices, and invariants.
- [Deployment Guide](file:///e:/ChangeRipple/docs/deployment.md) — Docker Compose, production environment variables, and bare-metal setup.

---

## 📂 Repository Structure

```
ChangeRipple/
├── backend/
│   ├── src/
│   │   ├── main/java/com/changeripple/
│   │   │   ├── analysis/       # Impact analysis engine & BFS traversal
│   │   │   ├── auth/           # JWT, Spring Security & user management
│   │   │   ├── common/         # BaseEntity, ApiResponse & global exception handling
│   │   │   ├── component/      # Component entities & REST controller
│   │   │   ├── config/         # SecurityConfig, CorsConfig & OpenApiConfig
│   │   │   ├── dependency/     # Dependency & test coverage services
│   │   │   ├── graph/          # DirectedGraph, GraphNode & CycleDetector
│   │   │   ├── parser/         # JavaParser static AST code scanner
│   │   │   ├── preset/         # Demonstration presets service
│   │   │   ├── project/        # Multi-tenant project management & RBAC
│   │   │   ├── regression/     # Greedy set-cover regression selector
│   │   │   ├── report/         # CSV and Markdown report generators
│   │   │   └── risk/           # Calibrated heuristic risk scoring engine
│   │   └── resources/
│   │       ├── db/migration/   # Flyway V1 schema & V2 seed data migrations
│   │       ├── application.yml # Core configuration
│   │       └── application-mysql.yml # MySQL production profile
│   ├── Dockerfile              # Multi-stage JDK 21 build
│   └── pom.xml                 # Maven configuration & dependencies
├── frontend/
│   ├── src/
│   │   ├── components/         # React Flow canvas, Risk Gauge, Tables, Modals
│   │   ├── context/            # AuthContext & Session management
│   │   ├── lib/                # Dagre layout & utility functions
│   │   ├── services/           # Axios REST API client & interceptors
│   │   ├── test/               # Vitest test suites
│   │   ├── types/              # TypeScript domain types & interfaces
│   │   ├── App.tsx             # Root dashboard & navigation router
│   │   └── main.tsx            # Application entry point
│   ├── Dockerfile              # Multi-stage Node 22 + Nginx container
│   ├── nginx.conf              # SPA routing configuration
│   ├── package.json            # Frontend dependencies & scripts
│   └── vite.config.ts          # Vite bundler configuration
├── docs/                       # Architecture, algorithm, and security specs
├── docker-compose.yml          # Full-stack Docker composition (MySQL + Backend + Frontend)
├── run-local.bat               # Interactive Windows launcher
├── .gitignore                  # Git ignore rules
└── README.md                   # Project overview & documentation
```

---

## ⚖️ Engineering Decisions & Trade-offs

- **In-Memory Graph vs. Graph Database**: For platforms tracking up to tens of thousands of software components, an in-memory adjacency graph executes traversal and cycle detection in sub-millisecond time with zero graph database operational overhead (e.g. Neo4j cluster management).
- **Reverse-Edge BFS**: Because $A \to B$ means $A$ calls $B$, modifications to $B$ propagate to $A$. Inverting edges during graph construction allows standard BFS to discover all direct and indirect dependents in $O(V + E)$ time while simultaneously reconstructing shortest propagation paths.
- **Greedy Set-Cover vs. Integer Linear Programming**: While set cover is NP-hard, the greedy approximation algorithm achieves a proven $(1 - 1/e) \approx 63\%$ bound with $O(U \cdot T)$ execution speed, providing instantaneous test suite recommendations suitable for real-time CI/CD and interactive UI responsiveness.
- **Heuristic Risk vs. Machine Learning**: A weighted heuristic model provides 100% deterministic, explainable, and auditable risk justifications without requiring months of historical commit telemetry or black-box training pipelines.

---

## 📄 License
This project is licensed under the MIT License.
