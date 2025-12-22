# 无痛学 - 沉浸式情景学习系统

一个基于AI的情景式学习平台，通过自然的人物对话帮助用户沉浸式学习知识。

## 在线体验

访问 [无痛学](https://wutongxue.8a5362ec.er.aliyun-esa.net) 开始你的学习之旅！

## 功能特点

### 核心功能
- **知识文件上传**: 支持 TXT、Markdown、PDF、Word、Excel 等多种格式
- **场景选择**: 职场办公、校园学习、实操场景三种模式
- **沉浸式对话**: AI生成自然的人物对话，融入知识要点
- **学习进度追踪**: 随时查看已学习的知识点摘要
- **知识点测验**: 通过互动测验巩固所学知识

### v1.5.0 新功能
- **用户系统**: 注册登录后，学习记录自动同步到云端
- **多设备同步**: 在任意设备上继续你的学习
- **新用户引导**: 首次使用时的功能引导教程
- **历史记录恢复**: 点击历史记录即可恢复之前的对话

### 设计特点
- 温暖的米色/棕色系配色，避免蓝紫渐变
- 使用SVG图标替代emoji
- 有层次感的布局设计
- 细腻的交互动画和过渡效果
- 支持深色模式

## 项目结构

```
无痛学/
├── backend/           # 后端服务
│   ├── src/
│   │   ├── index.js   # 主服务文件
│   │   └── db.js      # 数据库配置
│   ├── data/          # SQLite 数据库存储
│   ├── uploads/       # 上传文件存储
│   ├── package.json
│   └── .env.example   # 环境变量示例
├── frontend/          # 前端应用
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── UploadSection.jsx
│   │   │   ├── ScenarioSelector.jsx
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── AuthModal.jsx      # 登录注册弹窗
│   │   │   ├── UserTour.jsx       # 新用户引导
│   │   │   ├── HelpModal.jsx
│   │   │   └── ChangelogModal.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx    # 用户认证上下文
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## 快速开始

### 1. 配置后端

```bash
cd backend

# 安装依赖
npm install

# 复制环境变量配置
cp .env.example .env

# 编辑 .env 文件，填入你的 API Key
# DASHSCOPE_API_KEY=your_api_key_here
# JWT_SECRET=your_jwt_secret_here

# 启动后端服务
npm run dev
```

后端服务将运行在 http://localhost:3001

### 2. 配置前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端应用将运行在 http://localhost:3000

## API 接口

### 用户认证
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/me` | GET | 获取当前用户信息 |

### 学习功能
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/upload` | POST | 上传知识文件 |
| `/api/session/create` | POST | 创建学习会话 |
| `/api/start` | POST | 开始学习对话 |
| `/api/chat` | POST | 发送对话消息 |
| `/api/summary/:sessionId` | GET | 获取学习进度摘要 |

### 历史记录
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/history` | GET | 获取学习历史 |
| `/api/session/:sessionId` | GET | 获取会话详情 |
| `/api/history/:sessionId` | DELETE | 删除历史记录 |

## 技术栈

### 后端
- Node.js + Express
- 通义千问 API (Qwen Turbo/Max)
- SQLite (better-sqlite3)
- JWT 认证
- bcryptjs 密码加密

### 前端
- React 18
- Vite
- Tailwind CSS
- Framer Motion (动画)
- Axios

## 环境变量

### 后端 (.env)
```
PORT=3001
DASHSCOPE_API_KEY=your_dashscope_api_key
JWT_SECRET=your_jwt_secret_key
```

### 前端 (.env)
```
VITE_API_BASE=http://localhost:3001
```

## 注意事项

1. 需要有效的通义千问 API Key
2. 首次运行会自动创建 SQLite 数据库
3. 上传的文件会临时存储在 `backend/uploads/` 目录
4. 用户数据存储在 `backend/data/wutongxue.db`

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
