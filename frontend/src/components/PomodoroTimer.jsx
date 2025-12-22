import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TIMER_MODES = {
  focus: { label: '专注', duration: 25 * 60, color: 'from-red-400 to-orange-500' },
  shortBreak: { label: '短休息', duration: 5 * 60, color: 'from-green-400 to-emerald-500' },
  longBreak: { label: '长休息', duration: 15 * 60, color: 'from-blue-400 to-cyan-500' },
}

function PomodoroTimer() {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState('focus')
  const [timeLeft, setTimeLeft] = useState(TIMER_MODES.focus.duration)
  const [isRunning, setIsRunning] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const intervalRef = useRef(null)
  const audioRef = useRef(null)

  // 播放提示音
  const playNotification = useCallback(() => {
    // 使用 Web Audio API 播放简单提示音
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (e) {
      console.log('Audio notification failed:', e)
    }
  }, [])

  // 计时器逻辑
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      playNotification()
      setIsRunning(false)

      // 自动切换模式
      if (mode === 'focus') {
        setCompletedPomodoros((prev) => prev + 1)
        // 每4个番茄钟后长休息
        if ((completedPomodoros + 1) % 4 === 0) {
          setMode('longBreak')
          setTimeLeft(TIMER_MODES.longBreak.duration)
        } else {
          setMode('shortBreak')
          setTimeLeft(TIMER_MODES.shortBreak.duration)
        }
      } else {
        setMode('focus')
        setTimeLeft(TIMER_MODES.focus.duration)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft, mode, completedPomodoros, playNotification])

  const handleModeChange = (newMode) => {
    setMode(newMode)
    setTimeLeft(TIMER_MODES[newMode].duration)
    setIsRunning(false)
  }

  const handleToggle = () => {
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    setTimeLeft(TIMER_MODES[mode].duration)
    setIsRunning(false)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = 1 - timeLeft / TIMER_MODES[mode].duration
  const currentMode = TIMER_MODES[mode]

  return (
    <div className="relative">
      {/* 番茄钟按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
          isRunning
            ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-200 dark:shadow-red-900/30'
            : 'bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 hover:bg-cream-200 dark:hover:bg-warm-600'
        }`}
        title="番茄钟"
      >
        {isRunning ? (
          <span className="text-xs font-bold">{formatTime(timeLeft).split(':')[0]}</span>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>

      {/* 番茄钟面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-12 w-80 bg-white dark:bg-warm-800 rounded-2xl shadow-warm border border-cream-200 dark:border-warm-700 p-4 z-50"
          >
            {/* 标题 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-warm-800 dark:text-cream-100">番茄钟</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-warm-500 dark:text-warm-400">
                  已完成: {completedPomodoros} 个
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 rounded-full hover:bg-cream-100 dark:hover:bg-warm-700 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* 模式选择 */}
            <div className="flex gap-2 mb-4">
              {Object.entries(TIMER_MODES).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleModeChange(key)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    mode === key
                      ? `bg-gradient-to-r ${value.color} text-white shadow-lg`
                      : 'bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 hover:bg-cream-200 dark:hover:bg-warm-600'
                  }`}
                >
                  {value.label}
                </button>
              ))}
            </div>

            {/* 计时器显示 */}
            <div className="relative mb-4">
              {/* 进度环 */}
              <div className="relative w-40 h-40 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  {/* 背景圆环 */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-cream-200 dark:text-warm-700"
                  />
                  {/* 进度圆环 */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 70}
                    strokeDashoffset={2 * Math.PI * 70 * (1 - progress)}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={mode === 'focus' ? '#f87171' : mode === 'shortBreak' ? '#4ade80' : '#60a5fa'} />
                      <stop offset="100%" stopColor={mode === 'focus' ? '#fb923c' : mode === 'shortBreak' ? '#34d399' : '#22d3ee'} />
                    </linearGradient>
                  </defs>
                </svg>

                {/* 时间显示 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-warm-800 dark:text-cream-100">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-sm text-warm-500 dark:text-warm-400">
                    {currentMode.label}
                  </span>
                </div>
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="flex justify-center gap-3">
              <button
                onClick={handleReset}
                className="w-12 h-12 rounded-full bg-cream-100 dark:bg-warm-700 hover:bg-cream-200 dark:hover:bg-warm-600 flex items-center justify-center transition-colors"
                title="重置"
              >
                <svg className="w-5 h-5 text-warm-600 dark:text-warm-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              <button
                onClick={handleToggle}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isRunning
                    ? 'bg-warm-200 dark:bg-warm-600 hover:bg-warm-300 dark:hover:bg-warm-500'
                    : `bg-gradient-to-r ${currentMode.color} hover:opacity-90`
                }`}
              >
                {isRunning ? (
                  <svg className="w-8 h-8 text-warm-700 dark:text-warm-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              <button
                onClick={() => {
                  if (mode === 'focus') {
                    handleModeChange('shortBreak')
                  } else {
                    handleModeChange('focus')
                  }
                }}
                className="w-12 h-12 rounded-full bg-cream-100 dark:bg-warm-700 hover:bg-cream-200 dark:hover:bg-warm-600 flex items-center justify-center transition-colors"
                title="跳过"
              >
                <svg className="w-5 h-5 text-warm-600 dark:text-warm-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* 提示 */}
            <p className="mt-4 text-xs text-warm-400 dark:text-warm-500 text-center">
              专注25分钟 → 短休息5分钟 → 每4个番茄钟后长休息15分钟
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PomodoroTimer
