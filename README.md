# 无痛学 - 沉浸式情景学习系统

一个基于AI的情景式学习平台，通过自然的人物对话帮助用户沉浸式学习知识。

## 项目结构

```
无痛学/
├── backend/           # 后端服务
│   ├── src/
│   │   └── index.js   # 主服务文件
│   ├── uploads/       # 上传文件存储
│   ├── package.json
│   └── .env.example   # 环境变量示例
├── frontend/          # 前端应用
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── UploadSection.jsx
│   │   │   ├── ScenarioSelector.jsx
│   │   │   └── ChatInterface.jsx
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

# 编辑 .env 文件，填入你的 OpenAI API Key
# OPENAI_API_KEY=your_api_key_here
# OPENAI_BASE_URL=https://api.openai.com/v1  # 可选，如使用代理

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

## 功能特点

### 核心功能
- **知识文件上传**: 支持 TXT、Markdown、PDF、Word 格式
- **场景选择**: 职场办公、校园学习、实操场景三种模式
- **沉浸式对话**: AI生成自然的人物对话，融入知识要点
- **学习进度追踪**: 随时查看已学习的知识点摘要

### 设计特点（避免AI味儿）
- 使用温暖的米色/棕色系配色，避免蓝紫渐变
- 使用SVG图标替代emoji
- 采用有层次感的布局设计，避免满屏圆角矩形卡片
- 细腻的交互动画和过渡效果

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/upload` | POST | 上传知识文件 |
| `/api/scenario` | POST | 设置学习场景 |
| `/api/start` | POST | 开始学习对话 |
| `/api/chat` | POST | 发送对话消息 |
| `/api/summary/:sessionId` | GET | 获取学习进度摘要 |

## 技术栈

### 后端
- Node.js + Express
- OpenAI API (GPT-4o-mini)
- Multer (文件上传)

### 前端
- React 18
- Vite
- Tailwind CSS
- Framer Motion (动画)
- Axios

## 注意事项

1. 需要有效的 OpenAI API Key
2. 如果在中国大陆使用，可能需要配置代理地址
3. 上传的文件会临时存储在 `backend/uploads/` 目录
