# SurveyKing v2

开源问卷/考试系统，使用 Go + React + PostgreSQL 构建。

## 技术栈

- **后端**: Go (Gin framework)
- **前端**: React + Ant Design
- **数据库**: PostgreSQL
- **缓存**: Redis
- **认证**: JWT

## 快速开始

### 前置要求

- Go 1.21+
- Node.js 18+
- PostgreSQL 16+
- Docker & Docker Compose (可选)

### 安装

```bash
# 克隆项目
git clone https://github.com/xiaobei56/SurveyKing-v2.git
cd SurveyKing-v2

# 初始化数据库
make db-init

# 安装后端依赖
make install

# 安装前端依赖
cd client && npm install

# 启动开发服务器
make dev
```

### Docker 部署

```bash
# 构建并启动所有服务
make prod

# 停止服务
make docker-down
```

## 功能

- [x] 用户认证 (JWT)
- [x] 项目管理 (创建/编辑/发布)
- [x] 题目管理 (支持31种题型)
- [x] 答卷提交与统计
- [x] 模板库

## API 文档

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 项目
- `GET /api/v1/projects` - 获取项目列表
- `POST /api/v1/projects` - 创建项目
- `GET /api/v1/projects/:id` - 获取项目详情
- `PUT /api/v1/projects/:id` - 更新项目
- `DELETE /api/v1/projects/:id` - 删除项目
- `POST /api/v1/projects/:id/publish` - 发布项目

### 题目
- `GET /api/v1/projects/:projectId/questions` - 获取题目列表
- `POST /api/v1/projects/:projectId/questions` - 创建题目
- `PUT /api/v1/projects/:projectId/questions/:id` - 更新题目
- `DELETE /api/v1/projects/:projectId/questions/:id` - 删除题目

### 答卷
- `POST /api/v1/projects/:projectId/answers` - 提交答卷
- `GET /api/v1/projects/:projectId/answers` - 获取答卷列表
- `GET /api/v1/projects/:projectId/answers/statistics` - 获取统计

## 开发

```bash
# 后端测试
make test

# 后端 lint
make lint

# 清理构建
make clean
```

## 目录结构

```
.
├── server/              # Go 后端
│   ├── api/            # API 处理器
│   ├── config/         # 配置
│   ├── main.go         # 入口
│   ├── rdbms/          # 数据层
│   └── shared/         # 共享模块
├── client/             # React 前端
│   └── src/
│       ├── pages/      # 页面组件
│       ├── services/   # API 服务
│       └── store/      # 状态管理
├── docs/               # 文档
├── scripts/            # 脚本
└── docker-compose.yml  # Docker 配置
```

## License

MIT