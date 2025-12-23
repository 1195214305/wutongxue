import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://wutongxue-backend.onrender.com'

// 间隔重复算法 - 简化版 SM-2
const calculateNextReview = (card, quality) => {
  // quality: 0-5, 0-2 表示忘记，3-5 表示记住
  let { easeFactor = 2.5, interval = 1, repetitions = 0 } = card

  if (quality < 3) {
    // 忘记了，重置
    repetitions = 0
    interval = 1
  } else {
    // 记住了
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
    repetitions += 1
  }

  // 更新 ease factor
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))

  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + interval)

  return {
    easeFactor,
    interval,
    repetitions,
    nextReviewDate: nextReviewDate.toISOString()
  }
}

function FlashcardsPanel({ isOpen, onClose }) {
  const { token, isAuthenticated } = useAuth()
  const [flashcards, setFlashcards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [mode, setMode] = useState('list') // list, review, create
  const [isLoading, setIsLoading] = useState(false)
  const [dueCards, setDueCards] = useState([])

  // 新卡片表单
  const [newCard, setNewCard] = useState({ front: '', back: '', tags: '' })

  // 加载闪卡
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchFlashcards()
    }
  }, [isOpen, isAuthenticated])

  const fetchFlashcards = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/flashcards`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        const cards = data.flashcards.map(c => ({
          id: c.id,
          front: c.front,
          back: c.back,
          tags: c.tags ? c.tags.split(',') : [],
          easeFactor: c.ease_factor || 2.5,
          interval: c.interval || 1,
          repetitions: c.repetitions || 0,
          nextReviewDate: c.next_review_date,
          createdAt: c.created_at
        }))
        setFlashcards(cards)

        // 筛选今天需要复习的卡片
        const now = new Date()
        const due = cards.filter(c => !c.nextReviewDate || new Date(c.nextReviewDate) <= now)
        setDueCards(due)
      }
    } catch (error) {
      console.error('获取闪卡失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 创建闪卡
  const handleCreateCard = async () => {
    if (!newCard.front.trim() || !newCard.back.trim()) return

    try {
      const response = await fetch(`${API_BASE}/api/flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          front: newCard.front,
          back: newCard.back,
          tags: newCard.tags
        })
      })

      if (response.ok) {
        const data = await response.json()
        const card = {
          id: data.id,
          front: newCard.front,
          back: newCard.back,
          tags: newCard.tags ? newCard.tags.split(',').map(t => t.trim()) : [],
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0,
          nextReviewDate: null
        }
        setFlashcards([card, ...flashcards])
        setDueCards([card, ...dueCards])
        setNewCard({ front: '', back: '', tags: '' })
        setMode('list')
      }
    } catch (error) {
      console.error('创建闪卡失败:', error)
    }
  }

  // 删除闪卡
  const handleDeleteCard = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/flashcards/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        setFlashcards(flashcards.filter(c => c.id !== id))
        setDueCards(dueCards.filter(c => c.id !== id))
      }
    } catch (error) {
      console.error('删除闪卡失败:', error)
    }
  }

  // 复习回答
  const handleReviewAnswer = async (quality) => {
    const card = dueCards[currentIndex]
    const updates = calculateNextReview(card, quality)

    try {
      await fetch(`${API_BASE}/api/flashcards/${card.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })

      // 更新本地状态
      const updatedCard = { ...card, ...updates }
      setFlashcards(flashcards.map(c => c.id === card.id ? updatedCard : c))

      // 移动到下一张
      setIsFlipped(false)
      if (currentIndex < dueCards.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        // 复习完成
        setMode('list')
        setCurrentIndex(0)
        fetchFlashcards() // 刷新列表
      }
    } catch (error) {
      console.error('更新闪卡失败:', error)
    }
  }

  // 开始复习
  const startReview = () => {
    if (dueCards.length > 0) {
      setCurrentIndex(0)
      setIsFlipped(false)
      setMode('review')
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
          className="bg-white dark:bg-warm-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-warm"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                  🃏
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">闪卡记忆</h3>
                  <p className="text-white/70 text-sm">
                    {dueCards.length > 0 ? `${dueCards.length} 张待复习` : '暂无待复习'}
                  </p>
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
          <div className="p-6 overflow-y-auto max-h-[65vh]">
            {!isAuthenticated ? (
              <div className="text-center py-12 text-warm-400 dark:text-warm-500">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-lg">登录后可使用闪卡功能</p>
                <p className="text-sm mt-2">创建记忆卡片，高效复习知识点</p>
              </div>
            ) : isLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-warm-200 border-t-warm-600 rounded-full animate-spin mx-auto"></div>
              </div>
            ) : mode === 'create' ? (
              // 创建卡片
              <div className="space-y-4">
                <button
                  onClick={() => setMode('list')}
                  className="flex items-center gap-1 text-warm-500 hover:text-warm-700 dark:text-warm-400 dark:hover:text-warm-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  返回
                </button>

                <div>
                  <label className="block text-sm font-medium text-warm-700 dark:text-warm-300 mb-2">
                    正面（问题/提示）
                  </label>
                  <textarea
                    value={newCard.front}
                    onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                    placeholder="输入问题或提示词..."
                    className="w-full px-4 py-3 rounded-xl border border-cream-200 dark:border-warm-600 bg-cream-50 dark:bg-warm-700 text-warm-700 dark:text-cream-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-700 dark:text-warm-300 mb-2">
                    背面（答案/解释）
                  </label>
                  <textarea
                    value={newCard.back}
                    onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                    placeholder="输入答案或解释..."
                    className="w-full px-4 py-3 rounded-xl border border-cream-200 dark:border-warm-600 bg-cream-50 dark:bg-warm-700 text-warm-700 dark:text-cream-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-700 dark:text-warm-300 mb-2">
                    标签（可选，用逗号分隔）
                  </label>
                  <input
                    type="text"
                    value={newCard.tags}
                    onChange={(e) => setNewCard({ ...newCard, tags: e.target.value })}
                    placeholder="例如：数学, 公式, 重要"
                    className="w-full px-4 py-3 rounded-xl border border-cream-200 dark:border-warm-600 bg-cream-50 dark:bg-warm-700 text-warm-700 dark:text-cream-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  onClick={handleCreateCard}
                  disabled={!newCard.front.trim() || !newCard.back.trim()}
                  className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-warm-300 dark:disabled:bg-warm-600 text-white rounded-xl transition-colors"
                >
                  创建闪卡
                </button>
              </div>
            ) : mode === 'review' ? (
              // 复习模式
              <div className="space-y-6">
                <div className="flex items-center justify-between text-sm text-warm-500 dark:text-warm-400">
                  <span>进度: {currentIndex + 1} / {dueCards.length}</span>
                  <button
                    onClick={() => { setMode('list'); setCurrentIndex(0); }}
                    className="text-indigo-500 hover:text-indigo-600"
                  >
                    退出复习
                  </button>
                </div>

                {/* 进度条 */}
                <div className="h-2 bg-cream-200 dark:bg-warm-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / dueCards.length) * 100}%` }}
                  />
                </div>

                {/* 卡片 */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="relative h-64 cursor-pointer perspective-1000"
                >
                  <motion.div
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full relative preserve-3d"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* 正面 */}
                    <div
                      className="absolute inset-0 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border-2 border-indigo-200 dark:border-indigo-700 flex items-center justify-center backface-hidden"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <p className="text-xl text-center text-warm-800 dark:text-cream-100">
                        {dueCards[currentIndex]?.front}
                      </p>
                    </div>

                    {/* 背面 */}
                    <div
                      className="absolute inset-0 p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-purple-200 dark:border-purple-700 flex items-center justify-center backface-hidden"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <p className="text-xl text-center text-warm-800 dark:text-cream-100">
                        {dueCards[currentIndex]?.back}
                      </p>
                    </div>
                  </motion.div>
                </div>

                <p className="text-center text-sm text-warm-400 dark:text-warm-500">
                  点击卡片翻转
                </p>

                {/* 评分按钮 */}
                {isFlipped && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-4 gap-2"
                  >
                    <button
                      onClick={() => handleReviewAnswer(1)}
                      className="py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <div className="text-lg">😵</div>
                      <div className="text-xs mt-1">完全忘记</div>
                    </button>
                    <button
                      onClick={() => handleReviewAnswer(2)}
                      className="py-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                    >
                      <div className="text-lg">😕</div>
                      <div className="text-xs mt-1">有点模糊</div>
                    </button>
                    <button
                      onClick={() => handleReviewAnswer(4)}
                      className="py-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                    >
                      <div className="text-lg">😊</div>
                      <div className="text-xs mt-1">记得</div>
                    </button>
                    <button
                      onClick={() => handleReviewAnswer(5)}
                      className="py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      <div className="text-lg">🤩</div>
                      <div className="text-xs mt-1">非常熟悉</div>
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              // 列表模式
              <div className="space-y-4">
                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <button
                    onClick={startReview}
                    disabled={dueCards.length === 0}
                    className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-warm-300 dark:disabled:bg-warm-600 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    开始复习 ({dueCards.length})
                  </button>
                  <button
                    onClick={() => setMode('create')}
                    className="px-4 py-3 bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 rounded-xl hover:bg-cream-200 dark:hover:bg-warm-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* 统计 */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-center">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{flashcards.length}</div>
                    <div className="text-xs text-indigo-500 dark:text-indigo-400">总卡片</div>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{dueCards.length}</div>
                    <div className="text-xs text-orange-500 dark:text-orange-400">待复习</div>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {flashcards.filter(c => c.repetitions > 0).length}
                    </div>
                    <div className="text-xs text-green-500 dark:text-green-400">已学习</div>
                  </div>
                </div>

                {/* 卡片列表 */}
                {flashcards.length === 0 ? (
                  <div className="text-center py-8 text-warm-400 dark:text-warm-500">
                    <div className="text-4xl mb-3">🃏</div>
                    <p>还没有闪卡</p>
                    <p className="text-sm mt-1">点击右上角 + 创建第一张卡片</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {flashcards.map((card) => (
                      <div
                        key={card.id}
                        className="p-3 bg-cream-50 dark:bg-warm-700/50 rounded-xl border border-cream-200 dark:border-warm-600"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-warm-700 dark:text-cream-200 truncate">
                              {card.front}
                            </p>
                            <p className="text-sm text-warm-500 dark:text-warm-400 truncate mt-1">
                              {card.back}
                            </p>
                            {card.tags.length > 0 && (
                              <div className="flex gap-1 mt-2 flex-wrap">
                                {card.tags.map((tag, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-lg transition-colors flex-shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 提示 */}
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">
                    <strong>间隔重复：</strong>系统会根据你的记忆情况自动安排复习时间，帮助你高效记忆知识点。
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default FlashcardsPanel
