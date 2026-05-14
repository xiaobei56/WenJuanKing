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

### Phase 1: Foundation (Week 1-2)
- [x] Project initialization
- [x] Database schema design
- [x] User authentication (JWT)
- [x] Project CRUD API
- [ ] Question CRUD API
- [ ] Answer submission API
- [ ] Repo (template) API

### Phase 2: Core Features (Week 3-4)
- [ ] User management
- [ ] Project management with settings
- [ ] Question types (12+ question types)
- [ ] Answer collection and validation

### Phase 3: Advanced Features (Week 5-8)
- [ ] Question logic/branching
- [ ] Answer statistics and reporting
- [ ] File upload handling
- [ ] Template repository

### Phase 4: Frontend (Week 9-12)
- [ ] React project setup
- [ ] Authentication pages
- [ ] Project management UI
- [ ] Survey builder
- [ ] Answer collection UI

### Phase 5: Polish (Week 13-16)
- [ ] Responsive design
- [ ] State management (Redux/Context)
- [ ] API integration
- [ ] Error handling

### Phase 6: Testing (Week 17-20)
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

### Phase 7: Deployment (Week 21-24)
- [ ] Docker configuration
- [ ] CI/CD pipeline
- [ ] Production deployment

### Phase 8: Launch (Week 25-32)
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
1. Survey
2. Exam
3. Vote
4. Questionnaire
5. Assessment
6. Feedback
7. Poll