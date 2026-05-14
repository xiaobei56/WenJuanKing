# Development Standards

## Git Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches
- `refactor/*` - Refactoring branches

### Commit Convention
Format: `<type>(<scope>): <subject>`

Types:
- feat: New feature
- fix: Bug fix
- refactor: Code refactoring
- test: Test updates
- docs: Documentation changes
- chore: Maintenance tasks

Examples:
```
feat(auth): add JWT authentication
fix(project): handle nil pointer in project service
docs(api): update API documentation
```

## Code Standards

### Go
- Use `gofmt` for formatting
- Follow Go naming conventions
- Add error handling for all operations
- Use struct tags for JSON/DB mapping

### React
- Use functional components with hooks
- Follow ESLint configuration
- Use TypeScript for type safety
- Component naming: PascalCase

### General
- Maximum line length: 120
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

## Testing Requirements
- Unit test coverage: 70%+
- All new features must have tests
- All bug fixes must include regression tests

## Code Review
- All PRs require at least one review
- Address all review comments before merging
- Ensure CI passes before merging