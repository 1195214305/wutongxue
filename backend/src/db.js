const { createClient } = require('@libsql/client');

// Turso 数据库配置
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://wutongxue-chentao.aws-ap-northeast-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN
});

// 初始化数据库表
async function initDatabase() {
  try {
    // 用户表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        nickname TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      )
    `);

    // 学习会话表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_content TEXT,
        scenario TEXT,
        model TEXT DEFAULT 'qwen-turbo',
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // 消息表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      )
    `);

    // 学习笔记表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        session_id TEXT,
        file_name TEXT,
        content TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // 知识点收藏表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS favorites (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        session_id TEXT,
        file_name TEXT,
        content TEXT NOT NULL,
        tag TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // 学习目标表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'daily',
        target_minutes INTEGER DEFAULT 30,
        completed INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // 打卡记录表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS checkins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        checkin_date TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        UNIQUE(user_id, checkin_date),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // 错题本表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS wrong_questions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        session_id TEXT,
        file_name TEXT,
        question TEXT NOT NULL,
        options TEXT NOT NULL,
        correct_index INTEGER NOT NULL,
        user_answer INTEGER NOT NULL,
        explanation TEXT,
        mastered INTEGER DEFAULT 0,
        retry_count INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        last_retry INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // 学习成就表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        achievement_id TEXT NOT NULL,
        unlocked_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        UNIQUE(user_id, achievement_id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // 学习统计表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS learning_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        stat_date TEXT NOT NULL,
        learning_time INTEGER DEFAULT 0,
        session_count INTEGER DEFAULT 0,
        quiz_count INTEGER DEFAULT 0,
        correct_count INTEGER DEFAULT 0,
        total_questions INTEGER DEFAULT 0,
        UNIQUE(user_id, stat_date),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // 学习提醒设置表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE NOT NULL,
        enabled INTEGER DEFAULT 0,
        reminder_time TEXT DEFAULT '20:00',
        updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // 闪卡表（间隔重复记忆）
    await db.execute(`
      CREATE TABLE IF NOT EXISTS flashcards (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        front TEXT NOT NULL,
        back TEXT NOT NULL,
        tags TEXT,
        ease_factor REAL DEFAULT 2.5,
        interval INTEGER DEFAULT 1,
        repetitions INTEGER DEFAULT 0,
        next_review_date TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // 沉浸式学习会话表 - 完整保存所有学习数据
    await db.execute(`
      CREATE TABLE IF NOT EXISTS immersive_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        file_name TEXT NOT NULL,
        content_hash TEXT,
        content_length INTEGER,
        user_profile TEXT NOT NULL,
        chapters_data TEXT NOT NULL,
        model_used TEXT DEFAULT 'haiku',
        learning_mode TEXT DEFAULT 'immersive',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // 文件存储表 - 用于文件去重
    await db.execute(`
      CREATE TABLE IF NOT EXISTS uploaded_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content_hash TEXT UNIQUE NOT NULL,
        file_name TEXT NOT NULL,
        file_content TEXT NOT NULL,
        file_size INTEGER,
        upload_count INTEGER DEFAULT 1,
        first_uploaded_by TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (first_uploaded_by) REFERENCES users(id)
      )
    `);

    // 创建索引
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_wrong_questions_user_id ON wrong_questions(user_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_learning_stats_user_id ON learning_stats(user_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards(user_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_immersive_sessions_user_id ON immersive_sessions(user_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_immersive_sessions_content_hash ON immersive_sessions(content_hash)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_uploaded_files_content_hash ON uploaded_files(content_hash)`);

    console.log('Turso 数据库初始化成功');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}

// 封装查询方法，兼容原有代码风格
const dbWrapper = {
  // 执行单条查询，返回第一行
  async get(sql, params = []) {
    const result = await db.execute({ sql, args: params });
    return result.rows[0] || null;
  },

  // 执行查询，返回所有行
  async all(sql, params = []) {
    const result = await db.execute({ sql, args: params });
    return result.rows;
  },

  // 执行更新/插入/删除
  async run(sql, params = []) {
    const result = await db.execute({ sql, args: params });
    return { changes: result.rowsAffected, lastInsertRowid: result.lastInsertRowid };
  },

  // 初始化
  init: initDatabase
};

module.exports = dbWrapper;
