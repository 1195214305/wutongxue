import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEY = 'wutongxue_goals'
const CHECKIN_KEY = 'wutongxue_checkins'

function GoalsPanel({ isOpen, onClose }) {
  const [goals, setGoals] = useState([])
  const [checkins, setCheckins] = useState([])
  const [newGoal, setNewGoal] = useState('')
  const [goalType, setGoalType] = useState('daily') // daily, weekly
  const [targetMinutes, setTargetMinutes] = useState(30)

  // 加载数据
  useEffect(() => {
    const savedGoals = localStorage.getItem(STORAGE_KEY)
    const savedCheckins = localStorage.getItem(CHECKIN_KEY)
    if (savedGoals) setGoals(JSON.parse(savedGoals))
    if (savedCheckins) setCheckins(JSON.parse(savedCheckins))
  }, [isOpen])

  // 保存目标
  const saveGoals = (newGoals) => {
    setGoals(newGoals)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newGoals))
  }

  // 保存打卡
  const saveCheckins = (newCheckins) => {
    setCheckins(newCheckins)
    localStorage.setItem(CHECKIN_KEY, JSON.stringify(newCheckins))
  }

  // 添加目标
  const handleAddGoal = () => {
    if (!newGoal.trim()) return

    const goal = {
      id: Date.now().toString(),
      content: newGoal.trim(),
      type: goalType,
      targetMinutes,
      completed: false,
      createdAt: Date.now()
    }

    saveGoals([goal, ...goals])
    setNewGoal('')
  }

  // 完成目标
  const handleToggleGoal = (id) => {
    saveGoals(goals.map(g =>
      g.id === id ? { ...g, completed: !g.completed } : g
    ))
  }

  // 删除目标
  const handleDeleteGoal = (id) => {
    saveGoals(goals.filter(g => g.id !== id))
  }

  // 今日打卡
  const handleCheckin = () => {
    const today = new Date().toISOString().slice(0, 10)
    if (checkins.includes(today)) return

    saveCheckins([today, ...checkins])
  }

  // 计算连续打卡天数
  const calculateStreak = () => {
    if (checkins.length === 0) return 0

    const sortedCheckins = [...checkins].sort().reverse()
    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

    // 如果今天或昨天没打卡，连续天数为0
    if (sortedCheckins[0] !== today && sortedCheckins[0] !== yesterday) {
      return 0
    }

    let streak = 0
    let currentDate = new Date(sortedCheckins[0])

    for (const checkin of sortedCheckins) {
      const checkinDate = new Date(checkin)
      const diff = Math.floor((currentDate - checkinDate) / 86400000)

      if (diff <= 1) {
        streak++
        currentDate = checkinDate
      } else {
        break
      }
    }

    return streak
  }

  // 检查今天是否已打卡
  const isTodayCheckedIn = checkins.includes(new Date().toISOString().slice(0, 10))

  // 获取本周打卡情况
  const getWeekCheckins = () => {
    const week = []
    const today = new Date()
    const dayOfWeek = today.getDay() || 7 // 周日为7

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - dayOfWeek + i)
      const dateStr = date.toISOString().slice(0, 10)
      week.push({
        day: ['一', '二', '三', '四', '五', '六', '日'][i - 1],
        date: dateStr,
        checked: checkins.includes(dateStr),
        isToday: dateStr === today.toISOString().slice(0, 10)
      })
    }

    return week
  }

  const streak = calculateStreak()
  const weekCheckins = getWeekCheckins()

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
          className="bg-white dark:bg-warm-800 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-warm"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 - 打卡区域 */}
          <div className="p-6 bg-gradient-to-r from-orange-500 to-amber-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">学习打卡</h3>
                  <p className="text-white/70 text-sm">连续 {streak} 天</p>
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

            {/* 本周打卡日历 */}
            <div className="flex justify-between mb-4">
              {weekCheckins.map((day) => (
                <div key={day.day} className="flex flex-col items-center">
                  <span className="text-white/70 text-xs mb-1">周{day.day}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    day.checked
                      ? 'bg-white text-orange-500'
                      : day.isToday
                      ? 'bg-white/30 text-white border-2 border-white'
                      : 'bg-white/10 text-white/50'
                  }`}>
                    {day.checked ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xs">{day.date.slice(-2)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 打卡按钮 */}
            <button
              onClick={handleCheckin}
              disabled={isTodayCheckedIn}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                isTodayCheckedIn
                  ? 'bg-white/30 text-white cursor-not-allowed'
                  : 'bg-white text-orange-500 hover:bg-white/90 shadow-lg'
              }`}
            >
              {isTodayCheckedIn ? '今日已打卡 ✓' : '立即打卡'}
            </button>
          </div>

          {/* 学习目标 */}
          <div className="p-4 border-b border-cream-200 dark:border-warm-700">
            <h4 className="font-semibold text-warm-800 dark:text-cream-100 mb-3">设定学习目标</h4>

            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setGoalType('daily')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  goalType === 'daily'
                    ? 'bg-warm-600 text-white'
                    : 'bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300'
                }`}
              >
                每日目标
              </button>
              <button
                onClick={() => setGoalType('weekly')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  goalType === 'weekly'
                    ? 'bg-warm-600 text-white'
                    : 'bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300'
                }`}
              >
                每周目标
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="输入学习目标..."
                className="flex-1 px-3 py-2 rounded-lg border border-cream-200 dark:border-warm-600 bg-cream-50 dark:bg-warm-700 text-warm-700 dark:text-cream-200 placeholder-warm-400 dark:placeholder-warm-500 focus:outline-none focus:ring-2 focus:ring-warm-500"
              />
              <button
                onClick={handleAddGoal}
                disabled={!newGoal.trim()}
                className="px-4 py-2 bg-warm-600 hover:bg-warm-700 disabled:bg-warm-300 dark:disabled:bg-warm-600 text-white rounded-lg transition-colors"
              >
                添加
              </button>
            </div>
          </div>

          {/* 目标列表 */}
          <div className="p-4 overflow-y-auto max-h-[35vh]">
            {goals.length === 0 ? (
              <div className="text-center py-8 text-warm-400 dark:text-warm-500">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p>还没有学习目标</p>
                <p className="text-sm mt-1">设定目标，让学习更有动力</p>
              </div>
            ) : (
              <div className="space-y-2">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      goal.completed
                        ? 'bg-sage-50 dark:bg-sage-900/20'
                        : 'bg-cream-50 dark:bg-warm-700/50'
                    }`}
                  >
                    <button
                      onClick={() => handleToggleGoal(goal.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        goal.completed
                          ? 'bg-sage-500 border-sage-500 text-white'
                          : 'border-warm-300 dark:border-warm-500 hover:border-warm-500'
                      }`}
                    >
                      {goal.completed && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1">
                      <p className={`text-warm-700 dark:text-cream-200 ${goal.completed ? 'line-through opacity-60' : ''}`}>
                        {goal.content}
                      </p>
                      <span className={`text-xs ${
                        goal.type === 'daily'
                          ? 'text-blue-500'
                          : 'text-purple-500'
                      }`}>
                        {goal.type === 'daily' ? '每日' : '每周'}目标
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1 hover:bg-terracotta-100 dark:hover:bg-terracotta-900/30 text-terracotta-500 rounded transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 统计信息 */}
          <div className="p-4 border-t border-cream-200 dark:border-warm-700 bg-cream-50 dark:bg-warm-700/30">
            <div className="flex justify-around text-center">
              <div>
                <p className="text-2xl font-bold text-warm-700 dark:text-cream-100">{checkins.length}</p>
                <p className="text-xs text-warm-500 dark:text-warm-400">累计打卡</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-500">{streak}</p>
                <p className="text-xs text-warm-500 dark:text-warm-400">连续天数</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-sage-500">{goals.filter(g => g.completed).length}</p>
                <p className="text-xs text-warm-500 dark:text-warm-400">完成目标</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default GoalsPanel
