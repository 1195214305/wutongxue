import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://wutongxue-backend.onrender.com'

function ChangePasswordModal({ isOpen, onClose }) {
  const { token } = useAuth()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致')
      return
    }

    if (newPassword.length < 6) {
      setError('新密码至少6个字符')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '修改密码失败')
      }

      setSuccess('密码修改成功！')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')

      // 2秒后关闭弹窗
      setTimeout(() => {
        onClose()
        setSuccess('')
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-warm-900/50 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-serif font-semibold text-warm-800 dark:text-cream-100">
                  修改密码
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full hover:bg-cream-100 dark:hover:bg-warm-700 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
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

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-sage-50 dark:bg-sage-900/20 border border-sage-200 dark:border-sage-800 rounded-lg text-sage-600 dark:text-sage-400 text-sm"
              >
                {success}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-warm-700 dark:text-cream-200 mb-1.5">
                当前密码
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-cream-50 dark:bg-warm-700 border border-cream-200 dark:border-warm-600 rounded-xl text-warm-800 dark:text-cream-100 placeholder-warm-400 dark:placeholder-warm-500 focus:outline-none focus:ring-2 focus:ring-warm-300 dark:focus:ring-warm-500 transition-all"
                placeholder="请输入当前密码"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-700 dark:text-cream-200 mb-1.5">
                新密码
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-cream-50 dark:bg-warm-700 border border-cream-200 dark:border-warm-600 rounded-xl text-warm-800 dark:text-cream-100 placeholder-warm-400 dark:placeholder-warm-500 focus:outline-none focus:ring-2 focus:ring-warm-300 dark:focus:ring-warm-500 transition-all"
                placeholder="至少6个字符"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-700 dark:text-cream-200 mb-1.5">
                确认新密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-cream-50 dark:bg-warm-700 border border-cream-200 dark:border-warm-600 rounded-xl text-warm-800 dark:text-cream-100 placeholder-warm-400 dark:placeholder-warm-500 focus:outline-none focus:ring-2 focus:ring-warm-300 dark:focus:ring-warm-500 transition-all"
                placeholder="再次输入新密码"
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
                '确认修改'
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ChangePasswordModal
