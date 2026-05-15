# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2025-05-15

### Added
- **User Management**: Role field, freeze/unfreeze, role update APIs
- **File Upload**: Real database-backed file service with metadata storage
- **Answer Auto-Score**: Automatic scoring for exam-type projects
- **Redis Cache**: Connection pooling and cache service for performance
- **E2E Tests**: Playwright test suite for auth, projects, settings
- **CI/CD Pipeline**: GitHub Actions workflow for build, test, deploy

### Changed
- Updated all SQL queries to include role field
- Added connection max lifetime for database pool
- Improved error handling in services

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
- PUT  /api/v1/users/:id/status
- PUT  /api/v1/users/:id/role
- DELETE /api/v1/users/:id
- POST /api/v1/projects
- GET  /api/v1/projects
- GET  /api/v1/projects/:id
- PUT  /api/v1/projects/:id
- DELETE /api/v1/projects/:id
- POST /api/v1/projects/:id/publish
- POST /api/v1/projects/:id/unpublish
- POST /api/v1/projects/:id/duplicate
- POST /api/v1/projects/:projectId/questions
- GET  /api/v1/projects/:projectId/questions
- GET  /api/v1/projects/:projectId/questions/:id
- PUT  /api/v1/projects/:projectId/questions/:id
- DELETE /api/v1/projects/:projectId/questions/:id
- POST /api/v1/projects/:projectId/questions/sort
- POST /api/v1/projects/:projectId/questions/batch
- POST /api/v1/projects/:projectId/answers
- GET  /api/v1/projects/:projectId/answers
- GET  /api/v1/projects/:projectId/answers/:id
- GET  /api/v1/projects/:projectId/answers/:id/statistics
- POST /api/v1/projects/:projectId/answers/:id/score
- POST /api/v1/projects/:projectId/answers/:id/auto-score
- POST /api/v1/files/upload
- GET  /api/v1/files
- DELETE /api/v1/files/:id
- POST /api/v1/repos
- GET  /api/v1/repos
- GET  /api/v1/repos/public
- GET  /api/v1/repos/:id
- PUT  /api/v1/repos/:id
- DELETE /api/v1/repos/:id
- POST /api/v1/repos/:id/import