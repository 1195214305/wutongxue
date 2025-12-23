import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function FocusMode({ isActive, onExit, children }) {
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showControls, setShowControls] = useState(false)

  // 计时器
  useEffect(() => {
    if (!isActive || isPaused) return

    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, isPaused])

  // 重置计时器
  useEffect(() => {
    if (!isActive) {
      setTimeElapsed(0)
      setIsPaused(false)
    }
  }, [isActive])

  // 键盘快捷键
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onExit()
      } else if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault()
        setIsPaused(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive, onExit])

  // 格式化时间
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 进入全屏
  const enterFullscreen = useCallback(() => {
    const elem = document.documentElement
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen()
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen()
    }
  }, [])

  // 退出全屏
  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
  }, [])

  // 处理退出
  const handleExit = () => {
    exitFullscreen()
    onExit()
  }

  if (!isActive) return children

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-cream-50 dark:bg-warm-900"
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* 顶部控制栏 */}
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: showControls ? 0 : -100 }}
          transition={{ duration: 0.3 }}
          className="absolute top-0 left-0 right-0 h-16 bg-white/80 dark:bg-warm-800/80 backdrop-blur-sm border-b border-cream-200 dark:border-warm-700 flex items-center justify-between px-6 z-10"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-green-500 animate-pulse'}`} />
              <span className="text-sm font-medium text-warm-600 dark:text-warm-300">
                {isPaused ? '已暂停' : '专注中'}
              </span>
            </div>
            <div className="text-2xl font-mono font-bold text-warm-800 dark:text-cream-100">
              {formatTime(timeElapsed)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-4 py-2 rounded-lg bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 hover:bg-cream-200 dark:hover:bg-warm-600 transition-colors flex items-center gap-2"
            >
              {isPaused ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  继续
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                  暂停
                </>
              )}
            </button>
            <button
              onClick={enterFullscreen}
              className="p-2 rounded-lg bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 hover:bg-cream-200 dark:hover:bg-warm-600 transition-colors"
              title="全屏"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <button
              onClick={handleExit}
              className="px-4 py-2 rounded-lg bg-terracotta-100 dark:bg-terracotta-900/30 text-terracotta-600 dark:text-terracotta-400 hover:bg-terracotta-200 dark:hover:bg-terracotta-900/50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              退出专注
            </button>
          </div>
        </motion.div>

        {/* 主内容区域 */}
        <div className="h-full pt-0 overflow-auto">
          {children}
        </div>

        {/* 底部提示 */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: showControls ? 0 : 100 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 right-0 h-12 bg-white/80 dark:bg-warm-800/80 backdrop-blur-sm border-t border-cream-200 dark:border-warm-700 flex items-center justify-center gap-6 text-sm text-warm-500 dark:text-warm-400"
        >
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 bg-cream-200 dark:bg-warm-600 rounded text-xs">Esc</kbd>
            退出专注
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 bg-cream-200 dark:bg-warm-600 rounded text-xs">Space</kbd>
            暂停/继续
          </span>
        </motion.div>

        {/* 暂停遮罩 */}
        <AnimatePresence>
          {isPaused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-warm-900/50 flex items-center justify-center z-20"
              onClick={() => setIsPaused(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-6xl mb-4">☕</div>
                <h2 className="text-2xl font-bold text-white mb-2">休息一下</h2>
                <p className="text-white/70 mb-6">已专注 {formatTime(timeElapsed)}</p>
                <button
                  onClick={() => setIsPaused(false)}
                  className="px-6 py-3 bg-white text-warm-800 rounded-xl font-medium hover:bg-cream-100 transition-colors"
                >
                  继续学习
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}

export default FocusMode
