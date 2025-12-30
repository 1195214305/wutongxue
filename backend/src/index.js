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
const immersiveLearningService = require('./services/immersiveLearningService');

// Word .doc 文件解析器
const wordExtractor = new WordExtractor();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'wutongxue_secret_key_2025';

// 中间件
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// 沉浸式学习 API 测试端点
app.get('/api/immersive-learning/test', (req, res) => {
  res.json({
    status: 'ok',
    message: '沉浸式学习 API 可用',
    timestamp: new Date().toISOString()
  });
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
    const existingUser = await db.get('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // 创建用户
    await db.run(
      'INSERT INTO users (id, username, password, nickname) VALUES (?, ?, ?, ?)',
      [userId, username, hashedPassword, nickname || username]
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
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
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
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.get('SELECT id, username, nickname, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// 用户修改密码
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: '请输入旧密码和新密码' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: '新密码至少6个字符' });
    }

    // 获取用户当前密码
    const user = await db.get('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 验证旧密码
    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: '旧密码错误' });
    }

    // 加密新密码并更新
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    res.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({ error: '修改密码失败' });
  }
});

// 管理员密码重置接口（需要管理员密钥）
app.post('/api/admin/reset-password', async (req, res) => {
  try {
    const { adminKey, username, newPassword } = req.body;

    // 验证管理员密钥（使用环境变量中的密钥）
    const ADMIN_KEY = process.env.ADMIN_KEY || 'wutongxue_admin_2025';
    if (adminKey !== ADMIN_KEY) {
      return res.status(403).json({ error: '管理员密钥错误' });
    }

    if (!username || !newPassword) {
      return res.status(400).json({ error: '用户名和新密码不能为空' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: '密码至少6个字符' });
    }

    // 查找用户
    const user = await db.get('SELECT id FROM users WHERE username = ?', [username]);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);

    res.json({ success: true, message: `用户 ${username} 的密码已重置` });
  } catch (error) {
    console.error('重置密码错误:', error);
    res.status(500).json({ error: '重置密码失败' });
  }
});

// ==================== 学习历史接口 ====================

