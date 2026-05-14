# SurveyKing v2 Development Plan

## Project Overview
复刻 SurveyKing 开源项目（问卷考试系统），使用更高效的技术栈（Go + React + PostgreSQL）替代原 Java + React 技术栈。

## Technology Stack
- **Backend**: Go (Gin framework)
- **Frontend**: React (Ant Design)
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: JWT

## Development Phases

### Phase 1: Foundation (Week 1-2) ✅
- [x] Project initialization
- [x] Database schema design
- [x] User authentication (JWT)
- [x] Project CRUD API
- [x] Question CRUD API
- [x] Answer submission API
- [x] Repo (template) API

### Phase 2: Core Features (Week 3-4) ✅
- [x] User management (CRUD + freeze + role)
- [x] Project management with settings
- [x] Question types (31 types)
- [x] Answer collection and validation

### Phase 3: Advanced Features (Week 5-8) ✅
- [x] Question logic/branching (跳题逻辑)
- [x] Answer statistics and reporting
- [x] File upload handling
- [x] Template repository
- [x] Auto-score for exams

### Phase 4: Frontend (Week 9-12) ✅
- [x] React project setup
- [x] Authentication pages
- [x] Project management UI
- [x] Survey builder
- [x] Answer collection UI
- [x] 31 question type components
- [x] Statistics charts (echarts)

### Phase 5: Polish (Week 13-16) ✅
- [x] Responsive design
- [x] State management (Zustand)
- [x] API integration
- [x] Error handling
- [x] RBAC permission control
- [x] CSV export
- [x] Theme system (8 colors + dark mode)

### Phase 6: Testing (Week 17-20) 🔄
- [x] Unit tests
- [x] Integration tests
- [ ] E2E tests (Playwright) - pending

### Phase 7: Deployment (Week 21-24) 🔄
- [x] Docker configuration
- [x] CI/CD pipeline (GitHub Actions)
- [ ] Production deployment

### Phase 8: Launch (Week 25-32) ⏳
- [ ] Beta testing
- [ ] Performance optimization
- [ ] Documentation
- [ ] Official release

## Question Types (31 types)
1. Radio
2. Checkbox
3. Input
4. Textarea
5. Select
6. MultiSelect
7. Cascader
8. Date
9. DateRange
10. DateTime
11. DateTimeRange
12. Time
13. TimeRange
14. Slider
15. Rate
16. Switch
17. Upload
18. Uploader
19. Button
20. Image
21. Video
22. Audio
23. Location
24. Phone
25. Email
26. Number
27. Currency
28. URL
29. Color
30. Grade
31. Signature
32. Announcement
33. Divider
34. PageBreak

## Project Types (7 types)
1. Survey (问卷)
2. Exam (考试)
3. Vote (投票)
4. Questionnaire (测评)
5. Assessment (评估)
6. Feedback (反馈)
7. Poll (投票)

## API Endpoints Summary

### Auth
- POST /api/auth/register
- POST /api/auth/login

### Users
- GET /api/v1/users
- GET /api/v1/users/:id
- PUT /api/v1/users/:id
- DELETE /api/v1/users/:id
- PUT /api/v1/users/:id/status (freeze/unfreeze)
- PUT /api/v1/users/:id/role (update role)
- GET /api/v1/users/profile
- PUT /api/v1/users/profile
- POST /api/v1/users/change-password

### Projects
- POST /api/v1/projects
- GET /api/v1/projects
- GET /api/v1/projects/:id
- PUT /api/v1/projects/:id
- DELETE /api/v1/projects/:id
- POST /api/v1/projects/:id/publish
- POST /api/v1/projects/:id/unpublish
- POST /api/v1/projects/:id/duplicate

### Questions
- POST /api/v1/projects/:projectId/questions
- GET /api/v1/projects/:projectId/questions
- GET /api/v1/projects/:projectId/questions/:id
- PUT /api/v1/projects/:projectId/questions/:id
- DELETE /api/v1/projects/:projectId/questions/:id
- POST /api/v1/projects/:projectId/questions/sort
- POST /api/v1/projects/:projectId/questions/batch

### Answers
- POST /api/v1/projects/:projectId/answers
- GET /api/v1/projects/:projectId/answers
- GET /api/v1/projects/:projectId/answers/:id
- GET /api/v1/projects/:projectId/answers/:id/statistics
- POST /api/v1/projects/:projectId/answers/:id/score
- POST /api/v1/projects/:projectId/answers/:id/auto-score
- GET /api/v1/answers (my answers)

### Files
- POST /api/v1/files/upload
- GET /api/v1/files
- DELETE /api/v1/files/:id

### Repos (Templates)
- POST /api/v1/repos
- GET /api/v1/repos
- GET /api/v1/repos/public
- GET /api/v1/repos/:id
- PUT /api/v1/repos/:id
- DELETE /api/v1/repos/:id

## Recent Commits

| Commit | Description |
|--------|-------------|
| c038140 | ci: add GitHub Actions CI/CD pipeline |
| 1f8a647 | test: add service layer tests for answer and user |
| ef31eca | feat(answer): add auto-score functionality for exams |
| 30054b3 | feat(file): implement real file service with database |
| 0a0ebed | feat(user): add role field + freeze/role API |
| 8275db9 | feat(db): add role column to users table |
| 4578c60 | fix: resolve Go build errors and module path |

## Deployment

### Docker Compose
```bash
docker-compose up -d
```

### Environment Variables
- PORT: Server port (default: 8080)
- DATABASE_URL: PostgreSQL connection string
- REDIS_HOST: Redis host
- REDIS_PORT: Redis port
- JWT_SECRET: JWT signing secret
- UPLOAD_DIR: File upload directory