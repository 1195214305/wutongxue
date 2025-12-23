import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TOUR_STEPS = [
  {
    target: 'upload-zone',
    title: '上传学习资料',
    content: '将你想要学习的知识文件拖拽到这里，支持 PDF、Word、TXT、Markdown 等多种格式。',
    position: 'bottom'
  },
  {
    target: 'scenario-selector',
    title: '选择学习场景',
    content: '选择一个适合你的学习场景：职场办公、校园学习或实操场景，让学习更加沉浸。',
    position: 'bottom'
  },
  {
    target: 'chat-interface',
    title: '沉浸式对话学习',
    content: '通过自然的人物对话来学习知识，你可以随时提问、互动，让学习变得轻松有趣。',
    position: 'top'
  },
  {
    target: 'model-switcher',
    title: '切换AI模型',
    content: '点击这里可以切换不同的AI模型。Turbo 速度更快，Max 效果更好。',
    position: 'bottom'
  },
  {
    target: 'dark-mode-toggle',
    title: '深色模式',
    content: '点击这里可以切换深色/浅色模式，保护你的眼睛。',
    position: 'bottom'
  },
  {
    target: 'user-menu',
    title: '登录同步',
    content: '登录账号后，你的学习记录将自动同步到云端，可在任意设备上继续学习。',
    position: 'bottom'
  }
]

const STORAGE_KEY = 'wutongxue_tour_completed'

function UserTour({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 检查是否已完成引导
    const completed = localStorage.getItem(STORAGE_KEY)
    if (!completed) {
      // 延迟显示，等待页面渲染完成
      setTimeout(() => setIsVisible(true), 500)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setIsVisible(false)
    onComplete && onComplete()
  }

  if (!isVisible) return null

  const step = TOUR_STEPS[currentStep]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
      >
        {/* 遮罩层 */}
        <div className="absolute inset-0 bg-warm-900/70" onClick={handleSkip} />

        {/* 引导卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto"
        >
          <div className="bg-white dark:bg-warm-800 rounded-2xl shadow-warm overflow-hidden">
            {/* 进度条 */}
            <div className="h-1 bg-cream-200 dark:bg-warm-700">
              <motion.div
                className="h-full bg-warm-600 dark:bg-warm-400"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* 内容 */}
            <div className="p-6">
              {/* 图标 */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center">
                {currentStep === 0 && (
                  <svg className="w-8 h-8 text-sage-600 dark:text-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                {currentStep === 1 && (
                  <svg className="w-8 h-8 text-sage-600 dark:text-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )}
                {currentStep === 2 && (
                  <svg className="w-8 h-8 text-sage-600 dark:text-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                )}
                {currentStep === 3 && (
                  <svg className="w-8 h-8 text-sage-600 dark:text-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
                {currentStep === 4 && (
                  <svg className="w-8 h-8 text-sage-600 dark:text-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
                {currentStep === 5 && (
                  <svg className="w-8 h-8 text-sage-600 dark:text-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>

              {/* 标题和内容 */}
              <h3 className="text-xl font-serif font-semibold text-warm-800 dark:text-cream-100 text-center mb-2">
                {step.title}
              </h3>
              <p className="text-warm-600 dark:text-warm-300 text-center mb-6">
                {step.content}
              </p>

              {/* 步骤指示器 */}
              <div className="flex justify-center gap-1.5 mb-6">
                {TOUR_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-warm-600 dark:bg-warm-400'
                        : index < currentStep
                        ? 'bg-warm-400 dark:bg-warm-500'
                        : 'bg-cream-300 dark:bg-warm-600'
                    }`}
                  />
                ))}
              </div>

              {/* 按钮 */}
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="flex-1 py-2.5 border border-cream-300 dark:border-warm-600 text-warm-600 dark:text-warm-300 rounded-xl font-medium hover:bg-cream-50 dark:hover:bg-warm-700 transition-colors"
                  >
                    上一步
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex-1 py-2.5 bg-warm-700 hover:bg-warm-800 dark:bg-warm-600 dark:hover:bg-warm-500 text-cream-50 rounded-xl font-medium transition-colors"
                >
                  {currentStep === TOUR_STEPS.length - 1 ? '开始使用' : '下一步'}
                </button>
              </div>

              {/* 跳过按钮 */}
              <button
                onClick={handleSkip}
                className="w-full mt-3 py-2 text-sm text-warm-400 dark:text-warm-500 hover:text-warm-600 dark:hover:text-warm-300 transition-colors"
              >
                跳过引导
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// 重置引导状态的函数（可在帮助中心调用）
export function resetTour() {
  localStorage.removeItem(STORAGE_KEY)
}

export default UserTour