// 获取用户的学习历史
app.get('/api/history', authenticateToken, async (req, res) => {
  try {
    const sessions = await db.all(
      `SELECT id, file_name, scenario, model, created_at, updated_at
       FROM sessions
       WHERE user_id = ?
       ORDER BY updated_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, history: sessions });
  } catch (error) {
    console.error('获取历史记录错误:', error);
    res.status(500).json({ error: '获取历史记录失败' });
  }
});

// 获取会话详情（包含消息）
app.get('/api/session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await db.get(
      'SELECT * FROM sessions WHERE id = ? AND user_id = ?',
      [sessionId, req.user.id]
    );

    if (!session) {
      return res.status(404).json({ error: '会话不存在' });
    }

    const messages = await db.all(
      'SELECT role, content, created_at FROM messages WHERE session_id = ? ORDER BY created_at ASC',
      [sessionId]
    );

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
app.delete('/api/history/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // 验证会话属于当前用户
    const session = await db.get('SELECT id FROM sessions WHERE id = ? AND user_id = ?', [sessionId, req.user.id]);
    if (!session) {
      return res.status(404).json({ error: '会话不存在' });
    }

    // 删除消息和会话
    await db.run('DELETE FROM messages WHERE session_id = ?', [sessionId]);
    await db.run('DELETE FROM sessions WHERE id = ?', [sessionId]);

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
      await db.run(
        `INSERT INTO sessions (id, user_id, file_name, file_content, scenario, model)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [sessionId, req.user.id, fileName || '', fileContent || '', scenario || null, model || 'qwen-turbo']
      );
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
        await db.run('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)', [sessionId, 'system', systemPrompt]);
        await db.run('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)', [sessionId, 'assistant', fullContent]);
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
        await db.run('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)', [sessionId, 'system', systemPrompt]);
        await db.run('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)', [sessionId, 'assistant', assistantMessage]);
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
        await db.run('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)', [sessionId, 'user', message]);
        await db.run('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)', [sessionId, 'assistant', fullContent]);
        await db.run('UPDATE sessions SET updated_at = ? WHERE id = ?', [Date.now(), sessionId]);
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
        await db.run('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)', [sessionId, 'user', message]);
        await db.run('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)', [sessionId, 'assistant', assistantMessage]);
        await db.run('UPDATE sessions SET updated_at = ? WHERE id = ?', [Date.now(), sessionId]);
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

// 管理员密钥验证中间件
const ADMIN_KEY = process.env.ADMIN_KEY || 'wutongxue_admin_2025';

const adminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'] || req.query.key;
  if (adminKey !== ADMIN_KEY) {
    return res.status(403).json({ error: '无权访问' });
  }
  next();
};

// 验证管理员密钥
app.post('/api/admin/verify', (req, res) => {
  const { key } = req.body;
  if (key === ADMIN_KEY) {
    res.json({ success: true, message: '验证成功' });
  } else {
    res.status(403).json({ error: '密钥错误' });
  }
});

// 获取详细统计数据
app.get('/api/admin/stats', adminAuth, async (req, res) => {
  try {
    // 用户总数
    const userCountResult = await db.get('SELECT COUNT(*) as count FROM users', []);
    const sessionCountResult = await db.get('SELECT COUNT(*) as count FROM sessions', []);
    const messageCountResult = await db.get('SELECT COUNT(*) as count FROM messages', []);
    const immersiveCountResult = await db.get('SELECT COUNT(*) as count FROM immersive_sessions', []);
    const fileCountResult = await db.get('SELECT COUNT(*) as count FROM uploaded_files', []);

    // 今日新注册用户
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    const todayUsersResult = await db.get('SELECT COUNT(*) as count FROM users WHERE created_at >= ?', [todayTimestamp]);
    const todaySessionsResult = await db.get('SELECT COUNT(*) as count FROM sessions WHERE updated_at >= ?', [todayTimestamp]);

    res.json({
      success: true,
      stats: {
        userCount: userCountResult?.count || 0,
        sessionCount: sessionCountResult?.count || 0,
        messageCount: messageCountResult?.count || 0,
        immersiveSessionCount: immersiveCountResult?.count || 0,
        uploadedFileCount: fileCountResult?.count || 0,
        todayUsers: todayUsersResult?.count || 0,
        todaySessions: todaySessionsResult?.count || 0
      }
    });
  } catch (error) {
    console.error('获取统计信息错误:', error);
    res.status(500).json({ error: '获取统计信息失败' });
  }
});

// 获取用户列表（含详细活跃数据）
app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const users = await db.all(
      `SELECT
        u.id,
        u.username,
        u.nickname,
        u.created_at,
        COUNT(DISTINCT s.id) as session_count,
        COUNT(m.id) as message_count,
        (SELECT COUNT(*) FROM immersive_sessions WHERE user_id = u.id) as immersive_count,
        MAX(s.updated_at) as last_active
      FROM users u
      LEFT JOIN sessions s ON u.id = s.user_id
      LEFT JOIN messages m ON s.id = m.session_id
      GROUP BY u.id
      ORDER BY u.created_at DESC`,
      []
    );

    res.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        username: u.username,
        nickname: u.nickname,
        createdAt: u.created_at,
        sessionCount: u.session_count || 0,
        immersiveCount: u.immersive_count || 0,
        messageCount: u.message_count || 0,
        lastActive: u.last_active || u.created_at,
        isActive: (u.session_count > 0) || (u.immersive_count > 0)
      }))
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// 获取用户详情（学习记录）
app.get('/api/admin/users/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await db.get('SELECT id, username, nickname, created_at FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 获取情景对话会话
    const sessions = await db.all(
      `SELECT
        s.id,
        s.file_name,
        s.scenario,
        s.model,
        s.created_at,
        s.updated_at,
        COUNT(m.id) as message_count
      FROM sessions s
      LEFT JOIN messages m ON s.id = m.session_id
      WHERE s.user_id = ?
      GROUP BY s.id
      ORDER BY s.updated_at DESC`,
      [userId]
    );

    // 获取沉浸式学习会话
    const immersiveSessions = await db.all(
      `SELECT
        id,
        file_name,
        content_hash,
        content_length,
        user_profile,
        model_used,
        learning_mode,
        created_at
      FROM immersive_sessions
      WHERE user_id = ?
      ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      user: {
        ...user,
        sessions: sessions.map(s => ({
          id: s.id,
          fileName: s.file_name,
          scenario: s.scenario,
          model: s.model,
          createdAt: s.created_at,
          updatedAt: s.updated_at,
          messageCount: s.message_count || 0,
          type: 'scenario'
        })),
        immersiveSessions: immersiveSessions.map(s => ({
          id: s.id,
          fileName: s.file_name,
          contentHash: s.content_hash,
          contentLength: s.content_length,
          userProfile: s.user_profile ? JSON.parse(s.user_profile) : null,
          modelUsed: s.model_used,
          learningMode: s.learning_mode,
          createdAt: s.created_at,
          type: 'immersive'
        }))
      }
    });
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({ error: '获取用户详情失败' });
  }
});

// 管理员获取所有沉浸式学习会话
app.get('/api/admin/immersive-sessions', adminAuth, async (req, res) => {
  try {
    const sessions = await db.all(
      `SELECT
        i.id,
        i.user_id,
        i.file_name,
        i.content_hash,
        i.content_length,
        i.user_profile,
        i.model_used,
        i.learning_mode,
        i.created_at,
        u.username,
        u.nickname
      FROM immersive_sessions i
      LEFT JOIN users u ON i.user_id = u.id
      ORDER BY i.created_at DESC
      LIMIT 100`,
      []
    );

    res.json({
      success: true,
      sessions: sessions.map(s => ({
        id: s.id,
        userId: s.user_id,
        username: s.username,
        nickname: s.nickname,
        fileName: s.file_name,
        contentHash: s.content_hash,
        contentLength: s.content_length,
        userProfile: s.user_profile ? JSON.parse(s.user_profile) : null,
        modelUsed: s.model_used,
        learningMode: s.learning_mode,
        createdAt: s.created_at
      }))
    });
  } catch (error) {
    console.error('获取沉浸式学习会话列表错误:', error);
    res.status(500).json({ error: '获取列表失败' });
  }
});

// 管理员获取所有上传的文件
app.get('/api/admin/uploaded-files', adminAuth, async (req, res) => {
  try {
    const files = await db.all(
      `SELECT
        f.id,
        f.content_hash,
        f.file_name,
        f.file_size,
        f.upload_count,
        f.first_uploaded_by,
        f.created_at,
        u.username,
        u.nickname
      FROM uploaded_files f
      LEFT JOIN users u ON f.first_uploaded_by = u.id
      ORDER BY f.created_at DESC
      LIMIT 100`,
      []
    );

    res.json({
      success: true,
      files: files.map(f => ({
        id: f.id,
        contentHash: f.content_hash,
        fileName: f.file_name,
        fileSize: f.file_size,
        uploadCount: f.upload_count,
        firstUploadedBy: f.first_uploaded_by,
        uploaderUsername: f.username,
        uploaderNickname: f.nickname,
        createdAt: f.created_at
      }))
    });
  } catch (error) {
    console.error('获取上传文件列表错误:', error);
    res.status(500).json({ error: '获取列表失败' });
  }
});

// ==================== 学习笔记接口 ====================

// 获取用户笔记列表
app.get('/api/notes', authenticateToken, async (req, res) => {
  try {
    const notes = await db.all(
      `SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, notes });
  } catch (error) {
    console.error('获取笔记错误:', error);
    res.status(500).json({ error: '获取笔记失败' });
  }
});

