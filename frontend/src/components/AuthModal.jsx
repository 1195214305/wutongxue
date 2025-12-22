import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode) // 'login' or 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-serif font-semibold text-warm-800 dark:text-cream-100">
                  {mode === 'login' ? '欢迎回来' : '创建账号'}
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
                : '注册账号，开启你的学习之旅'}
            </p>
          </div>

          {/* 表单 */}
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
