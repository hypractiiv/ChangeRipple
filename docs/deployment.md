# ChangeRipple Deployment Guide

ChangeRipple can be deployed via Docker Compose for production environments or executed natively for local development.

---

## 1. System Requirements & Prerequisites

| Technology | Minimum Version | Purpose |
| :--- | :--- | :--- |
| **Java JDK** | 21 LTS | Backend runtime (Spring Boot 3.3.4) |
| **Node.js** | 20+ (22 recommended) | Frontend build environment (Vite 5) |
| **Maven** | 3.9+ | Backend build & dependency manager |
| **Docker & Docker Compose** | 24+ / Compose v2 | Containerized deployment |
| **MySQL** | 8.0+ | Production persistence tier |

---

## 2. Docker Compose Deployment (Recommended for Production)

ChangeRipple includes a production-ready [`docker-compose.yml`](file:///e:/ChangeRipple/docker-compose.yml) orchestrating MySQL 8, the Spring Boot backend, and an Nginx-served React frontend.

### 2.1 Starting the Complete Stack
From the project root directory, run:
```bash
docker-compose up -d --build
```

This starts:
1. **`changeripple-mysql`** on port `3306` with automatic health checks (`mysqladmin ping`).
2. **`changeripple-backend`** on port `8080`, waiting for MySQL health check readiness before executing Flyway migrations.
3. **`changeripple-frontend`** on port `5173` (mapped from Nginx port `80`) with SPA fallback routing.

### 2.2 Verifying Container Health
```bash
docker-compose ps
```
Ensure all containers report `healthy` or `running`.

### 2.3 Access Points
- **Web Application**: [http://localhost:5173](http://localhost:5173)
- **Backend REST API**: [http://localhost:8080/api/v1](http://localhost:8080/api/v1)
- **Swagger UI & OpenAPI Docs**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Spring Actuator Health**: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

### 2.4 Stopping Containers
```bash
docker-compose down -v  # use -v to also drop persistent volumes if resetting data
```

---

## 3. Local Development Setup (Bare Metal / IDE)

### 3.1 One-Click Windows Launcher
Double-click [`run-local.bat`](file:///e:/ChangeRipple/run-local.bat) or execute from PowerShell/CMD:
```cmd
run-local.bat
```
The menu allows you to:
- `[1]` Start Backend only (`http://localhost:8080`)
- `[2]` Start Frontend only (`http://localhost:5173`)
- `[3]` Run Backend JUnit 5 tests
- `[4]` Run Frontend Vitest tests
- `[5]` Launch both Backend and Frontend in separate concurrent windows

### 3.2 Manual Startup

#### Backend:
```bash
cd backend
mvn spring-boot:run
```
*Default configuration uses in-memory H2 with automatic schema initialization if MySQL is not detected, enabling instant zero-dependency launch.*

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 4. Environment Variables Reference

### Backend (`application.yml` or container environment)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | `default` (or `mysql`) | Active Spring profile (`default` for H2, `mysql` for MySQL) |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/changeripple` | JDBC connection string |
| `SPRING_DATASOURCE_USERNAME` | `root` | Database user |
| `SPRING_DATASOURCE_PASSWORD` | `rootpassword` | Database password |
| `JWT_SECRET` | *(64-character hex key)* | Secret key for HS256 JWT signature verification |
| `JWT_EXPIRATION_MS` | `86400000` (24 hours) | Token validity duration in milliseconds |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated list of permitted CORS origins |

### Frontend (`.env` or build environment)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1` | Target URL for backend REST API calls |

---

## 5. Database Migrations (Flyway)

ChangeRipple uses Flyway for reproducible schema migrations:
- **`V1__init_schema.sql`**: Creates the 10 core tables (`users`, `projects`, `project_members`, `components`, `dependencies`, `test_coverages`, `change_requests`, `analysis_runs`, `impact_results`, `selected_tests`).
- **`V2__seed_demo_data.sql`**: Populates the demo `CloudCommerce Platform` project with 15 interconnected components, dependencies, test coverages, and sample change requests.

Flyway runs automatically on Spring Boot application startup before any JPA entities or repositories are accessed.
