import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://wutongxue-backend.onrender.com'

// 成就定义
const ACHIEVEMENTS = [
  { id: 'first_lesson', name: '初学者', description: '完成第一次学习', icon: '🌱' },
  { id: 'study_5', name: '学习达人', description: '完成5次学习', icon: '📚' },
  { id: 'study_20', name: '知识猎人', description: '完成20次学习', icon: '🎯' },
  { id: 'study_50', name: '学霸', description: '完成50次学习', icon: '🏆' },
  { id: 'streak_3', name: '坚持不懈', description: '连续学习3天', icon: '🔥' },
  { id: 'streak_7', name: '一周达人', description: '连续学习7天', icon: '⭐' },
  { id: 'streak_30', name: '月度冠军', description: '连续学习30天', icon: '👑' },
  { id: 'quiz_first', name: '初试牛刀', description: '完成第一次测验', icon: '✏️' },
  { id: 'quiz_10', name: '测验达人', description: '完成10次测验', icon: '📝' },
  { id: 'perfect_quiz', name: '满分王者', description: '测验获得满分', icon: '💯' },
  { id: 'notes_5', name: '笔记新手', description: '记录5条笔记', icon: '📒' },
  { id: 'notes_20', name: '笔记大师', description: '记录20条笔记', icon: '📖' },
  { id: 'favorites_10', name: '收藏家', description: '收藏10个知识点', icon: '❤️' },
  { id: 'time_60', name: '专注一小时', description: '累计学习1小时', icon: '⏰' },
  { id: 'time_300', name: '学习5小时', description: '累计学习5小时', icon: '🕐' },
  { id: 'time_1000', name: '千分钟俱乐部', description: '累计学习1000分钟', icon: '🎖️' },
  { id: 'wrong_master', name: '错题克星', description: '掌握10道错题', icon: '💪' },
  { id: 'early_bird', name: '早起鸟', description: '早上6-8点学习', icon: '🌅' },
  { id: 'night_owl', name: '夜猫子', description: '晚上10点后学习', icon: '🦉' },
  { id: 'weekend_warrior', name: '周末战士', description: '周末也在学习', icon: '⚔️' }
]

function AchievementsPanel({ isOpen, onClose }) {
  const { token, isAuthenticated } = useAuth()
  const [unlockedAchievements, setUnlockedAchievements] = useState([])
  const [newAchievement, setNewAchievement] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // 加载成就
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchAchievements()
    }
  }, [isOpen, isAuthenticated])

  const fetchAchievements = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/achievements`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setUnlockedAchievements(data.achievements.map(a => a.achievement_id))
      }
    } catch (error) {
      console.error('获取成就失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
            {!isAuthenticated ? (
              <div className="text-center py-12 text-warm-400 dark:text-warm-500">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-lg">登录后可查看学习成就</p>
                <p className="text-sm mt-2">完成学习任务解锁成就徽章</p>
              </div>
            ) : isLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-warm-200 border-t-warm-600 rounded-full animate-spin mx-auto"></div>
              </div>
            ) : (
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
            )}
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

// 解锁成就的辅助函数
export const unlockAchievement = async (achievementId, token) => {
  if (!token) return false

  try {
    const response = await fetch(`${API_BASE}/api/achievements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ achievementId })
    })

    return response.ok
  } catch (error) {
    console.error('解锁成就失败:', error)
    return false
  }
}

export default AchievementsPanel
