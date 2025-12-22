import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEY = 'wutongxue_achievements'

// 成就定义
const ACHIEVEMENTS = [
  {
    id: 'first_lesson',
    name: '初学者',
    description: '完成第一次学习',
    icon: '🌱',
    condition: (stats) => stats.sessionsCount >= 1
  },
  {
    id: 'study_5',
    name: '学习达人',
    description: '完成5次学习',
    icon: '📚',
    condition: (stats) => stats.sessionsCount >= 5
  },
  {
    id: 'study_20',
    name: '知识猎人',
    description: '完成20次学习',
    icon: '🎯',
    condition: (stats) => stats.sessionsCount >= 20
  },
  {
    id: 'study_50',
    name: '学霸',
    description: '完成50次学习',
    icon: '🏆',
    condition: (stats) => stats.sessionsCount >= 50
  },
  {
    id: 'streak_3',
    name: '坚持不懈',
    description: '连续学习3天',
    icon: '🔥',
    condition: (stats) => stats.streak >= 3
  },
  {
    id: 'streak_7',
    name: '一周达人',
    description: '连续学习7天',
    icon: '⭐',
    condition: (stats) => stats.streak >= 7
  },
  {
    id: 'streak_30',
    name: '月度冠军',
    description: '连续学习30天',
    icon: '👑',
    condition: (stats) => stats.streak >= 30
  },
  {
    id: 'quiz_first',
    name: '初试牛刀',
    description: '完成第一次测验',
    icon: '✏️',
    condition: (stats) => stats.quizCount >= 1
  },
  {
    id: 'quiz_10',
    name: '测验达人',
    description: '完成10次测验',
    icon: '📝',
    condition: (stats) => stats.quizCount >= 10
  },
  {
    id: 'perfect_quiz',
    name: '满分王者',
    description: '测验获得满分',
    icon: '💯',
    condition: (stats) => stats.perfectQuiz >= 1
  },
  {
    id: 'notes_5',
    name: '笔记新手',
    description: '记录5条笔记',
    icon: '📒',
    condition: (stats) => stats.notesCount >= 5
  },
  {
    id: 'notes_20',
    name: '笔记大师',
    description: '记录20条笔记',
    icon: '📖',
    condition: (stats) => stats.notesCount >= 20
  },
  {
    id: 'favorites_10',
    name: '收藏家',
    description: '收藏10个知识点',
    icon: '❤️',
    condition: (stats) => stats.favoritesCount >= 10
  },
  {
    id: 'time_60',
    name: '专注一小时',
    description: '累计学习1小时',
    icon: '⏰',
    condition: (stats) => stats.learningTime >= 60
  },
  {
    id: 'time_300',
    name: '学习5小时',
    description: '累计学习5小时',
    icon: '🕐',
    condition: (stats) => stats.learningTime >= 300
  },
  {
    id: 'time_1000',
    name: '千分钟俱乐部',
    description: '累计学习1000分钟',
    icon: '🎖️',
    condition: (stats) => stats.learningTime >= 1000
  },
  {
    id: 'wrong_master',
    name: '错题克星',
    description: '掌握10道错题',
    icon: '💪',
    condition: (stats) => stats.masteredWrong >= 10
  },
  {
    id: 'early_bird',
    name: '早起鸟',
    description: '早上6-8点学习',
    icon: '🌅',
    condition: (stats) => stats.earlyBird
  },
  {
    id: 'night_owl',
    name: '夜猫子',
    description: '晚上10点后学习',
    icon: '🦉',
    condition: (stats) => stats.nightOwl
  },
  {
    id: 'weekend_warrior',
    name: '周末战士',
    description: '周末也在学习',
    icon: '⚔️',
    condition: (stats) => stats.weekendStudy
  }
]

