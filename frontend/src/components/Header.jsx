import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MODELS = [
  { id: 'qwen-turbo', name: 'Qwen Turbo', desc: '快速响应，适合日常学习' },
  { id: 'qwen-max', name: 'Qwen Max', desc: '更强理解力，适合复杂内容' }
]

function Header({ step, onReset, currentModel, onModelChange, darkMode, onDarkModeToggle, onShowHelp, onShowChangelog }) {
  const [showModelMenu, setShowModelMenu] = useState(false)
  const menuRef = useRef(null)

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowModelMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentModelInfo = MODELS.find(m => m.id === currentModel) || MODELS[0]

  return (
    <header className="border-b border-cream-200 dark:border-warm-700 bg-cream-50/80 dark:bg-warm-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer"
            onClick={onReset}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Logo */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-warm-500 to-warm-700 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-cream-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-serif font-semibold text-warm-800 dark:text-cream-100">无痛学</h1>
              <p className="text-xs text-warm-400 dark:text-warm-500 hidden sm:block">沉浸式情景学习</p>
            </div>
          </motion.div>

          <nav className="flex items-center gap-1 sm:gap-2">
            {/* 帮助按钮 */}
            <button
              onClick={onShowHelp}
              className="p-2 rounded-lg hover:bg-cream-100 dark:hover:bg-warm-800 transition-colors"
              title="帮助"
            >
              <svg className="w-5 h-5 text-warm-500 dark:text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* 更新记录按钮 */}
            <button
              onClick={onShowChangelog}
              className="p-2 rounded-lg hover:bg-cream-100 dark:hover:bg-warm-800 transition-colors"
              title="更新记录"
            >
              <svg className="w-5 h-5 text-warm-500 dark:text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </button>

            {/* 深色模式切换 */}
            <button
              onClick={onDarkModeToggle}
              className="p-2 rounded-lg hover:bg-cream-100 dark:hover:bg-warm-800 transition-colors"
              title={darkMode ? '切换到浅色模式' : '切换到深色模式'}
            >
              {darkMode ? (
                <svg className="w-5 h-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-warm-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* 模型切换 */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowModelMenu(!showModelMenu)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg bg-cream-100 dark:bg-warm-800 hover:bg-cream-200 dark:hover:bg-warm-700 transition-colors text-sm"
              >
                <svg className="w-4 h-4 text-warm-500 dark:text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-warm-700 dark:text-cream-200 font-medium hidden sm:inline">{currentModelInfo.name}</span>
                <span className="text-warm-700 dark:text-cream-200 font-medium sm:hidden">{currentModel === 'qwen-turbo' ? 'Turbo' : 'Max'}</span>
                <svg className={`w-4 h-4 text-warm-400 transition-transform ${showModelMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {showModelMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-warm-800 rounded-xl shadow-warm border border-cream-200 dark:border-warm-700 overflow-hidden z-50"
                  >
                    <div className="p-2">
                      {MODELS.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            onModelChange(model.id)
                            setShowModelMenu(false)
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                            currentModel === model.id
                              ? 'bg-warm-100 dark:bg-warm-700 text-warm-800 dark:text-cream-100'
                              : 'hover:bg-cream-50 dark:hover:bg-warm-700/50 text-warm-600 dark:text-warm-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{model.name}</span>
                            {currentModel === model.id && (
                              <svg className="w-4 h-4 text-warm-600 dark:text-warm-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <p className="text-xs text-warm-400 dark:text-warm-500 mt-0.5">{model.desc}</p>
                        </button>
                      ))}
                    </div>
                    <div className="px-3 py-2 bg-cream-50 dark:bg-warm-900 border-t border-cream-200 dark:border-warm-700">
                      <p className="text-xs text-warm-400 dark:text-warm-500">
                        Qwen Max 理解能力更强，但响应稍慢
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {step > 1 && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={onReset}
                className="hidden sm:flex text-sm text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-300 transition-colors items-center gap-1 ml-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                重新开始
              </motion.button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
