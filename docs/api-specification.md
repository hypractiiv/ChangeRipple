# ChangeRipple REST API Specification

All endpoints are versioned under `/api/v1` and return uniform `ApiResponse<T>` JSON payloads.

## 1. Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new user account | Public |
| `POST` | `/api/v1/auth/login` | Authenticate user & issue JWT | Public |
| `GET` | `/api/v1/auth/me` | Retrieve authenticated user profile | Authenticated |

## 2. Projects (`/api/v1/projects`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/projects` | List projects for user | Authenticated |
| `POST` | `/api/v1/projects` | Create a new project | Authenticated |
| `GET` | `/api/v1/projects/{id}` | Get project details | Project MEMBER |
| `PATCH` | `/api/v1/projects/{id}` | Update project | Project ADMIN |
| `DELETE` | `/api/v1/projects/{id}` | Delete project & cascade | Project OWNER |
| `GET` | `/api/v1/projects/{id}/members` | List project team members | Project MEMBER |
| `POST` | `/api/v1/projects/{id}/members` | Add/update team member role | Project ADMIN |
| `DELETE` | `/api/v1/projects/{id}/members/{uId}` | Remove member | Project ADMIN |

## 3. Components (`/api/v1/components`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/projects/{projectId}/components` | List components with filters | Project MEMBER |
| `POST` | `/api/v1/projects/{projectId}/components` | Create component | Project ADMIN |
| `GET` | `/api/v1/components/{componentId}` | Get component details | Project MEMBER |
| `PATCH` | `/api/v1/components/{componentId}` | Update component | Project ADMIN |
| `DELETE` | `/api/v1/components/{componentId}` | Delete component | Project ADMIN |

## 4. Dependencies & Graph (`/api/v1`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/projects/{projectId}/graph` | Get full graph nodes & edges | Project MEMBER |
| `POST` | `/api/v1/projects/{projectId}/dependencies` | Create directed dependency edge | Project ADMIN |
| `DELETE` | `/api/v1/dependencies/{id}` | Delete dependency edge | Project ADMIN |
| `GET` | `/api/v1/components/{id}/dependencies` | Get component incoming/outgoing | Project MEMBER |
| `GET` | `/api/v1/projects/{projectId}/test-coverages` | Get test coverage mappings | Project MEMBER |
| `POST` | `/api/v1/projects/{projectId}/test-coverages` | Create test coverage mapping | Project ADMIN |
| `DELETE` | `/api/v1/test-coverages/{id}` | Delete test coverage mapping | Project ADMIN |

## 5. Change Requests & Analysis (`/api/v1`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/projects/{projectId}/changes` | List change requests | Project MEMBER |
| `POST` | `/api/v1/projects/{projectId}/changes` | Create change request | Project MEMBER |
| `GET` | `/api/v1/changes/{id}` | Get change request details | Project MEMBER |
| `POST` | `/api/v1/changes/{id}/analyses` | Run impact analysis & test suite | Project MEMBER |
| `GET` | `/api/v1/analyses/{id}` | Get full analysis details | Project MEMBER |
| `GET` | `/api/v1/analyses/{id}/results` | Get affected components | Project MEMBER |
| `GET` | `/api/v1/analyses/{id}/tests` | Get selected tests by strategy | Project MEMBER |
| `GET` | `/api/v1/projects/{projectId}/analyses` | List historical analysis runs | Project MEMBER |
| `POST` | `/api/v1/analyses/compare` | Compare two historical runs | Project MEMBER |

## 6. Reports & Presets (`/api/v1`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/analyses/{id}/report/markdown` | Download Markdown report | Project MEMBER |
| `GET` | `/api/v1/analyses/{id}/report/csv` | Download CSV impact dataset | Project MEMBER |
| `GET` | `/api/v1/presets` | List demonstration presets | Public |
| `POST` | `/api/v1/presets/load/{key}` | Load & execute preset instantly | Authenticated |
| `POST` | `/api/v1/projects/{id}/import/preview` | Preview AST parsed Java source | Project MEMBER |
| `POST` | `/api/v1/projects/{id}/import/apply` | Apply parsed components/edges | Project ADMIN |