// 创建笔记
app.post('/api/notes', authenticateToken, async (req, res) => {
  try {
    const { sessionId, fileName, content } = req.body;
    const noteId = uuidv4();
    const now = Date.now();

    await db.run(
      `INSERT INTO notes (id, user_id, session_id, file_name, content, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [noteId, req.user.id, sessionId || null, fileName || null, content, now, now]
    );

    res.json({ success: true, noteId, message: '笔记保存成功' });
  } catch (error) {
    console.error('创建笔记错误:', error);
    res.status(500).json({ error: '保存笔记失败' });
  }
});

// 更新笔记
app.put('/api/notes/:noteId', authenticateToken, async (req, res) => {
  try {
    const { noteId } = req.params;
    const { content } = req.body;

    const note = await db.get('SELECT id FROM notes WHERE id = ? AND user_id = ?', [noteId, req.user.id]);
    if (!note) {
      return res.status(404).json({ error: '笔记不存在' });
    }

    await db.run(
      'UPDATE notes SET content = ?, updated_at = ? WHERE id = ?',
      [content, Date.now(), noteId]
    );

    res.json({ success: true, message: '笔记更新成功' });
  } catch (error) {
    console.error('更新笔记错误:', error);
    res.status(500).json({ error: '更新笔记失败' });
  }
});

// 删除笔记
app.delete('/api/notes/:noteId', authenticateToken, async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await db.get('SELECT id FROM notes WHERE id = ? AND user_id = ?', [noteId, req.user.id]);
    if (!note) {
      return res.status(404).json({ error: '笔记不存在' });
    }

    await db.run('DELETE FROM notes WHERE id = ?', [noteId]);
    res.json({ success: true, message: '笔记删除成功' });
  } catch (error) {
    console.error('删除笔记错误:', error);
    res.status(500).json({ error: '删除笔记失败' });
  }
});

// ==================== 知识收藏接口 ====================

// 获取用户收藏列表
app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const favorites = await db.all(
      `SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, favorites });
  } catch (error) {
    console.error('获取收藏错误:', error);
    res.status(500).json({ error: '获取收藏失败' });
  }
});

