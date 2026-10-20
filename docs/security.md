# ChangeRipple Security Architecture & Threat Model

## 1. Authentication & Identity Management

### 1.1 Secure Password Storage
- User passwords are encrypted using **BCrypt** with adaptive cost factor 10.
- Plaintext passwords are never logged, persisted, or returned in API responses.

### 1.2 JWT Access Tokens
- Stateless authentication using HMAC-SHA256 (`HS256`) signatures.
- Signing secret is strictly decoupled from version control and supplied via `JWT_SECRET` environment variable (minimum 256 bits).
- Tokens include user subject ID, username, and email claims with configurable expiration (default 24h).

---

## 2. Multi-Tenant Project Authorization & IDOR Defense

### 2.1 Project Membership Roles
1. `OWNER`: Project deletion, transfer, full member management, and CRUD.
2. `ADMIN`: Component creation/update/deletion, dependency authoring, and member role assignment.
3. `MEMBER`: Read graph, submit change requests, trigger impact analyses, and view historical diffs.

### 2.2 Server-Side Project Boundary Enforcement
- **IDOR Protection**: Every request targeting project-scoped resources (e.g., `/api/v1/projects/{projectId}/...` or component/change IDs) executes server-side validation against `projectMemberRepository`.
- Users cannot access or modify projects they do not belong to simply by altering IDs in HTTP requests (tested and confirmed via `ProjectSecurityIntegrationTest`).

---

## 3. Safe Java Source Parsing

### 3.1 Static AST Inspection Only
- The Java source importer utilizes `JavaParser` exclusively for static Abstract Syntax Tree (AST) scanning.
- **Zero Code Execution**: Uploaded source code is never executed, compiled into bytecode, or classloaded.
- **Size Limits**: Source payload is restricted to 500KB to prevent memory exhaustion / ReDoS.

---

## 4. Operational & Network Security
- **CORS**: Explicitly restricted via `CORS_ALLOWED_ORIGINS` (defaulting to development hosts).
- **Safe Error Envelopes**: `GlobalExceptionHandler` masks internal stack traces from clients and returns structured JSON errors.
- **Actuator Health**: Exposed endpoints (`/actuator/health`, `/actuator/info`) sanitize internal infrastructure details.
