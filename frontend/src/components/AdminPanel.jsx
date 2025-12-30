import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://wutongxue-backend.onrender.com'

function AdminPanel({ isOpen, onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminKey, setAdminKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  // 密码重置相关状态
  const [resetUsername, setResetUsername] = useState('')
  const [resetNewPassword, setResetNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState({ type: '', text: '' })

  // 验证管理员密钥
  const handleLogin = async () => {
    if (!adminKey.trim()) {
      setError('请输入管理员密钥')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE}/api/admin/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: adminKey })
      })

      if (response.ok) {
        setIsAuthenticated(true)
        localStorage.setItem('wutongxue_admin_key', adminKey)
        fetchData()
      } else {
        setError('密钥错误')
      }
    } catch (err) {
      setError('验证失败，请检查网络连接')
    } finally {
      setIsLoading(false)
    }
  }

  // 获取数据
  const fetchData = async () => {
    const key = adminKey || localStorage.getItem('wutongxue_admin_key')
    if (!key) return

    setIsLoading(true)
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/stats`, {
          headers: { 'X-Admin-Key': key }
        }),
        fetch(`${API_BASE}/api/admin/users`, {
          headers: { 'X-Admin-Key': key }
        })
      ])

      if (statsRes.ok && usersRes.ok) {
        const statsData = await statsRes.json()
        const usersData = await usersRes.json()
        setStats(statsData.stats)
        setUsers(usersData.users)
      } else {
        setIsAuthenticated(false)
        localStorage.removeItem('wutongxue_admin_key')
      }
    } catch (err) {
      console.error('获取数据失败:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // 获取用户详情
  const fetchUserDetail = async (userId) => {
    const key = adminKey || localStorage.getItem('wutongxue_admin_key')
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        headers: { 'X-Admin-Key': key }
      })
      if (response.ok) {
        const data = await response.json()
        setSelectedUser(data.user)
      }
    } catch (err) {
      console.error('获取用户详情失败:', err)
    }
  }

  // 检查已保存的密钥
  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem('wutongxue_admin_key')
      if (savedKey) {
        setAdminKey(savedKey)
        setIsAuthenticated(true)
        fetchData()
      }
    }
  }, [isOpen])

  // 退出登录
  const handleLogout = () => {
    setIsAuthenticated(false)
    setAdminKey('')
    setStats(null)
    setUsers([])
    setSelectedUser(null)
    localStorage.removeItem('wutongxue_admin_key')
  }

  // 格式化时间
  const formatTime = (timestamp) => {
    if (!timestamp) return '无'
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 场景名称映射
  const scenarioNames = {
    workplace: '职场办公',
    campus: '校园学习',
    practice: '实操场景'
  }

  // 重置用户密码
  const handleResetPassword = async () => {
    if (!resetUsername.trim()) {
      setResetMessage({ type: 'error', text: '请输入用户名' })
      return
    }
    if (!resetNewPassword.trim() || resetNewPassword.length < 6) {
      setResetMessage({ type: 'error', text: '新密码至少6个字符' })
      return
    }

    setResetLoading(true)
    setResetMessage({ type: '', text: '' })

    try {
      const key = adminKey || localStorage.getItem('wutongxue_admin_key')
      const response = await fetch(`${API_BASE}/api/admin/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminKey: key,
          username: resetUsername,
          newPassword: resetNewPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResetMessage({ type: 'success', text: `用户 ${resetUsername} 的密码已重置为: ${resetNewPassword}` })
        setResetUsername('')
        setResetNewPassword('')
      } else {
        setResetMessage({ type: 'error', text: data.error || '重置失败' })
      }
    } catch (err) {
      setResetMessage({ type: 'error', text: '网络错误，请重试' })
    } finally {
      setResetLoading(false)
    }
  }

  // 快速填充用户名（从用户列表点击）
  const handleQuickFillUsername = (username) => {
    setResetUsername(username)
    setActiveTab('reset')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-warm-900/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-warm-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-warm"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="p-6 border-b border-cream-200 dark:border-warm-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warm-100 dark:bg-warm-700 flex items-center justify-center">
                <svg className="w-5 h-5 text-warm-600 dark:text-warm-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-semibold text-warm-800 dark:text-cream-100">管理后台</h3>
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm text-warm-500 hover:text-warm-700 dark:text-warm-400 dark:hover:text-warm-200"
                >
                  退出
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-cream-100 dark:hover:bg-warm-700 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 内容区 */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            {!isAuthenticated ? (
              /* 登录表单 */
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-100 dark:bg-warm-700 flex items-center justify-center">
                    <svg className="w-8 h-8 text-warm-600 dark:text-warm-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-warm-800 dark:text-cream-100">管理员验证</h4>
                  <p className="text-sm text-warm-500 dark:text-warm-400 mt-1">请输入管理员密钥以访问后台</p>
                </div>

                <div className="space-y-4">
                  <input
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="请输入管理员密钥"
                    className="input-field w-full"
                  />
                  {error && (
                    <p className="text-sm text-terracotta-600 dark:text-terracotta-400">{error}</p>
                  )}
                  <button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="btn-primary w-full"
                  >
                    {isLoading ? '验证中...' : '进入后台'}
                  </button>
                </div>
              </div>
            ) : (
              /* 管理面板 */
              <div>
                {/* 标签页切换 */}
                <div className="flex gap-2 mb-6 border-b border-cream-200 dark:border-warm-700">
                  <button
                    onClick={() => { setActiveTab('overview'); setSelectedUser(null); }}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'overview'
                        ? 'border-warm-600 text-warm-700 dark:text-cream-100'
                        : 'border-transparent text-warm-500 hover:text-warm-700 dark:text-warm-400'
                    }`}
                  >
                    数据概览
                  </button>
                  <button
                    onClick={() => { setActiveTab('users'); setSelectedUser(null); }}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'users'
                        ? 'border-warm-600 text-warm-700 dark:text-cream-100'
                        : 'border-transparent text-warm-500 hover:text-warm-700 dark:text-warm-400'
                    }`}
                  >
                    用户列表
                  </button>
                  <button
                    onClick={() => { setActiveTab('reset'); setSelectedUser(null); }}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'reset'
                        ? 'border-warm-600 text-warm-700 dark:text-cream-100'
                        : 'border-transparent text-warm-500 hover:text-warm-700 dark:text-warm-400'
                    }`}
                  >
                    密码重置
                  </button>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 rounded-full border-2 border-warm-200 dark:border-warm-600 border-t-warm-600 dark:border-t-warm-400 animate-spin" />
                  </div>
                ) : activeTab === 'overview' ? (
                  /* 数据概览 */
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-cream-50 dark:bg-warm-700/50 rounded-xl p-4">
                        <p className="text-2xl font-bold text-warm-800 dark:text-cream-100">{stats?.userCount || 0}</p>
                        <p className="text-sm text-warm-500 dark:text-warm-400">总用户数</p>
                      </div>
                      <div className="bg-cream-50 dark:bg-warm-700/50 rounded-xl p-4">
                        <p className="text-2xl font-bold text-warm-800 dark:text-cream-100">{stats?.todayUsers || 0}</p>
                        <p className="text-sm text-warm-500 dark:text-warm-400">今日新增</p>
                      </div>
                      <div className="bg-cream-50 dark:bg-warm-700/50 rounded-xl p-4">
                        <p className="text-2xl font-bold text-warm-800 dark:text-cream-100">{stats?.sessionCount || 0}</p>
                        <p className="text-sm text-warm-500 dark:text-warm-400">情景对话</p>
                      </div>
                      <div className="bg-sage-50 dark:bg-sage-900/30 rounded-xl p-4">
                        <p className="text-2xl font-bold text-sage-700 dark:text-sage-300">{stats?.immersiveSessionCount || 0}</p>
                        <p className="text-sm text-sage-600 dark:text-sage-400">沉浸式学习</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-cream-50 dark:bg-warm-700/50 rounded-xl p-4">
                        <p className="text-2xl font-bold text-warm-800 dark:text-cream-100">{stats?.messageCount || 0}</p>
                        <p className="text-sm text-warm-500 dark:text-warm-400">总消息数</p>
                      </div>
                      <div className="bg-cream-50 dark:bg-warm-700/50 rounded-xl p-4">
                        <p className="text-2xl font-bold text-warm-800 dark:text-cream-100">{stats?.uploadedFileCount || 0}</p>
                        <p className="text-sm text-warm-500 dark:text-warm-400">上传文件</p>
                      </div>
                      <div className="bg-cream-50 dark:bg-warm-700/50 rounded-xl p-4">
                        <p className="text-2xl font-bold text-warm-800 dark:text-cream-100">{stats?.todaySessions || 0}</p>
                        <p className="text-sm text-warm-500 dark:text-warm-400">今日会话</p>
                      </div>
                    </div>

                    {/* 最近注册用户 */}
                    <div className="bg-cream-50 dark:bg-warm-700/50 rounded-xl p-4">
                      <h4 className="font-semibold text-warm-800 dark:text-cream-100 mb-4">最近注册用户</h4>
                      <div className="space-y-3">
                        {users.slice(0, 5).map(user => (
                          <div key={user.id} className="flex items-center justify-between p-3 bg-white dark:bg-warm-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-warm-200 dark:bg-warm-600 flex items-center justify-center">
                                <span className="text-sm font-medium text-warm-600 dark:text-warm-200">
                                  {user.nickname?.charAt(0) || user.username?.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-warm-800 dark:text-cream-100">{user.nickname || user.username}</p>
                                <p className="text-xs text-warm-500 dark:text-warm-400">{formatTime(user.createdAt)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {user.isActive ? (
                                <span className="px-2 py-0.5 text-xs bg-sage-100 dark:bg-sage-900/30 text-sage-700 dark:text-sage-400 rounded-full">
                                  已使用
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-xs bg-warm-100 dark:bg-warm-600 text-warm-600 dark:text-warm-300 rounded-full">
                                  未使用
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : selectedUser ? (
                  /* 用户详情 */
                  <div>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="flex items-center gap-2 text-sm text-warm-500 hover:text-warm-700 dark:text-warm-400 mb-4"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      返回列表
                    </button>

                    <div className="bg-cream-50 dark:bg-warm-700/50 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-warm-200 dark:bg-warm-600 flex items-center justify-center">
                          <span className="text-lg font-medium text-warm-600 dark:text-warm-200">
                            {selectedUser.nickname?.charAt(0) || selectedUser.username?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-warm-800 dark:text-cream-100">
                            {selectedUser.nickname || selectedUser.username}
                          </h4>
                          <p className="text-sm text-warm-500 dark:text-warm-400">
                            用户名: {selectedUser.username} | 注册时间: {formatTime(selectedUser.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <h5 className="font-semibold text-warm-800 dark:text-cream-100 mb-3">
                      学习记录 ({(selectedUser.sessions?.length || 0) + (selectedUser.immersiveSessions?.length || 0)})
                    </h5>

                    {/* 沉浸式学习记录 */}
                    {selectedUser.immersiveSessions?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-sage-600 dark:text-sage-400 mb-2">沉浸式学习</p>
                        <div className="space-y-2">
                          {selectedUser.immersiveSessions.map(session => (
                            <div key={`immersive-${session.id}`} className="p-3 bg-sage-50 dark:bg-sage-900/20 rounded-lg border border-sage-200 dark:border-sage-800">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-warm-800 dark:text-cream-100">{session.fileName}</p>
                                  <p className="text-xs text-sage-600 dark:text-sage-400">
                                    {session.modelUsed} | {session.userProfile?.educationLevel || '未知'} | {Math.round((session.contentLength || 0) / 1000)}K字
                                  </p>
                                </div>
                                <p className="text-xs text-warm-500 dark:text-warm-400">{formatTime(session.createdAt)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 情景对话记录 */}
                    {selectedUser.sessions?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-warm-500 dark:text-warm-400 mb-2">情景对话</p>
                        <div className="space-y-2">
                          {selectedUser.sessions.map(session => (
                            <div key={session.id} className="p-3 bg-cream-50 dark:bg-warm-700/50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-warm-800 dark:text-cream-100">{session.fileName}</p>
                                  <p className="text-xs text-warm-500 dark:text-warm-400">
                                    {scenarioNames[session.scenario] || session.scenario} | {session.model} | {session.messageCount} 条消息
                                  </p>
                                </div>
                                <p className="text-xs text-warm-500 dark:text-warm-400">{formatTime(session.updatedAt)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!selectedUser.sessions?.length && !selectedUser.immersiveSessions?.length) && (
                      <p className="text-sm text-warm-500 dark:text-warm-400 text-center py-4">暂无学习记录</p>
                    )}
                  </div>
                ) : activeTab === 'reset' ? (
                  /* 密码重置 */
                  <div className="max-w-md mx-auto">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-warm-800 dark:text-cream-100">重置用户密码</h4>
                      <p className="text-sm text-warm-500 dark:text-warm-400 mt-1">输入用户名和新密码来重置用户的登录密码</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-warm-700 dark:text-cream-200 mb-1.5">
                          用户名
                        </label>
                        <input
                          type="text"
                          value={resetUsername}
                          onChange={(e) => setResetUsername(e.target.value)}
                          placeholder="请输入要重置密码的用户名"
                          className="w-full px-4 py-2.5 bg-cream-50 dark:bg-warm-700 border border-cream-200 dark:border-warm-600 rounded-xl text-warm-800 dark:text-cream-100 placeholder-warm-400 dark:placeholder-warm-500 focus:outline-none focus:ring-2 focus:ring-warm-300 dark:focus:ring-warm-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-warm-700 dark:text-cream-200 mb-1.5">
                          新密码
                        </label>
                        <input
                          type="text"
                          value={resetNewPassword}
                          onChange={(e) => setResetNewPassword(e.target.value)}
                          placeholder="至少6个字符"
                          className="w-full px-4 py-2.5 bg-cream-50 dark:bg-warm-700 border border-cream-200 dark:border-warm-600 rounded-xl text-warm-800 dark:text-cream-100 placeholder-warm-400 dark:placeholder-warm-500 focus:outline-none focus:ring-2 focus:ring-warm-300 dark:focus:ring-warm-500"
                        />
                        <p className="text-xs text-warm-400 dark:text-warm-500 mt-1">
                          提示：这里显示明文密码，方便告知用户
                        </p>
                      </div>

                      {resetMessage.text && (
                        <div className={`p-3 rounded-lg text-sm ${
                          resetMessage.type === 'success'
                            ? 'bg-sage-50 dark:bg-sage-900/20 text-sage-600 dark:text-sage-400 border border-sage-200 dark:border-sage-800'
                            : 'bg-terracotta-50 dark:bg-terracotta-900/20 text-terracotta-600 dark:text-terracotta-400 border border-terracotta-200 dark:border-terracotta-800'
                        }`}>
                          {resetMessage.text}
                        </div>
                      )}

                      <button
                        onClick={handleResetPassword}
                        disabled={resetLoading}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {resetLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            处理中...
                          </>
                        ) : (
                          '重置密码'
                        )}
                      </button>
                    </div>

                    {/* 用户列表快捷选择 */}
                    <div className="mt-8">
                      <h5 className="text-sm font-medium text-warm-700 dark:text-cream-200 mb-3">快速选择用户</h5>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {users.map(user => (
                          <button
                            key={user.id}
                            onClick={() => setResetUsername(user.username)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              resetUsername === user.username
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                : 'hover:bg-cream-100 dark:hover:bg-warm-700 text-warm-600 dark:text-warm-300'
                            }`}
                          >
                            <span className="font-medium">{user.username}</span>
                            {user.nickname && user.nickname !== user.username && (
                              <span className="text-warm-400 dark:text-warm-500 ml-2">({user.nickname})</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 用户列表 */
                  <div className="space-y-2">
                    {users.map(user => (
                      <div
                        key={user.id}
                        onClick={() => fetchUserDetail(user.id)}
                        className="flex items-center justify-between p-4 bg-cream-50 dark:bg-warm-700/50 rounded-xl cursor-pointer hover:bg-cream-100 dark:hover:bg-warm-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-warm-200 dark:bg-warm-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-warm-600 dark:text-warm-200">
                              {user.nickname?.charAt(0) || user.username?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-warm-800 dark:text-cream-100">{user.nickname || user.username}</p>
                            <p className="text-xs text-warm-500 dark:text-warm-400">
                              注册: {formatTime(user.createdAt)}
                              {user.lastActive && user.lastActive !== user.createdAt && (
                                <> | 最近活跃: {formatTime(user.lastActive)}</>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-warm-700 dark:text-cream-200">
                              {user.sessionCount > 0 && <span>{user.sessionCount} 对话</span>}
                              {user.sessionCount > 0 && user.immersiveCount > 0 && <span> | </span>}
                              {user.immersiveCount > 0 && <span className="text-sage-600 dark:text-sage-400">{user.immersiveCount} 沉浸</span>}
                              {user.sessionCount === 0 && user.immersiveCount === 0 && <span>无记录</span>}
                            </p>
                            <p className="text-xs text-warm-500 dark:text-warm-400">{user.messageCount} 消息</p>
                          </div>
                          {user.isActive ? (
                            <span className="px-2 py-1 text-xs bg-sage-100 dark:bg-sage-900/30 text-sage-700 dark:text-sage-400 rounded-full">
                              活跃
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-warm-100 dark:bg-warm-600 text-warm-600 dark:text-warm-300 rounded-full">
                              未使用
                            </span>
                          )}
                          <svg className="w-5 h-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    ))}
                    {users.length === 0 && (
                      <p className="text-sm text-warm-500 dark:text-warm-400 text-center py-8">暂无用户</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AdminPanel