// 添加收藏
app.post('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const { sessionId, fileName, content, tag } = req.body;
    const favoriteId = uuidv4();

    await db.run(
      `INSERT INTO favorites (id, user_id, session_id, file_name, content, tag, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [favoriteId, req.user.id, sessionId || null, fileName || null, content, tag || null, Date.now()]
    );

    res.json({ success: true, favoriteId, message: '收藏成功' });
  } catch (error) {
    console.error('添加收藏错误:', error);
    res.status(500).json({ error: '收藏失败' });
  }
});

// 更新收藏标签
app.put('/api/favorites/:favoriteId', authenticateToken, async (req, res) => {
  try {
    const { favoriteId } = req.params;
    const { tag, content } = req.body;

    const favorite = await db.get('SELECT id FROM favorites WHERE id = ? AND user_id = ?', [favoriteId, req.user.id]);
    if (!favorite) {
      return res.status(404).json({ error: '收藏不存在' });
    }

    if (content !== undefined) {
      await db.run('UPDATE favorites SET content = ?, tag = ? WHERE id = ?', [content, tag, favoriteId]);
    } else {
      await db.run('UPDATE favorites SET tag = ? WHERE id = ?', [tag, favoriteId]);
    }

    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新收藏错误:', error);
    res.status(500).json({ error: '更新失败' });
  }
});

// 删除收藏
app.delete('/api/favorites/:favoriteId', authenticateToken, async (req, res) => {
  try {
    const { favoriteId } = req.params;

    const favorite = await db.get('SELECT id FROM favorites WHERE id = ? AND user_id = ?', [favoriteId, req.user.id]);
    if (!favorite) {
      return res.status(404).json({ error: '收藏不存在' });
    }

    await db.run('DELETE FROM favorites WHERE id = ?', [favoriteId]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除收藏错误:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

// ==================== 学习目标接口 ====================

// 获取用户目标
app.get('/api/goals', authenticateToken, async (req, res) => {
  try {
    const goals = await db.all(
      `SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, goals });
  } catch (error) {
    console.error('获取目标错误:', error);
    res.status(500).json({ error: '获取目标失败' });
  }
});

// 创建/更新目标
app.post('/api/goals', authenticateToken, async (req, res) => {
  try {
    const { content, type, targetMinutes } = req.body;
    const goalId = uuidv4();

    await db.run(
      `INSERT INTO goals (id, user_id, content, type, target_minutes, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [goalId, req.user.id, content, type || 'daily', targetMinutes || 30, Date.now()]
    );

    res.json({ success: true, goalId, message: '目标设置成功' });
  } catch (error) {
    console.error('创建目标错误:', error);
    res.status(500).json({ error: '设置目标失败' });
  }
});

// 更新目标完成状态
app.put('/api/goals/:goalId', authenticateToken, async (req, res) => {
  try {
    const { goalId } = req.params;
    const { completed, content, targetMinutes } = req.body;

    const goal = await db.get('SELECT id FROM goals WHERE id = ? AND user_id = ?', [goalId, req.user.id]);
    if (!goal) {
      return res.status(404).json({ error: '目标不存在' });
    }

    if (completed !== undefined) {
      await db.run('UPDATE goals SET completed = ? WHERE id = ?', [completed ? 1 : 0, goalId]);
    }
    if (content !== undefined) {
      await db.run('UPDATE goals SET content = ? WHERE id = ?', [content, goalId]);
    }
    if (targetMinutes !== undefined) {
      await db.run('UPDATE goals SET target_minutes = ? WHERE id = ?', [targetMinutes, goalId]);
    }

    res.json({ success: true, message: '目标更新成功' });
  } catch (error) {
    console.error('更新目标错误:', error);
    res.status(500).json({ error: '更新目标失败' });
  }
});

// 删除目标
app.delete('/api/goals/:goalId', authenticateToken, async (req, res) => {
  try {
    const { goalId } = req.params;

    const goal = await db.get('SELECT id FROM goals WHERE id = ? AND user_id = ?', [goalId, req.user.id]);
    if (!goal) {
      return res.status(404).json({ error: '目标不存在' });
    }

    await db.run('DELETE FROM goals WHERE id = ?', [goalId]);
    res.json({ success: true, message: '目标删除成功' });
  } catch (error) {
    console.error('删除目标错误:', error);
    res.status(500).json({ error: '删除目标失败' });
  }
});

// ==================== 打卡记录接口 ====================

// 获取用户打卡记录
app.get('/api/checkins', authenticateToken, async (req, res) => {
  try {
    const checkins = await db.all(
      `SELECT * FROM checkins WHERE user_id = ? ORDER BY checkin_date DESC LIMIT 365`,
      [req.user.id]
    );
    res.json({ success: true, checkins });
  } catch (error) {
    console.error('获取打卡记录错误:', error);
    res.status(500).json({ error: '获取打卡记录失败' });
  }
});

// 今日打卡
app.post('/api/checkins', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 检查今天是否已打卡
    const existing = await db.get(
      'SELECT id FROM checkins WHERE user_id = ? AND checkin_date = ?',
      [req.user.id, today]
    );

    if (existing) {
      return res.json({ success: true, message: '今日已打卡', alreadyChecked: true });
    }

    await db.run(
      `INSERT INTO checkins (user_id, checkin_date, created_at) VALUES (?, ?, ?)`,
      [req.user.id, today, Date.now()]
    );

    // 计算连续打卡天数
    const checkins = await db.all(
      `SELECT checkin_date FROM checkins WHERE user_id = ? ORDER BY checkin_date DESC`,
      [req.user.id]
    );

    let streak = 1;
    for (let i = 1; i < checkins.length; i++) {
      const prevDate = new Date(checkins[i - 1].checkin_date);
      const currDate = new Date(checkins[i].checkin_date);
      const diffDays = (prevDate - currDate) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    res.json({ success: true, message: '打卡成功', streak });
  } catch (error) {
    console.error('打卡错误:', error);
    res.status(500).json({ error: '打卡失败' });
  }
});

// ==================== 错题本接口 ====================

// 获取用户错题
app.get('/api/wrong-questions', authenticateToken, async (req, res) => {
  try {
    const questions = await db.all(
      `SELECT * FROM wrong_questions WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, questions });
  } catch (error) {
    console.error('获取错题错误:', error);
    res.status(500).json({ error: '获取错题失败' });
  }
});

