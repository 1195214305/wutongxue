import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function ToolsBar({
  onOpenDashboard,
  onOpenNotes,
  onOpenFavorites,
  onOpenGoals,
  onOpenWrongQuestions,
  onOpenAchievements,
  onOpenReminder,
  onOpenFlashcards,
  onOpenQuickReview,
  onEnterFocusMode
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const tools = [
    {
      id: 'focus',
      name: '专注模式',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      color: 'from-emerald-500 to-teal-500',
      onClick: onEnterFocusMode
    },
    {
      id: 'flashcards',
      name: '闪卡记忆',
      icon: (
        <span className="text-lg">🃏</span>
      ),
      color: 'from-indigo-500 to-purple-500',
      onClick: onOpenFlashcards
    },
    {
      id: 'quickReview',
      name: '快速复习',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      color: 'from-teal-500 to-cyan-500',
      onClick: onOpenQuickReview
    },
    {
      id: 'dashboard',
      name: '数据统计',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'from-blue-500 to-cyan-500',
      onClick: onOpenDashboard
    },
    {
      id: 'notes',
      name: '学习笔记',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: 'from-amber-500 to-orange-500',
      onClick: onOpenNotes
    },
    {
      id: 'favorites',
      name: '知识收藏',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      ),
      color: 'from-rose-500 to-pink-500',
      onClick: onOpenFavorites
    },
    {
      id: 'goals',
      name: '目标打卡',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      ),
      color: 'from-orange-500 to-amber-500',
      onClick: onOpenGoals
    },
    {
      id: 'wrong',
      name: '错题本',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'from-terracotta-500 to-red-500',
      onClick: onOpenWrongQuestions
    },
    {
      id: 'achievements',
      name: '学习成就',
      icon: (
        <span className="text-lg">🏅</span>
      ),
      color: 'from-purple-500 to-pink-500',
      onClick: onOpenAchievements
    },
    {
      id: 'reminder',
      name: '学习提醒',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      color: 'from-blue-500 to-indigo-500',
      onClick: onOpenReminder
    }
  ]

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-14 top-1/2 -translate-y-1/2 bg-white dark:bg-warm-800 rounded-2xl shadow-warm border border-cream-200 dark:border-warm-700 p-2 space-y-1"
          >
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  tool.onClick()
                  setIsExpanded(false)
                }}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-cream-100 dark:hover:bg-warm-700 transition-colors group"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${tool.color} flex items-center justify-center text-white`}>
                  {tool.icon}
                </div>
                <span className="text-warm-700 dark:text-cream-200 text-sm font-medium whitespace-nowrap">
                  {tool.name}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主按钮 */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
          isExpanded
            ? 'bg-warm-600 text-white'
            : 'bg-white dark:bg-warm-800 text-warm-600 dark:text-warm-300 border border-cream-200 dark:border-warm-700'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          animate={{ rotate: isExpanded ? 45 : 0 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </motion.svg>
      </motion.button>
    </div>
  )
}

export default ToolsBar
