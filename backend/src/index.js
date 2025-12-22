require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const WordExtractor = require('word-extractor');
const db = require('./db');

// Word .doc 文件解析器
const wordExtractor = new WordExtractor();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'wutongxue_secret_key_2025';

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查路由（用于监控服务状态）
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: '无痛学后端服务运行正常',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 配置临时文件上传（用于解析 .doc 文件）
const tempUpload = multer({
  dest: 'uploads/temp/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB 限制
});

// 解析 .doc 文件 API
app.post('/api/parse-doc', tempUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }

    const filePath = req.file.path;

    try {
      const extracted = await wordExtractor.extract(filePath);
      const text = extracted.getBody();

      // 删除临时文件
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        content: text
      });
    } catch (parseError) {
      // 删除临时文件
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw new Error('无法解析此 .doc 文件，可能文件已损坏或格式不兼容');
    }
  } catch (error) {
    console.error('解析 .doc 文件错误:', error);
    res.status(500).json({ error: error.message || '解析文件失败' });
  }
});

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

// JWT 验证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未登录' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '登录已过期，请重新登录' });
    }
    req.user = user;
    next();
  });
};

// 可选的认证中间件（允许未登录用户）
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
};

// ==================== 用户认证接口 ====================

// 注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: '用户名长度需要在3-20个字符之间' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少6个字符' });
    }

    // 检查用户名是否已存在
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // 创建用户
    db.prepare('INSERT INTO users (id, username, password, nickname) VALUES (?, ?, ?, ?)').run(
      userId,
      username,
      hashedPassword,
      nickname || username
    );

    // 生成 token
    const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      message: '注册成功',
      token,
      user: {
        id: userId,
        username,
        nickname: nickname || username
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

// 登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    // 查找用户
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.status(400).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: '用户名或密码错误' });
    }

    // 生成 token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});

// 获取当前用户信息
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, username, nickname, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// ==================== 学习历史接口 ====================

// 获取用户的学习历史
app.get('/api/history', authenticateToken, (req, res) => {
  try {
    const sessions = db.prepare(`
      SELECT id, file_name, scenario, model, created_at, updated_at
      FROM sessions
      WHERE user_id = ?
      ORDER BY updated_at DESC
    `).all(req.user.id);

    res.json({ success: true, history: sessions });
  } catch (error) {
    console.error('获取历史记录错误:', error);
    res.status(500).json({ error: '获取历史记录失败' });
  }
});

// 获取会话详情（包含消息）
app.get('/api/session/:sessionId', authenticateToken, (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = db.prepare(`
      SELECT * FROM sessions WHERE id = ? AND user_id = ?
    `).get(sessionId, req.user.id);

    if (!session) {
      return res.status(404).json({ error: '会话不存在' });
    }

    const messages = db.prepare(`
      SELECT role, content, created_at FROM messages WHERE session_id = ? ORDER BY created_at ASC
    `).all(sessionId);

    res.json({
      success: true,
      session: {
        ...session,
        messages
      }
    });
  } catch (error) {
    console.error('获取会话详情错误:', error);
    res.status(500).json({ error: '获取会话详情失败' });
  }
});