// 添加错题
app.post('/api/wrong-questions', authenticateToken, async (req, res) => {
  try {
    const { sessionId, fileName, question, options, correctIndex, userAnswer, explanation } = req.body;
    const questionId = uuidv4();

    await db.run(
      `INSERT INTO wrong_questions (id, user_id, session_id, file_name, question, options, correct_index, user_answer, explanation, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [questionId, req.user.id, sessionId || null, fileName || null, question, JSON.stringify(options), correctIndex, userAnswer, explanation || null, Date.now()]
    );

    res.json({ success: true, questionId, message: '错题已记录' });
  } catch (error) {
    console.error('添加错题错误:', error);
    res.status(500).json({ error: '记录错题失败' });
  }
});

// 更新错题状态（重做/标记掌握）
app.put('/api/wrong-questions/:questionId', authenticateToken, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { mastered, retryCount } = req.body;

    const question = await db.get('SELECT id FROM wrong_questions WHERE id = ? AND user_id = ?', [questionId, req.user.id]);
    if (!question) {
      return res.status(404).json({ error: '错题不存在' });
    }

    if (mastered !== undefined) {
      await db.run('UPDATE wrong_questions SET mastered = ? WHERE id = ?', [mastered ? 1 : 0, questionId]);
    }
    if (retryCount !== undefined) {
      await db.run('UPDATE wrong_questions SET retry_count = ?, last_retry = ? WHERE id = ?', [retryCount, Date.now(), questionId]);
    }

    res.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新错题错误:', error);
    res.status(500).json({ error: '更新失败' });
  }
});

// 删除错题
app.delete('/api/wrong-questions/:questionId', authenticateToken, async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await db.get('SELECT id FROM wrong_questions WHERE id = ? AND user_id = ?', [questionId, req.user.id]);
    if (!question) {
      return res.status(404).json({ error: '错题不存在' });
    }

    await db.run('DELETE FROM wrong_questions WHERE id = ?', [questionId]);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除错题错误:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

// ==================== 学习成就接口 ====================

// 获取用户成就
app.get('/api/achievements', authenticateToken, async (req, res) => {
  try {
    const achievements = await db.all(
      `SELECT * FROM achievements WHERE user_id = ? ORDER BY unlocked_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, achievements });
  } catch (error) {
    console.error('获取成就错误:', error);
    res.status(500).json({ error: '获取成就失败' });
  }
});

// 解锁成就
app.post('/api/achievements', authenticateToken, async (req, res) => {
  try {
    const { achievementId } = req.body;

    // 检查是否已解锁
    const existing = await db.get(
      'SELECT id FROM achievements WHERE user_id = ? AND achievement_id = ?',
      [req.user.id, achievementId]
    );

    if (existing) {
      return res.json({ success: true, message: '成就已解锁', alreadyUnlocked: true });
    }

    await db.run(
      `INSERT INTO achievements (user_id, achievement_id, unlocked_at) VALUES (?, ?, ?)`,
      [req.user.id, achievementId, Date.now()]
    );

    res.json({ success: true, message: '成就解锁成功' });
  } catch (error) {
    console.error('解锁成就错误:', error);
    res.status(500).json({ error: '解锁成就失败' });
  }
});

// ==================== 学习统计接口 ====================