function AchievementsPanel({ isOpen, onClose }) {
  const [unlockedAchievements, setUnlockedAchievements] = useState([])
  const [newAchievement, setNewAchievement] = useState(null)

  // 获取统计数据
  const getStats = () => {
    const sessionsCount = parseInt(localStorage.getItem('wutongxue_sessions_count') || '0')
    const quizCount = parseInt(localStorage.getItem('wutongxue_quiz_count') || '0')
    const perfectQuiz = parseInt(localStorage.getItem('wutongxue_perfect_quiz') || '0')
    const learningTime = parseInt(localStorage.getItem('wutongxue_learning_time') || '0')
    const streak = parseInt(localStorage.getItem('wutongxue_streak') || '0')
    const notes = JSON.parse(localStorage.getItem('wutongxue_notes') || '[]')
    const favorites = JSON.parse(localStorage.getItem('wutongxue_favorites') || '[]')
    const wrongQuestions = JSON.parse(localStorage.getItem('wutongxue_wrong_questions') || '[]')
    const earlyBird = localStorage.getItem('wutongxue_early_bird') === 'true'
    const nightOwl = localStorage.getItem('wutongxue_night_owl') === 'true'
    const weekendStudy = localStorage.getItem('wutongxue_weekend_study') === 'true'

    return {
      sessionsCount,
      quizCount,
      perfectQuiz,
      learningTime,
      streak,
      notesCount: notes.length,
      favoritesCount: favorites.length,
      masteredWrong: wrongQuestions.filter(q => q.mastered).length,
      earlyBird,
      nightOwl,
      weekendStudy
    }
  }

  // 检查成就
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(STORAGE_KEY)
      const unlocked = saved ? JSON.parse(saved) : []
      setUnlockedAchievements(unlocked)

      // 检查新成就
      const stats = getStats()
      const newUnlocked = []

      ACHIEVEMENTS.forEach(achievement => {
        if (!unlocked.includes(achievement.id) && achievement.condition(stats)) {
          newUnlocked.push(achievement.id)
        }
      })

      if (newUnlocked.length > 0) {
        const allUnlocked = [...unlocked, ...newUnlocked]
        setUnlockedAchievements(allUnlocked)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allUnlocked))

        // 显示新成就动画
        const newAch = ACHIEVEMENTS.find(a => a.id === newUnlocked[0])
        setNewAchievement(newAch)
        setTimeout(() => setNewAchievement(null), 3000)
      }
    }
  }, [isOpen])

  const unlockedCount = unlockedAchievements.length
  const totalCount = ACHIEVEMENTS.length
  const progress = Math.round((unlockedCount / totalCount) * 100)

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
          className="bg-white dark:bg-warm-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-warm"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                  🏅
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">学习成就</h3>
                  <p className="text-white/70 text-sm">已解锁 {unlockedCount}/{totalCount}</p>
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

            {/* 进度条 */}
            <div className="bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-white/70 text-xs mt-2 text-right">{progress}% 完成</p>
          </div>

          {/* 成就列表 */}
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ACHIEVEMENTS.map((achievement) => {
                const isUnlocked = unlockedAchievements.includes(achievement.id)

                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-xl text-center transition-all ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700'
                        : 'bg-cream-50 dark:bg-warm-700/50 border border-cream-200 dark:border-warm-600 opacity-60'
                    }`}
                  >
                    <div className={`text-3xl mb-2 ${isUnlocked ? '' : 'grayscale'}`}>
                      {achievement.icon}
                    </div>
                    <h4 className={`font-semibold text-sm ${
                      isUnlocked
                        ? 'text-amber-700 dark:text-amber-300'
                        : 'text-warm-500 dark:text-warm-400'
                    }`}>
                      {achievement.name}
                    </h4>
                    <p className="text-xs text-warm-400 dark:text-warm-500 mt-1">
                      {achievement.description}
                    </p>
                    {isUnlocked && (
                      <div className="mt-2">
                        <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs rounded-full">
                          已解锁
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 新成就弹窗 */}
          <AnimatePresence>
            {newAchievement && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="absolute inset-0 flex items-center justify-center bg-warm-900/80"
              >
                <div className="bg-white dark:bg-warm-800 rounded-2xl p-8 text-center shadow-2xl">
                  <div className="text-6xl mb-4 animate-bounce">{newAchievement.icon}</div>
                  <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-2">
                    成就解锁！
                  </h3>
                  <p className="text-xl font-semibold text-warm-800 dark:text-cream-100">
                    {newAchievement.name}
                  </p>
                  <p className="text-warm-500 dark:text-warm-400 mt-2">
                    {newAchievement.description}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// 更新成就统计的辅助函数
export const updateAchievementStats = (type, value = 1) => {
  const key = `wutongxue_${type}`
  const current = parseInt(localStorage.getItem(key) || '0')
  localStorage.setItem(key, (current + value).toString())

  // 检查特殊成就
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 8) {
    localStorage.setItem('wutongxue_early_bird', 'true')
  }
  if (hour >= 22 || hour < 5) {
    localStorage.setItem('wutongxue_night_owl', 'true')
  }
  const day = new Date().getDay()
  if (day === 0 || day === 6) {
    localStorage.setItem('wutongxue_weekend_study', 'true')
  }
}

export default AchievementsPanel
