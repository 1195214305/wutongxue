import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://wutongxue-backend.onrender.com'

function LearningDashboard({ isOpen, onClose }) {
  const { token, isAuthenticated } = useAuth()
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchStats()
    }
  }, [isOpen, isAuthenticated])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/user/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 从本地存储获取学习时长
  const getLocalStats = () => {
    const learningTime = parseInt(localStorage.getItem('wutongxue_learning_time') || '0')
    const sessionsCount = parseInt(localStorage.getItem('wutongxue_sessions_count') || '0')
    const quizCount = parseInt(localStorage.getItem('wutongxue_quiz_count') || '0')
    const correctRate = parseInt(localStorage.getItem('wutongxue_correct_rate') || '0')
    const streak = parseInt(localStorage.getItem('wutongxue_streak') || '0')

    return { learningTime, sessionsCount, quizCount, correctRate, streak }
  }

  const localStats = getLocalStats()

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}分钟`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`
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
          className="bg-white dark:bg-warm-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-warm"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="p-6 border-b border-cream-200 dark:border-warm-700 bg-gradient-to-r from-warm-600 to-sage-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-serif font-semibold text-white">学习数据中心</h3>
                  <p className="text-white/70 text-sm">追踪你的学习进度</p>
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
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {/* 统计卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-blue-600 dark:text-blue-400">学习时长</span>
                </div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {formatTime(stats?.totalLearningTime || localStats.learningTime)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-green-600 dark:text-green-400">学习次数</span>
                </div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {stats?.sessionCount || localStats.sessionsCount}次
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <span className="text-sm text-purple-600 dark:text-purple-400">测验次数</span>
                </div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {stats?.quizCount || localStats.quizCount}次
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                  <span className="text-sm text-orange-600 dark:text-orange-400">连续学习</span>
                </div>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {stats?.streak || localStats.streak}天
                </p>
              </div>
            </div>

            {/* 学习趋势图 */}
            <div className="bg-cream-50 dark:bg-warm-700/50 rounded-xl p-6 mb-6">
              <h4 className="font-semibold text-warm-800 dark:text-cream-100 mb-4">本周学习趋势</h4>
              <div className="flex items-end justify-between h-32 gap-2">
                {['一', '二', '三', '四', '五', '六', '日'].map((day, index) => {
                  const height = Math.random() * 80 + 20 // 模拟数据
                  const isToday = index === new Date().getDay() - 1 || (new Date().getDay() === 0 && index === 6)
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className={`w-full rounded-t-lg transition-all ${
                          isToday
                            ? 'bg-gradient-to-t from-warm-500 to-warm-400'
                            : 'bg-gradient-to-t from-cream-300 to-cream-200 dark:from-warm-600 dark:to-warm-500'
                        }`}
                        style={{ height: `${height}%` }}
                      />
                      <span className={`text-xs ${isToday ? 'text-warm-600 dark:text-warm-300 font-bold' : 'text-warm-400 dark:text-warm-500'}`}>
                        周{day}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 学习场景分布 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-cream-50 dark:bg-warm-700/50 rounded-xl p-6">
                <h4 className="font-semibold text-warm-800 dark:text-cream-100 mb-4">场景分布</h4>
                <div className="space-y-3">
                  {[
                    { name: '职场办公', percent: 45, color: 'bg-blue-500' },
                    { name: '校园学习', percent: 35, color: 'bg-green-500' },
                    { name: '实操场景', percent: 20, color: 'bg-purple-500' }
                  ].map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-warm-600 dark:text-warm-300">{item.name}</span>
                        <span className="text-warm-500 dark:text-warm-400">{item.percent}%</span>
                      </div>
                      <div className="h-2 bg-cream-200 dark:bg-warm-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all`}
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-cream-50 dark:bg-warm-700/50 rounded-xl p-6">
                <h4 className="font-semibold text-warm-800 dark:text-cream-100 mb-4">测验正确率</h4>
                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-cream-200 dark:text-warm-600"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${(stats?.correctRate || localStats.correctRate || 75) * 3.52} 352`}
                        className="text-sage-500"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-warm-700 dark:text-cream-100">
                        {stats?.correctRate || localStats.correctRate || 75}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default LearningDashboard