// 获取用户学习统计
app.get('/api/learning-stats', authenticateToken, async (req, res) => {
  try {
    // 获取最近30天的统计
    const stats = await db.all(
      `SELECT * FROM learning_stats WHERE user_id = ? ORDER BY stat_date DESC LIMIT 30`,
      [req.user.id]
    );

    // 获取总体统计
    const totalStats = await db.get(
      `SELECT
        SUM(learning_time) as total_time,
        SUM(session_count) as total_sessions,
        SUM(quiz_count) as total_quizzes,
        SUM(correct_count) as total_correct,
        SUM(total_questions) as total_questions
      FROM learning_stats WHERE user_id = ?`,
      [req.user.id]
    );

    // 获取场景分布
    const scenarioStats = await db.all(
      `SELECT scenario, COUNT(*) as count FROM sessions WHERE user_id = ? AND scenario IS NOT NULL GROUP BY scenario`,
      [req.user.id]
    );

    // 获取连续学习天数
    const checkins = await db.all(
      `SELECT checkin_date FROM checkins WHERE user_id = ? ORDER BY checkin_date DESC`,
      [req.user.id]
    );

    let streak = 0;
    if (checkins.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (checkins[0].checkin_date === today || checkins[0].checkin_date === yesterday) {
        streak = 1;
        for (let i = 1; i < checkins.length; i++) {
          const prevDate = new Date(checkins[i - 1].checkin_date);
          const currDate = new Date(checkins[i].checkin_date);
          const diffDays = (prevDate - currDate) / (1000 * 60 * 60 * 24);
          if (diffDays === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    res.json({
      success: true,
      dailyStats: stats,
      totalStats: {
        totalTime: totalStats?.total_time || 0,
        totalSessions: totalStats?.total_sessions || 0,
        totalQuizzes: totalStats?.total_quizzes || 0,
        totalCorrect: totalStats?.total_correct || 0,
        totalQuestions: totalStats?.total_questions || 0,
        accuracy: totalStats?.total_questions > 0
          ? Math.round((totalStats.total_correct / totalStats.total_questions) * 100)
          : 0
      },
      scenarioStats,
      streak
    });
  } catch (error) {
    console.error('获取学习统计错误:', error);
    res.status(500).json({ error: '获取学习统计失败' });
  }
});

// 更新今日学习统计
app.post('/api/learning-stats', authenticateToken, async (req, res) => {
  try {
    const { learningTime, sessionCount, quizCount, correctCount, totalQuestions } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // 检查今天是否已有记录
    const existing = await db.get(
      'SELECT * FROM learning_stats WHERE user_id = ? AND stat_date = ?',
      [req.user.id, today]
    );

    if (existing) {
      // 更新现有记录
      await db.run(
        `UPDATE learning_stats SET
          learning_time = learning_time + ?,
          session_count = session_count + ?,
          quiz_count = quiz_count + ?,
          correct_count = correct_count + ?,
          total_questions = total_questions + ?
        WHERE user_id = ? AND stat_date = ?`,
        [learningTime || 0, sessionCount || 0, quizCount || 0, correctCount || 0, totalQuestions || 0, req.user.id, today]
      );
    } else {
      // 创建新记录
      await db.run(
        `INSERT INTO learning_stats (user_id, stat_date, learning_time, session_count, quiz_count, correct_count, total_questions)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, today, learningTime || 0, sessionCount || 0, quizCount || 0, correctCount || 0, totalQuestions || 0]
      );
    }

    res.json({ success: true, message: '统计更新成功' });
  } catch (error) {
    console.error('更新学习统计错误:', error);
    res.status(500).json({ error: '更新统计失败' });
  }
});

// ==================== 学习提醒接口 ====================

// 获取用户提醒设置
app.get('/api/reminders', authenticateToken, async (req, res) => {
  try {
    const reminder = await db.get(
      `SELECT * FROM reminders WHERE user_id = ?`,
      [req.user.id]
    );
    res.json({ success: true, reminder: reminder || { enabled: false, reminder_time: '20:00' } });
  } catch (error) {
    console.error('获取提醒设置错误:', error);
    res.status(500).json({ error: '获取提醒设置失败' });
  }
});

// 更新提醒设置
app.post('/api/reminders', authenticateToken, async (req, res) => {
  try {
    const { enabled, time } = req.body;

    // 检查是否已有设置
    const existing = await db.get('SELECT id FROM reminders WHERE user_id = ?', [req.user.id]);

    if (existing) {
      await db.run(
        `UPDATE reminders SET enabled = ?, reminder_time = ?, updated_at = ? WHERE user_id = ?`,
        [enabled ? 1 : 0, time || '20:00', Date.now(), req.user.id]
      );
    } else {
      await db.run(
        `INSERT INTO reminders (user_id, enabled, reminder_time, updated_at) VALUES (?, ?, ?, ?)`,
        [req.user.id, enabled ? 1 : 0, time || '20:00', Date.now()]
      );
    }

    res.json({ success: true, message: '提醒设置已保存' });
  } catch (error) {
    console.error('更新提醒设置错误:', error);
    res.status(500).json({ error: '保存提醒设置失败' });
  }
});

// ==================== 闪卡接口 ====================

// 获取用户闪卡
app.get('/api/flashcards', authenticateToken, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    let sql = `SELECT * FROM flashcards WHERE user_id = ? ORDER BY created_at DESC`;
    if (limit) {
      sql += ` LIMIT ${limit}`;
    }
    const flashcards = await db.all(sql, [req.user.id]);
    res.json({ success: true, flashcards });
  } catch (error) {
    console.error('获取闪卡错误:', error);
    res.status(500).json({ error: '获取闪卡失败' });
  }
});

// 创建闪卡
app.post('/api/flashcards', authenticateToken, async (req, res) => {
  try {
    const { front, back, tags } = req.body;

    if (!front || !back) {
      return res.status(400).json({ error: '正面和背面内容不能为空' });
    }

    const cardId = uuidv4();
    await db.run(
      `INSERT INTO flashcards (id, user_id, front, back, tags, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cardId, req.user.id, front, back, tags || null, Date.now()]
    );

    res.json({ success: true, id: cardId, message: '闪卡创建成功' });
  } catch (error) {
    console.error('创建闪卡错误:', error);
    res.status(500).json({ error: '创建闪卡失败' });
  }
});

// 更新闪卡（复习后更新间隔重复参数）
app.put('/api/flashcards/:cardId', authenticateToken, async (req, res) => {
  try {
    const { cardId } = req.params;
    const { easeFactor, interval, repetitions, nextReviewDate, front, back, tags } = req.body;

    const card = await db.get('SELECT id FROM flashcards WHERE id = ? AND user_id = ?', [cardId, req.user.id]);
    if (!card) {
      return res.status(404).json({ error: '闪卡不存在' });
    }

    // 构建更新语句
    const updates = [];
    const params = [];

    if (easeFactor !== undefined) {
      updates.push('ease_factor = ?');
      params.push(easeFactor);
    }
    if (interval !== undefined) {
      updates.push('interval = ?');
      params.push(interval);
    }
    if (repetitions !== undefined) {
      updates.push('repetitions = ?');
      params.push(repetitions);
    }
    if (nextReviewDate !== undefined) {
      updates.push('next_review_date = ?');
      params.push(nextReviewDate);
    }
    if (front !== undefined) {
      updates.push('front = ?');
      params.push(front);
    }
    if (back !== undefined) {
      updates.push('back = ?');
      params.push(back);
    }
    if (tags !== undefined) {
      updates.push('tags = ?');
      params.push(tags);
    }

    updates.push('updated_at = ?');
    params.push(Date.now());
    params.push(cardId);

    await db.run(
      `UPDATE flashcards SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ success: true, message: '闪卡更新成功' });
  } catch (error) {
    console.error('更新闪卡错误:', error);
    res.status(500).json({ error: '更新闪卡失败' });
  }
});

// 删除闪卡
app.delete('/api/flashcards/:cardId', authenticateToken, async (req, res) => {
  try {
    const { cardId } = req.params;

    const card = await db.get('SELECT id FROM flashcards WHERE id = ? AND user_id = ?', [cardId, req.user.id]);
    if (!card) {
      return res.status(404).json({ error: '闪卡不存在' });
    }

    await db.run('DELETE FROM flashcards WHERE id = ?', [cardId]);
    res.json({ success: true, message: '闪卡删除成功' });
  } catch (error) {
    console.error('删除闪卡错误:', error);
    res.status(500).json({ error: '删除闪卡失败' });
  }
});

// ==================== 沉浸式学习 API ====================

// 解析内容并生成沉浸式学习材料
app.post('/api/immersive-learning/parse', optionalAuth, async (req, res) => {
  try {
    const { content, fileName, userProfile, model } = req.body;

    if (!content) {
      return res.status(400).json({ error: '缺少文件内容' });
    }

    if (!userProfile || !userProfile.educationLevel) {
      return res.status(400).json({ error: '缺少用户画像信息' });
    }

    console.log(`开始为文件 "${fileName}" 生成沉浸式学习材料...`);
    console.log(`用户画像: 教育水平=${userProfile.educationLevel}, 兴趣=${userProfile.interests?.join(',')}`);

    // 调用沉浸式学习服务生成章节
    const result = await immersiveLearningService.parseAndGenerateChapters(
      content,
      fileName,
      userProfile
    );

    let sessionId = null;

    // 如果用户已登录，保存完整数据到数据库
    if (req.user) {
      try {
        // 1. 检查文件是否已存在（通过内容哈希）
        const existingFile = await db.get(
          `SELECT id, content_hash FROM uploaded_files WHERE content_hash = ?`,
          [result.contentHash]
        );

        if (existingFile) {
          // 文件已存在，增加上传计数
          await db.run(
            `UPDATE uploaded_files SET upload_count = upload_count + 1 WHERE content_hash = ?`,
            [result.contentHash]
          );
          console.log(`文件已存在，复用: ${result.contentHash}`);
        } else {
          // 新文件，保存到文件表
          await db.run(
            `INSERT INTO uploaded_files (content_hash, file_name, file_content, file_size, first_uploaded_by)
             VALUES (?, ?, ?, ?, ?)`,
            [result.contentHash, fileName, content, content.length, req.user.id]
          );
          console.log(`新文件已保存: ${result.contentHash}`);
        }

        // 2. 保存沉浸式学习会话（包含所有生成的内容）
        const insertResult = await db.run(
          `INSERT INTO immersive_sessions (user_id, file_name, content_hash, content_length, user_profile, chapters_data, model_used, learning_mode)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.user.id,
            fileName,
            result.contentHash,
            result.totalLength,
            JSON.stringify(userProfile),
            JSON.stringify(result.chapters),
            model || 'haiku',
            'immersive'
          ]
        );
        sessionId = insertResult.lastInsertRowid;
        console.log(`沉浸式学习会话已保存，ID: ${sessionId}`);
      } catch (dbError) {
        console.error('保存沉浸式学习会话失败:', dbError);
      }
    }

    res.json({
      success: true,
      sessionId,
      ...result
    });
  } catch (error) {
    console.error('生成沉浸式学习材料失败:', error);
    res.status(500).json({
      error: '生成学习材料失败',
      message: error.message
    });
  }
});

// 获取用户的沉浸式学习历史（包含完整数据）
app.get('/api/immersive-learning/history', authenticateToken, async (req, res) => {
  try {
    const sessions = await db.all(
      `SELECT id, file_name, content_hash, content_length, user_profile, model_used, learning_mode, created_at
       FROM immersive_sessions
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    // 解析 user_profile JSON
    const parsedSessions = sessions.map(s => ({
      ...s,
      user_profile: s.user_profile ? JSON.parse(s.user_profile) : null
    }));

    res.json({
      success: true,
      sessions: parsedSessions
    });
  } catch (error) {
    console.error('获取沉浸式学习历史失败:', error);
    res.status(500).json({ error: '获取历史失败' });
  }
});

// 获取特定沉浸式学习会话（包含所有生成的内容）
app.get('/api/immersive-learning/session/:id', authenticateToken, async (req, res) => {
  try {
    const session = await db.get(
      `SELECT s.*, f.file_content
       FROM immersive_sessions s
       LEFT JOIN uploaded_files f ON s.content_hash = f.content_hash
       WHERE s.id = ? AND s.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (!session) {
      return res.status(404).json({ error: '会话不存在' });
    }

    res.json({
      success: true,
      session: {
        id: session.id,
        fileName: session.file_name,
        contentHash: session.content_hash,
        contentLength: session.content_length,
        fileContent: session.file_content,
        userProfile: JSON.parse(session.user_profile),
        chapters: JSON.parse(session.chapters_data),
        modelUsed: session.model_used,
        learningMode: session.learning_mode,
        createdAt: session.created_at
      }
    });
  } catch (error) {
    console.error('获取沉浸式学习会话失败:', error);
    res.status(500).json({ error: '获取会话失败' });
  }
});

// 生成更多章节（用于长文档的后续章节生成）
app.post('/api/immersive-learning/generate-more', optionalAuth, async (req, res) => {
  try {
    const { sessionId, contentHash, startChapter, endChapter, userProfile } = req.body;

    if (!contentHash || !startChapter) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    // 从数据库获取文件内容
    const file = await db.get(
      `SELECT file_content, file_name FROM uploaded_files WHERE content_hash = ?`,
      [contentHash]
    );

    if (!file) {
      return res.status(404).json({ error: '文件不存在' });
    }

    console.log(`生成更多章节: ${startChapter} - ${endChapter || startChapter}`);

    // 生成更多章节
    const chapters = await immersiveLearningService.generateMoreChapters(
      file.file_content,
      file.file_name,
      userProfile || { educationLevel: 'undergraduate', interests: [] },
      startChapter,
      endChapter || startChapter
    );

    // 如果有 sessionId，更新数据库中的章节数据
    if (sessionId && req.user) {
      try {
        const session = await db.get(
          `SELECT chapters_data FROM immersive_sessions WHERE id = ? AND user_id = ?`,
          [sessionId, req.user.id]
        );

        if (session) {
          const existingChapters = JSON.parse(session.chapters_data);
          const updatedChapters = [...existingChapters, ...chapters];

          await db.run(
            `UPDATE immersive_sessions SET chapters_data = ?, updated_at = datetime('now') WHERE id = ?`,
            [JSON.stringify(updatedChapters), sessionId]
          );
        }
      } catch (dbError) {
        console.error('更新章节数据失败:', dbError);
      }
    }

    res.json({
      success: true,
      chapters,
      generatedCount: chapters.length
    });
  } catch (error) {
    console.error('生成更多章节失败:', error);
    res.status(500).json({
      error: '生成章节失败',
      message: error.message
    });
  }
});

// ==================== 原有路由 ====================

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

// 启动服务器（先初始化数据库）
async function startServer() {
  try {
    // 初始化 Turso 数据库
    await db.init();

    // 确保 uploads 目录存在
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads', { recursive: true });
    }
    if (!fs.existsSync('uploads/temp')) {
      fs.mkdirSync('uploads/temp', { recursive: true });
    }

    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

startServer();
