import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://wutongxue-backend.onrender.com'

function QuickReviewPanel({ isOpen, onClose }) {
  const { token, isAuthenticated } = useAuth()
  const [reviewData, setReviewData] = useState({
    recentNotes: [],
    recentFavorites: [],
    wrongQuestions: [],
    flashcards: []
  })
  const [activeTab, setActiveTab] = useState('notes')
  const [isLoading, setIsLoading] = useState(false)

  // 加载复习数据
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchReviewData()
    }
  }, [isOpen, isAuthenticated])

  const fetchReviewData = async () => {
    setIsLoading(true)
    try {
      // 并行获取所有数据
      const [notesRes, favoritesRes, wrongRes, flashcardsRes] = await Promise.all([
        fetch(`${API_BASE}/api/notes?limit=5`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/api/favorites?limit=5`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/api/wrong-questions?limit=5`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/api/flashcards?limit=5`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      const [notes, favorites, wrong, flashcards] = await Promise.all([
        notesRes.ok ? notesRes.json() : { notes: [] },
        favoritesRes.ok ? favoritesRes.json() : { favorites: [] },
        wrongRes.ok ? wrongRes.json() : { questions: [] },
        flashcardsRes.ok ? flashcardsRes.json() : { flashcards: [] }
      ])

      setReviewData({
        recentNotes: notes.notes || [],
        recentFavorites: favorites.favorites || [],
        wrongQuestions: (wrong.questions || []).filter(q => !q.mastered),
        flashcards: flashcards.flashcards || []
      })
    } catch (error) {
      console.error('获取复习数据失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'notes', name: '笔记', icon: '📝', count: reviewData.recentNotes.length },
    { id: 'favorites', name: '收藏', icon: '⭐', count: reviewData.recentFavorites.length },
    { id: 'wrong', name: '错题', icon: '❌', count: reviewData.wrongQuestions.length },
    { id: 'flashcards', name: '闪卡', icon: '🃏', count: reviewData.flashcards.length }
  ]

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
          <div className="p-6 bg-gradient-to-r from-teal-500 to-cyan-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                  📖
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">快速复习</h3>
                  <p className="text-white/70 text-sm">回顾你的学习内容</p>
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

          {/* 标签页 */}
          <div className="flex border-b border-cream-200 dark:border-warm-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-teal-600 dark:text-teal-400'
                    : 'text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-200'
                }`}
              >
                <span className="flex items-center justify-center gap-1">
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                  {tab.count > 0 && (
                    <span className="px-1.5 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-xs rounded-full">
                      {tab.count}
                    </span>
                  )}
                </span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500"
                  />
                )}
              </button>
            ))}
          </div>

          {/* 内容 */}
          <div className="p-6 overflow-y-auto max-h-[55vh]">
            {!isAuthenticated ? (
              <div className="text-center py-12 text-warm-400 dark:text-warm-500">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-lg">登录后可使用快速复习</p>
              </div>
            ) : isLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-warm-200 border-t-warm-600 rounded-full animate-spin mx-auto"></div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* 笔记 */}
                  {activeTab === 'notes' && (
                    <div className="space-y-3">
                      {reviewData.recentNotes.length === 0 ? (
                        <EmptyState icon="📝" text="还没有笔记" />
                      ) : (
                        reviewData.recentNotes.map((note) => (
                          <div
                            key={note.id}
                            className="p-4 bg-cream-50 dark:bg-warm-700/50 rounded-xl border border-cream-200 dark:border-warm-600"
                          >
                            {note.title && (
                              <h4 className="font-medium text-warm-800 dark:text-cream-100 mb-2">
                                {note.title}
                              </h4>
                            )}
                            <p className="text-warm-600 dark:text-warm-300 text-sm line-clamp-3">
                              {note.content}
                            </p>
                            <p className="text-xs text-warm-400 dark:text-warm-500 mt-2">
                              {new Date(note.created_at).toLocaleDateString('zh-CN')}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* 收藏 */}
                  {activeTab === 'favorites' && (
                    <div className="space-y-3">
                      {reviewData.recentFavorites.length === 0 ? (
                        <EmptyState icon="⭐" text="还没有收藏" />
                      ) : (
                        reviewData.recentFavorites.map((fav) => (
                          <div
                            key={fav.id}
                            className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800"
                          >
                            <h4 className="font-medium text-warm-800 dark:text-cream-100 mb-2">
                              {fav.title}
                            </h4>
                            <p className="text-warm-600 dark:text-warm-300 text-sm line-clamp-3">
                              {fav.content}
                            </p>
                            {fav.category && (
                              <span className="inline-block mt-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs rounded-full">
                                {fav.category}
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* 错题 */}
                  {activeTab === 'wrong' && (
                    <div className="space-y-3">
                      {reviewData.wrongQuestions.length === 0 ? (
                        <EmptyState icon="✅" text="没有未掌握的错题" />
                      ) : (
                        reviewData.wrongQuestions.map((q) => (
                          <div
                            key={q.id}
                            className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800"
                          >
                            <p className="font-medium text-warm-800 dark:text-cream-100 mb-2">
                              {q.question}
                            </p>
                            <div className="text-sm text-warm-600 dark:text-warm-300">
                              <p className="text-red-500">你的答案: {String.fromCharCode(65 + q.user_answer)}</p>
                              <p className="text-green-500">正确答案: {String.fromCharCode(65 + q.correct_index)}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* 闪卡 */}
                  {activeTab === 'flashcards' && (
                    <div className="space-y-3">
                      {reviewData.flashcards.length === 0 ? (
                        <EmptyState icon="🃏" text="还没有闪卡" />
                      ) : (
                        reviewData.flashcards.map((card) => (
                          <div
                            key={card.id}
                            className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-200 dark:border-indigo-800"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <p className="font-medium text-warm-800 dark:text-cream-100">
                                  {card.front}
                                </p>
                                <p className="text-warm-500 dark:text-warm-400 text-sm mt-1">
                                  {card.back}
                                </p>
                              </div>
                              {card.next_review_date && (
                                <span className="text-xs text-indigo-500 dark:text-indigo-400 whitespace-nowrap">
                                  {new Date(card.next_review_date) <= new Date() ? '待复习' :
                                    `${Math.ceil((new Date(card.next_review_date) - new Date()) / (1000 * 60 * 60 * 24))}天后`}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* 底部提示 */}
          <div className="p-4 border-t border-cream-200 dark:border-warm-700 bg-cream-50 dark:bg-warm-700/50">
            <p className="text-sm text-warm-500 dark:text-warm-400 text-center">
              定期复习可以帮助你更好地记忆知识点
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// 空状态组件
function EmptyState({ icon, text }) {
  return (
    <div className="text-center py-8 text-warm-400 dark:text-warm-500">
      <div className="text-4xl mb-3">{icon}</div>
      <p>{text}</p>
    </div>
  )
}

export default QuickReviewPanel
