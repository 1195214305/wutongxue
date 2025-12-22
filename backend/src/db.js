const { createClient } = require('@libsql/client');

// Turso 数据库配置
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://wutongxue-chentao.aws-ap-northeast-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN
});

// 初始化数据库表
async function initDatabase() {
  try {
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

    await db.execute(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id)`);

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
