# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2025-05-15

### Added
- Initial project setup with Go module
- Database schema for PostgreSQL
- User authentication with JWT
- Project CRUD API
- Question CRUD API
- Answer submission API
- Repo (template) API
- Question types enumeration (31 types)
- Project types enumeration (7 types)
- Configuration management
- Middleware (CORS, Logger, JWT)
- Basic service layer implementations

### Directory Structure
```
server/
├── api/           # HTTP handlers
├── config/        # Configuration
├── main.go        # Entry point
├── rdbms/
│   ├── domain/model/  # Data models
│   └── impl/          # Service implementations
└── shared/
    ├── core/
    │   ├── constant/  # Enumerations
    │   ├── middleware/# HTTP middleware
    │   └── utils/     # Utilities
    └── domain/dto/    # Data transfer objects
```

### API Endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET  /api/v1/users
- GET  /api/v1/users/:id
- PUT  /api/v1/users/:id
- DELETE /api/v1/users/:id
- POST /api/v1/projects
- GET  /api/v1/projects
- GET  /api/v1/projects/:id
- PUT  /api/v1/projects/:id
- DELETE /api/v1/projects/:id
- POST /api/v1/projects/:id/publish
- POST /api/v1/projects/:projectId/questions
- GET  /api/v1/projects/:projectId/questions
- GET  /api/v1/projects/:projectId/questions/:id
- PUT  /api/v1/projects/:projectId/questions/:id
- DELETE /api/v1/projects/:projectId/questions/:id
- POST /api/v1/projects/:projectId/questions/sort
- POST /api/v1/projects/:projectId/answers
- GET  /api/v1/projects/:projectId/answers
- GET  /api/v1/projects/:projectId/answers/:id
- GET  /api/v1/projects/:projectId/answers/:id/statistics
- POST /api/v1/repos
- GET  /api/v1/repos
- GET  /api/v1/repos/:id
- DELETE /api/v1/repos/:id
- POST /api/v1/repos/:id/import