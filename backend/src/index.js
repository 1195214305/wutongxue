require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + Buffer.from(file.originalname, 'latin1').toString('utf8'));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.txt', '.md', '.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'));
    }
  }
});

// 通义千问客户端（兼容OpenAI接口）
const openai = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});

// 存储会话数据
const sessions = new Map();

// 上传知识文件
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }

    const filePath = req.file.path;
    let content = '';

    // 读取文件内容
    if (req.file.originalname.endsWith('.txt') || req.file.originalname.endsWith('.md')) {
      content = fs.readFileSync(filePath, 'utf-8');
    } else {
      // 对于其他格式，暂时返回提示
      content = fs.readFileSync(filePath, 'utf-8');
    }

    // 创建会话ID
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    sessions.set(sessionId, {
      content,
      fileName: req.file.originalname,
      messages: [],
      scenario: null
    });

    res.json({
      success: true,
      sessionId,
      fileName: req.file.originalname,
      message: '文件上传成功'
    });
  } catch (error) {
    console.error('上传错误:', error);
    res.status(500).json({ error: '文件上传失败' });
  }
});

// 选择学习场景
app.post('/api/scenario', async (req, res) => {
  try {
    const { sessionId, scenario } = req.body;

    if (!sessions.has(sessionId)) {
      return res.status(404).json({ error: '会话不存在' });
    }

    const session = sessions.get(sessionId);
    session.scenario = scenario;

    res.json({ success: true, message: '场景设置成功' });
  } catch (error) {
    console.error('场景设置错误:', error);
    res.status(500).json({ error: '场景设置失败' });
  }
});

// 开始学习对话
app.post('/api/start', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessions.has(sessionId)) {
      return res.status(404).json({ error: '会话不存在' });
    }

    const session = sessions.get(sessionId);
    const scenarioMap = {
      'workplace': '职场办公场景，如同事之间的协作讲解',
      'campus': '校园学习场景，如导师带教或同学讨论',
      'practice': '实操场景，如现场问题解决'
    };

    const systemPrompt = `你是一个情景式学习助手。请基于以下知识内容，构建一个${scenarioMap[session.scenario] || '自然的学习场景'}。

要求：
1. 以自然的人物对话推进情节
2. 对话需具备合理动机（如同事协作讲解、导师带教、场景化问题解决等）
3. 通过情节自然融入知识要点，避免密集问句
4. 以沉浸式体验帮助用户理解并掌握知识
5. 每次回复控制在合适的长度，让用户有参与感
6. 使用生动的场景描述和人物对话

知识内容：
${session.content}

请开始创建一个引人入胜的学习场景，介绍场景背景和主要人物，然后开始第一段对话。`;

    const completion = await openai.chat.completions.create({
      model: 'qwen-turbo',
      messages: [
        { role: 'system', content: systemPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1500
    });

    const assistantMessage = completion.choices[0].message.content;

    session.messages = [
      { role: 'system', content: systemPrompt },
      { role: 'assistant', content: assistantMessage }
    ];

    res.json({
      success: true,
      message: assistantMessage
    });
  } catch (error) {
    console.error('开始学习错误:', error);
    res.status(500).json({ error: '开始学习失败: ' + error.message });
  }
});

// 继续对话
app.post('/api/chat', async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessions.has(sessionId)) {
      return res.status(404).json({ error: '会话不存在' });
    }

    const session = sessions.get(sessionId);
    session.messages.push({ role: 'user', content: message });

    const completion = await openai.chat.completions.create({
      model: 'qwen-turbo',
      messages: session.messages,
      temperature: 0.8,
      max_tokens: 1500
    });

    const assistantMessage = completion.choices[0].message.content;
    session.messages.push({ role: 'assistant', content: assistantMessage });

    res.json({
      success: true,
      message: assistantMessage
    });
  } catch (error) {
    console.error('对话错误:', error);
    res.status(500).json({ error: '对话失败: ' + error.message });
  }
});

// 获取学习进度摘要
app.get('/api/summary/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessions.has(sessionId)) {
      return res.status(404).json({ error: '会话不存在' });
    }

    const session = sessions.get(sessionId);

    const summaryPrompt = `请根据之前的对话，总结用户已经学习到的知识要点，以及还有哪些知识点需要继续学习。用简洁的列表形式呈现。`;

    const completion = await openai.chat.completions.create({
      model: 'qwen-turbo',
      messages: [
        ...session.messages,
        { role: 'user', content: summaryPrompt }
      ],
      temperature: 0.5,
      max_tokens: 800
    });

    res.json({
      success: true,
      summary: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('获取摘要错误:', error);
    res.status(500).json({ error: '获取摘要失败' });
  }
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
