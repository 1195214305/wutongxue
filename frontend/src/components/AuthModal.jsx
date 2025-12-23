import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode) // 'login', 'register', or 'forgot'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotMessage, setForgotMessage] = useState('')

  const { login, register } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        await login(username, password)
      } else {
        await register(username, password, nickname)
      }
      onClose()
      // 重置表单
      setUsername('')
      setPassword('')
      setNickname('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setError('')
    setForgotMessage('')
  }

  const handleForgotPassword = () => {
    setMode('forgot')
    setError('')
    setForgotMessage('')
  }

  const handleBackToLogin = () => {
    setMode('login')
    setError('')
    setForgotMessage('')
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
          className="bg-white dark:bg-warm-800 rounded-2xl max-w-md w-full overflow-hidden shadow-warm"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="p-6 border-b border-cream-200 dark:border-warm-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warm-100 dark:bg-warm-700 flex items-center justify-center">
                  <svg className="w-5 h-5 text-warm-600 dark:text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {mode === 'forgot' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    )}
                  </svg>
                </div>
                <h3 className="text-xl font-serif font-semibold text-warm-800 dark:text-cream-100">
                  {mode === 'login' ? '欢迎回来' : mode === 'register' ? '创建账号' : '找回密码'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-cream-100 dark:hover:bg-warm-700 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-sm text-warm-500 dark:text-warm-400">
              {mode === 'login'
                ? '登录后可在多设备间同步学习记录'
                : mode === 'register'
                ? '注册账号，开启你的学习之旅'
                : '请按照以下方式找回密码'}
            </p>
          </div>

          {/* 表单 */}
          {mode === 'forgot' ? (
            <div className="p-6 space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">密码找回说明</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      由于本应用暂未接入邮箱验证系统，如果您忘记了密码，请尝试以下方式：
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-cream-50 dark:bg-warm-700/50 rounded-xl border border-cream-200 dark:border-warm-600">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-warm-100 dark:bg-warm-600 flex items-center justify-center text-warm-600 dark:text-warm-300 font-medium">
                      1
                    </div>
                    <div>
                      <h5 className="font-medium text-warm-800 dark:text-cream-100 mb-1">重新注册</h5>
                      <p className="text-sm text-warm-600 dark:text-warm-400">
                        使用新的用户名重新注册一个账号，开始新的学习之旅。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-cream-50 dark:bg-warm-700/50 rounded-xl border border-cream-200 dark:border-warm-600">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-warm-100 dark:bg-warm-600 flex items-center justify-center text-warm-600 dark:text-warm-300 font-medium">
                      2
                    </div>
                    <div>
                      <h5 className="font-medium text-warm-800 dark:text-cream-100 mb-1">联系开发者</h5>
                      <p className="text-sm text-warm-600 dark:text-warm-400">
                        访问 GitHub 项目页面提交 Issue，说明您的用户名，我们会协助您重置密码。
                      </p>
                      <a
                        href="https://github.com/1195214305/wutongxue/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-sm text-warm-700 dark:text-cream-200 hover:underline"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                        前往 GitHub Issues
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full py-3 bg-warm-700 hover:bg-warm-800 dark:bg-warm-600 dark:hover:bg-warm-500 text-cream-50 rounded-xl font-medium transition-colors"
              >
                返回登录
              </button>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-terracotta-50 dark:bg-terracotta-900/20 border border-terracotta-200 dark:border-terracotta-800 rounded-lg text-terracotta-600 dark:text-terracotta-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-warm-700 dark:text-cream-200 mb-1.5">
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 bg-cream-50 dark:bg-warm-700 border border-cream-200 dark:border-warm-600 rounded-xl text-warm-800 dark:text-cream-100 placeholder-warm-400 dark:placeholder-warm-500 focus:outline-none focus:ring-2 focus:ring-warm-300 dark:focus:ring-warm-500 transition-all"
                placeholder="请输入用户名"
                required
                minLength={3}
                maxLength={20}
              />
            </div>

            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-medium text-warm-700 dark:text-cream-200 mb-1.5">
                  昵称 <span className="text-warm-400 font-normal">(可选)</span>
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-2.5 bg-cream-50 dark:bg-warm-700 border border-cream-200 dark:border-warm-600 rounded-xl text-warm-800 dark:text-cream-100 placeholder-warm-400 dark:placeholder-warm-500 focus:outline-none focus:ring-2 focus:ring-warm-300 dark:focus:ring-warm-500 transition-all"
                  placeholder="给自己取个名字吧"
                  maxLength={20}
                />
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-warm-700 dark:text-cream-200 mb-1.5">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-cream-50 dark:bg-warm-700 border border-cream-200 dark:border-warm-600 rounded-xl text-warm-800 dark:text-cream-100 placeholder-warm-400 dark:placeholder-warm-500 focus:outline-none focus:ring-2 focus:ring-warm-300 dark:focus:ring-warm-500 transition-all"
                placeholder={mode === 'register' ? '至少6个字符' : '请输入密码'}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-warm-700 hover:bg-warm-800 dark:bg-warm-600 dark:hover:bg-warm-500 text-cream-50 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-cream-50 border-t-transparent rounded-full animate-spin" />
                  处理中...
                </>
              ) : (
                mode === 'login' ? '登录' : '注册'
              )}
            </button>

            <div className="text-center text-sm text-warm-500 dark:text-warm-400">
              {mode === 'login' ? (
                <>
                  还没有账号？
                  <button
                    type="button"
                    onClick={switchMode}
                    className="ml-1 text-warm-700 dark:text-cream-200 hover:underline font-medium"
                  >
                    立即注册
                  </button>
                  <span className="mx-2">|</span>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-cream-200 hover:underline"
                  >
                    忘记密码？
                  </button>
                </>
              ) : (
                <>
                  已有账号？
                  <button
                    type="button"
                    onClick={switchMode}
                    className="ml-1 text-warm-700 dark:text-cream-200 hover:underline font-medium"
                  >
                    立即登录
                  </button>
                </>
              )}
            </div>
          </form>
          )}

          {/* 底部提示 */}
          <div className="px-6 pb-6">
            <div className="p-3 bg-sage-50 dark:bg-sage-900/20 rounded-xl">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-sage-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-sage-600 dark:text-sage-400">
                  登录后，你的学习记录将自动同步到云端，可在任意设备上继续学习。
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AuthModal
