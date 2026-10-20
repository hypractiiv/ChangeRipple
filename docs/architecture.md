# ChangeRipple System Architecture

## 1. High-Level Overview

ChangeRipple is an enterprise-grade full-stack developer platform designed to predict, visualize, and mitigate the architectural risks associated with software modifications.

```mermaid
flowchart TD
    subgraph Client["Presentation Tier (Frontend)"]
        UI[React 18 + Vite]
        Flow[React Flow Interactive Graph]
        Charts[Recharts Risk Matrix]
        Query[TanStack Server State]
    end

    subgraph Server["Application Tier (Spring Boot 3)"]
        Sec[Spring Security + JWT]
        Ctrl[REST API Layer /api/v1]
        
        subgraph CoreEngines["Core Graph & Intelligence Engines"]
            GraphEng[In-Memory DirectedGraph Engine]
            ImpactEng[Reverse-Edge Impact Propagation BFS]
            RiskEng[Explainable Heuristic Risk Scoring]
            TestEng[Greedy Set-Cover Test Optimizer]
            DiffEng[Historical Diff & Evolution Service]
        end
        
        Parser[JavaParser Static AST Scanner]
    end

    subgraph DataTier["Persistence Tier (MySQL 8)"]
        Flyway[Flyway Versioned Migrations]
        MySQL[(MySQL 8 Database)]
    end

    UI -->|REST / JSON (JWT)| Sec
    Sec --> Ctrl
    Ctrl --> CoreEngines
    Ctrl --> Parser
    CoreEngines --> Flyway
    Flyway --> MySQL
```

## 2. Core Architectural Principles

### 2.1 Strict Frontend/Backend Separation
- The frontend operates strictly as an SPA communicating over stateless REST APIs (`/api/v1/*`) using JSON envelopes (`ApiResponse<T>`).
- The frontend has zero direct connection or credentials for MySQL.
- Authorization is evaluated server-side per project resource (`@PreAuthorize` / `ProjectSecurityService`).

### 2.2 In-Memory Graph Processing
- Rather than executing recursive SQL queries ($N+1$ query hazard), graphs are materialized into memory in $O(V + E)$ time using `DirectedGraph`.
- Traversal algorithms execute in high-throughput in-memory structures with cycle detection and depth tracking.

### 2.3 Distinct Dependency & Test Semantics
- **Runtime Dependencies**: `Component A -> Component B` strictly signifies that $A$ depends on $B$.
- **Test Coverage**: Kept logically distinct in `test_coverages` mapping test nodes to runtime target components. Test components are never misconstrued as runtime callers.
