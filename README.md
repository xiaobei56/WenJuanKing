# SurveyKing v2

开源问卷/考试系统，使用 Go + React + PostgreSQL 构建的高性能问卷平台。

## ✨ 特性

- **31 种题型**: 单选、多选、填空、评分、日期、文件上传等
- **4 种项目类型**: 问卷、考试、投票、测评
- **跳题逻辑**: 条件触发，动态显示/隐藏题目
- **自动评分**: 考试类项目自动计算分数
- **主题系统**: 8 种预设主题色 + 亮/暗/自动模式
- **响应式设计**: 完美适配桌面和移动设备
- **RBAC 权限**: 用户/管理员角色控制

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Go 1.21 + Gin |
| 前端 | React 18 + Ant Design 5 |
| 数据库 | PostgreSQL 16 |
| 缓存 | Redis 7 |
| 状态 | Zustand |
| 图表 | ECharts |
| 测试 | Go tests + Playwright |

## 🚀 快速开始

### 前置要求

- Go 1.21+
- Node.js 18+
- PostgreSQL 16+
- Redis 7 (可选)
- Docker & Docker Compose

### Docker 部署 (推荐)

```bash
git clone https://github.com/xiaobei56/WenJuanKing.git
cd WenJuanKing
docker-compose up -d
```

访问 http://localhost:3000

### 本地开发

```bash
# 后端
cd server
go build -o surveyking .
./surveyking

# 前端 (新终端)
cd client
npm install --legacy-peer-deps
npm start
```

访问 http://localhost:3000 (前端) + http://localhost:8080 (API)

## 📁 项目结构

```
WenJuanKing/
├── server/                  # Go 后端
│   ├── api/                # HTTP handlers (8个)
│   ├── config/            # 配置 + Redis cache
│   ├── rdbms/
│   │   ├── domain/model/  # 数据模型
│   │   └── impl/          # Service 层 (7个)
│   └── shared/            # 中间件、工具、DTO
├── client/                  # React 前端
│   ├── src/
│   │   ├── pages/         # 12 个页面
│   │   ├── components/    # 可复用组件
│   │   ├── services/      # API 服务
│   │   └── store/         # Zustand 状态
│   └── e2e/               # Playwright E2E 测试
├── docs/                   # 文档 (schema, 开发计划)
├── .github/workflows/      # GitHub Actions CI/CD
└── docker-compose.yml      # Docker 部署配置
```

## 🎯 功能清单

### 已完成

| 功能 | 状态 |
|------|------|
| 用户注册/登录/JWT | ✅ |
| 用户冻结/角色管理 | ✅ |
| 项目 CRUD + 发布/复制 | ✅ |
| 题目 CRUD + 排序 + 批量创建 | ✅ |
| 31 种题型组件 | ✅ |
| 跳题逻辑 | ✅ |
| 答卷提交/列表/统计 | ✅ |
| CSV 导出 | ✅ |
| 自动评分 | ✅ |
| 模板库 (公开/私有) | ✅ |
| 文件上传 (数据库存储) | ✅ |
| 主题切换 (8色 + 暗色) | ✅ |
| RBAC 权限中间件 | ✅ |
| Redis 缓存服务 | ✅ |
| Docker 部署 | ✅ |
| CI/CD 流水线 | ✅ |
| 单元测试 + E2E 测试 | ✅ |

### 开发中

| 功能 | 状态 |
|------|------|
| 邮件通知 | 🔄 |
| WebSocket 实时通知 | 🔄 |
| 高级题目逻辑 (复杂条件) | 🔄 |

## 🔌 API 文档

### 认证
```
POST /api/auth/register    # 注册
POST /api/auth/login       # 登录
```

### 用户
```
GET    /api/v1/users              # 列表
GET    /api/v1/users/:id         # 详情
PUT    /api/v1/users/:id          # 更新
PUT    /api/v1/users/:id/status   # 冻结/解冻
PUT    /api/v1/users/:id/role     # 更新角色
DELETE /api/v1/users/:id          # 删除
```

### 项目
```
POST   /api/v1/projects                    # 创建
GET    /api/v1/projects                      # 列表
GET    /api/v1/projects/:id                   # 详情
PUT    /api/v1/projects/:id                  # 更新
DELETE /api/v1/projects/:id                  # 删除
POST   /api/v1/projects/:id/publish          # 发布
POST   /api/v1/projects/:id/unpublish        # 取消发布
POST   /api/v1/projects/:id/duplicate        # 复制
```

### 题目
```
POST   /api/v1/projects/:projectId/questions      # 创建
GET    /api/v1/projects/:projectId/questions      # 列表
GET    /api/v1/projects/:projectId/questions/:id   # 详情
PUT    /api/v1/projects/:projectId/questions/:id  # 更新
DELETE /api/v1/projects/:projectId/questions/:id   # 删除
POST   /api/v1/projects/:projectId/questions/sort # 排序
POST   /api/v1/projects/:projectId/questions/batch# 批量创建
```

### 答卷
```
POST   /api/v1/projects/:projectId/answers              # 提交
GET    /api/v1/projects/:projectId/answers               # 列表
GET    /api/v1/projects/:projectId/answers/:id            # 详情
GET    /api/v1/projects/:projectId/answers/:id/statistics # 统计
POST   /api/v1/projects/:projectId/answers/:id/score      # 手动评分
POST   /api/v1/projects/:projectId/answers/:id/auto-score # 自动评分
```

### 文件
```
POST /api/v1/files/upload   # 上传
GET  /api/v1/files           # 列表
DELETE /api/v1/files/:id     # 删除
```

## 🧪 测试

```bash
# 后端测试
cd server && go test ./...

# E2E 测试
cd client && npm run test:e2e
```

## 📦 版本

- **v0.2.0** - 最新版本，包含 Redis 缓存、E2E 测试、CI/CD
- **v0.1.0** - 初始版本，基础功能

## 📄 License

MIT