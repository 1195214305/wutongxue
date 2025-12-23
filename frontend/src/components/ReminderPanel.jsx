import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://wutongxue-backend.onrender.com'

function ReminderPanel({ isOpen, onClose }) {
  const { token, isAuthenticated } = useAuth()
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState('20:00')
  const [notificationPermission, setNotificationPermission] = useState('default')
  const [isLoading, setIsLoading] = useState(false)

  // 加载设置
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchReminder()
    } else if (isOpen) {
      // 未登录时从 localStorage 加载
      const saved = localStorage.getItem('wutongxue_reminder')
      if (saved) {
        const settings = JSON.parse(saved)
        setReminderEnabled(settings.enabled)
        setReminderTime(settings.time)
      }
    }

    // 检查通知权限
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [isOpen, isAuthenticated])

  const fetchReminder = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/reminders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.reminder) {
          setReminderEnabled(data.reminder.enabled === 1)
          setReminderTime(data.reminder.time)
        }
      }
    } catch (error) {
      console.error('获取提醒设置失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 请求通知权限
  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      return permission === 'granted'
    }
    return false
  }

  // 保存设置
  const saveSettings = async (enabled, time) => {
    setReminderEnabled(enabled)
    setReminderTime(time)

    if (enabled) {
      scheduleReminder(time)
    } else {
      cancelReminder()
    }

    // 保存到服务器或本地
    if (isAuthenticated) {
      try {
        await fetch(`${API_BASE}/api/reminders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ enabled, time })
        })
      } catch (error) {
        console.error('保存提醒设置失败:', error)
      }
    } else {
      // 未登录时保存到 localStorage
      localStorage.setItem('wutongxue_reminder', JSON.stringify({ enabled, time }))
    }
  }

  // 设置提醒
  const scheduleReminder = (time) => {
    // 使用 Service Worker 或定时检查
    // 这里使用简单的定时检查方式
    const checkInterval = setInterval(() => {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

      if (currentTime === time && reminderEnabled) {
        showNotification()
      }
    }, 60000) // 每分钟检查一次

    // 存储 interval ID
    window.reminderInterval = checkInterval
  }

  // 取消提醒
  const cancelReminder = () => {
    if (window.reminderInterval) {
      clearInterval(window.reminderInterval)
    }
  }

  // 显示通知
  const showNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('无痛学 - 学习提醒', {
        body: '该学习啦！今天的知识等你来探索 📚',
        icon: '/favicon.ico',
        tag: 'study-reminder'
      })
    }
  }

  // 测试通知
  const testNotification = async () => {
    if (notificationPermission !== 'granted') {
      const granted = await requestPermission()
      if (!granted) {
        alert('请在浏览器设置中允许通知权限')
        return
      }
    }
    showNotification()
  }

  // 切换提醒
  const handleToggle = async () => {
    if (!reminderEnabled) {
      if (notificationPermission !== 'granted') {
        const granted = await requestPermission()
        if (!granted) {
          alert('需要通知权限才能设置提醒')
          return
        }
      }
    }
    saveSettings(!reminderEnabled, reminderTime)
  }

  // 更改时间
  const handleTimeChange = (e) => {
    const newTime = e.target.value
    setReminderTime(newTime)
    if (reminderEnabled) {
      saveSettings(true, newTime)
    }
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
          <div className="p-6 bg-gradient-to-r from-blue-500 to-cyan-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">学习提醒</h3>
                  <p className="text-white/70 text-sm">定时提醒你学习</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 内容 */}
          <div className="p-6 space-y-6">
            {/* 通知权限状态 */}
            {notificationPermission !== 'granted' && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-amber-700 dark:text-amber-300 font-medium">需要通知权限</p>
                    <p className="text-amber-600 dark:text-amber-400 text-sm mt-1">
                      请允许浏览器通知，才能收到学习提醒
                    </p>
                    <button
                      onClick={requestPermission}
                      className="mt-2 px-3 py-1 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors"
                    >
                      授权通知
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 开关 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-warm-800 dark:text-cream-100">每日学习提醒</p>
                <p className="text-sm text-warm-500 dark:text-warm-400">到点提醒你开始学习</p>
              </div>
              <button
                onClick={handleToggle}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  reminderEnabled ? 'bg-blue-500' : 'bg-cream-300 dark:bg-warm-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    reminderEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* 时间选择 */}
            <div className={`transition-opacity ${reminderEnabled ? 'opacity-100' : 'opacity-50'}`}>
              <label className="block font-medium text-warm-800 dark:text-cream-100 mb-2">
                提醒时间
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={handleTimeChange}
                disabled={!reminderEnabled}
                className="w-full px-4 py-3 rounded-xl border border-cream-200 dark:border-warm-600 bg-cream-50 dark:bg-warm-700 text-warm-700 dark:text-cream-200 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 快捷时间 */}
            <div className={`transition-opacity ${reminderEnabled ? 'opacity-100' : 'opacity-50'}`}>
              <p className="text-sm text-warm-500 dark:text-warm-400 mb-2">快捷设置</p>
              <div className="flex flex-wrap gap-2">
                {['07:00', '09:00', '12:00', '18:00', '20:00', '22:00'].map((time) => (
                  <button
                    key={time}
                    onClick={() => reminderEnabled && saveSettings(true, time)}
                    disabled={!reminderEnabled}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      reminderTime === time
                        ? 'bg-blue-500 text-white'
                        : 'bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 hover:bg-cream-200 dark:hover:bg-warm-600'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* 测试按钮 */}
            <button
              onClick={testNotification}
              className="w-full py-3 bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 rounded-xl hover:bg-cream-200 dark:hover:bg-warm-600 transition-colors"
            >
              测试通知
            </button>

            {/* 提示 */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                <strong>提示：</strong>提醒功能需要保持浏览器打开才能生效。建议将本网站添加到书签，方便每天访问学习。
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ReminderPanel