// 删除历史记录
app.delete('/api/history/:sessionId', authenticateToken, (req, res) => {
  try {
    const { sessionId } = req.params;

    // 验证会话属于当前用户
    const session = db.prepare('SELECT id FROM sessions WHERE id = ? AND user_id = ?').get(sessionId, req.user.id);
    if (!session) {
      return res.status(404).json({ error: '会话不存在' });
    }

    // 删除消息和会话
    db.prepare('DELETE FROM messages WHERE session_id = ?').run(sessionId);
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);

    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除历史记录错误:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

// ==================== 原有接口（改造支持用户系统） ====================

// 存储会话数据（内存缓存，用于未登录用户）
const memorySessions = new Map();

// 创建新会话
app.post('/api/session/create', optionalAuth, async (req, res) => {
  try {
    const { fileName, fileContent, scenario, model } = req.body;
    const sessionId = uuidv4();

    if (req.user) {
      // 已登录用户，保存到数据库
      db.prepare(`
        INSERT INTO sessions (id, user_id, file_name, file_content, scenario, model)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(sessionId, req.user.id, fileName, fileContent, scenario, model || 'qwen-turbo');
    } else {
      // 未登录用户，保存到内存
      memorySessions.set(sessionId, {
        fileName,
        fileContent,
        scenario,
        model: model || 'qwen-turbo',
        messages: []
      });
    }

    res.json({ success: true, sessionId });
  } catch (error) {
    console.error('创建会话错误:', error);
    res.status(500).json({ error: '创建会话失败' });
  }
});

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

    memorySessions.set(sessionId, {
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

    if (!memorySessions.has(sessionId)) {
      return res.status(404).json({ error: '会话不存在' });
    }

    const session = memorySessions.get(sessionId);
    session.scenario = scenario;

    res.json({ success: true, message: '场景设置成功' });
  } catch (error) {
    console.error('场景设置错误:', error);
    res.status(500).json({ error: '场景设置失败' });
  }
});

// 开始学习对话（支持流式输出）
app.post('/api/start', optionalAuth, async (req, res) => {
  try {
    const { sessionId, content, scenario, model, stream } = req.body;

    const scenarioMap = {
      'workplace': '职场办公场景，如同事之间的协作讲解',
      'campus': '校园学习场景，如导师带教或同学讨论',
      'practice': '实操场景，如现场问题解决'
    };

    const systemPrompt = `你是一个情景式学习助手。请基于以下知识内容，构建一个${scenarioMap[scenario] || '自然的学习场景'}。

要求：
1. 以自然的人物对话推进情节
2. 对话需具备合理动机（如同事协作讲解、导师带教、场景化问题解决等）
3. 通过情节自然融入知识要点，避免密集问句
4. 以沉浸式体验帮助用户理解并掌握知识
5. 每次回复控制在合适的长度，让用户有参与感
6. 使用生动的场景描述和人物对话

知识内容：
${content}

请开始创建一个引人入胜的学习场景，介绍场景背景和主要人物，然后开始第一段对话。`;

    const useModel = model || 'qwen-turbo';

    if (stream) {
      // 流式输出
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const completion = await openai.chat.completions.create({
        model: useModel,
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: 0.8,
        max_tokens: 1500,
        stream: true
      });

      let fullContent = '';

      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      // 保存消息到数据库（如果用户已登录）
      if (req.user && sessionId) {
        db.prepare('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)').run(sessionId, 'system', systemPrompt);
        db.prepare('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)').run(sessionId, 'assistant', fullContent);
      }

      res.write(`data: [DONE]\n\n`);
      res.end();
    } else {
      // 非流式输出
      const completion = await openai.chat.completions.create({
        model: useModel,
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: 0.8,
        max_tokens: 1500
      });

      const assistantMessage = completion.choices[0].message.content;

      // 保存消息到数据库（如果用户已登录）
      if (req.user && sessionId) {
        db.prepare('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)').run(sessionId, 'system', systemPrompt);
        db.prepare('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)').run(sessionId, 'assistant', assistantMessage);
      }

      res.json({
        success: true,
        message: assistantMessage
      });
    }
  } catch (error) {
    console.error('开始学习错误:', error);
    res.status(500).json({ error: '开始学习失败: ' + error.message });
  }
});

// 继续对话（支持流式输出）
app.post('/api/chat', optionalAuth, async (req, res) => {
  try {
    const { sessionId, message, messages: clientMessages, model, stream } = req.body;

    let apiMessages = [];
    const useModel = model || 'qwen-turbo';

    // 使用客户端传来的消息历史
    if (clientMessages && clientMessages.length > 0) {
      apiMessages = clientMessages;
    }

    apiMessages.push({ role: 'user', content: message });

    if (stream) {
      // 流式输出
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const completion = await openai.chat.completions.create({
        model: useModel,
        messages: apiMessages,
        temperature: 0.8,
        max_tokens: 1500,
        stream: true
      });

      let fullContent = '';

      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      // 保存消息到数据库（如果用户已登录）
      if (req.user && sessionId) {
        db.prepare('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)').run(sessionId, 'user', message);
        db.prepare('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)').run(sessionId, 'assistant', fullContent);
        db.prepare('UPDATE sessions SET updated_at = ? WHERE id = ?').run(Date.now(), sessionId);
      }

      res.write(`data: [DONE]\n\n`);
      res.end();
    } else {
      // 非流式输出
      const completion = await openai.chat.completions.create({
        model: useModel,
        messages: apiMessages,
        temperature: 0.8,
        max_tokens: 1500
      });

      const assistantMessage = completion.choices[0].message.content;

      // 保存消息到数据库（如果用户已登录）
      if (req.user && sessionId) {
        db.prepare('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)').run(sessionId, 'user', message);
        db.prepare('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)').run(sessionId, 'assistant', assistantMessage);
        db.prepare('UPDATE sessions SET updated_at = ? WHERE id = ?').run(Date.now(), sessionId);
      }

      res.json({
        success: true,
        message: assistantMessage
      });
    }
  } catch (error) {
    console.error('对话错误:', error);
    res.status(500).json({ error: '对话失败: ' + error.message });
  }
});

// ==================== 管理员接口 ====================

// 查看注册用户统计（需要管理员密钥）
app.get('/api/admin/stats', (req, res) => {
  try {
    const adminKey = req.query.key;
    const expectedKey = process.env.ADMIN_KEY || 'wutongxue_admin_2025';

    if (adminKey !== expectedKey) {
      return res.status(403).json({ error: '无权访问' });
    }

    const users = db.prepare('SELECT id, username, nickname, created_at FROM users ORDER BY created_at DESC').all();
    const sessionCount = db.prepare('SELECT COUNT(*) as count FROM sessions').get().count;
    const messageCount = db.prepare('SELECT COUNT(*) as count FROM messages').get().count;

    res.json({
      success: true,
      stats: {
        userCount: users.length,
        sessionCount,
        messageCount
      },
      users: users.map(u => ({
        id: u.id,
        username: u.username,
        nickname: u.nickname,
        createdAt: new Date(u.created_at).toLocaleString('zh-CN')
      }))
    });
  } catch (error) {
    console.error('获取统计信息错误:', error);
    res.status(500).json({ error: '获取统计信息失败' });
  }
});

// 获取学习进度摘要
app.get('/api/summary/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!memorySessions.has(sessionId)) {
      return res.status(404).json({ error: '会话不存在' });
    }

    const session = memorySessions.get(sessionId);

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
