import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FONT_SIZES = [
  { id: 'small', label: '小', value: 14 },
  { id: 'medium', label: '中', value: 16 },
  { id: 'large', label: '大', value: 18 },
  { id: 'xlarge', label: '特大', value: 20 },
]

const SHORTCUTS = [
  { keys: ['Ctrl', 'Shift', 'A'], desc: '打开管理员面板' },
  { keys: ['Ctrl', 'Enter'], desc: '发送消息' },
  { keys: ['Esc'], desc: '关闭弹窗' },
]

function SettingsPanel({ fontSize, onFontSizeChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('font')

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('.settings-panel')) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative settings-panel">
      {/* 设置按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 hover:bg-cream-200 dark:hover:bg-warm-600"
        title="设置"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* 设置面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-12 w-72 bg-white dark:bg-warm-800 rounded-2xl shadow-warm border border-cream-200 dark:border-warm-700 overflow-hidden z-50"
          >
            {/* 标题 */}
            <div className="flex items-center justify-between p-4 border-b border-cream-200 dark:border-warm-700">
              <h3 className="font-semibold text-warm-800 dark:text-cream-100">设置</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-full hover:bg-cream-100 dark:hover:bg-warm-700 flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* 标签页 */}
            <div className="flex border-b border-cream-200 dark:border-warm-700">
              <button
                onClick={() => setActiveTab('font')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'font'
                    ? 'text-warm-700 dark:text-cream-100 border-b-2 border-warm-600 dark:border-warm-400'
                    : 'text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-300'
                }`}
              >
                字体大小
              </button>
              <button
                onClick={() => setActiveTab('shortcuts')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'shortcuts'
                    ? 'text-warm-700 dark:text-cream-100 border-b-2 border-warm-600 dark:border-warm-400'
                    : 'text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-300'
                }`}
              >
                快捷键
              </button>
            </div>

            {/* 内容区域 */}
            <div className="p-4">
              {activeTab === 'font' && (
                <div className="space-y-4">
                  {/* 字体大小选择 */}
                  <div className="grid grid-cols-4 gap-2">
                    {FONT_SIZES.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => onFontSizeChange(size.value)}
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                          fontSize === size.value
                            ? 'bg-warm-600 dark:bg-warm-500 text-white shadow-lg'
                            : 'bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 hover:bg-cream-200 dark:hover:bg-warm-600'
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>

                  {/* 预览 */}
                  <div className="p-3 bg-cream-50 dark:bg-warm-900 rounded-xl">
                    <p className="text-warm-500 dark:text-warm-400 text-xs mb-2">预览效果</p>
                    <p
                      className="text-warm-700 dark:text-warm-200"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      这是一段示例文字，用于预览字体大小效果。
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'shortcuts' && (
                <div className="space-y-3">
                  {SHORTCUTS.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-cream-50 dark:bg-warm-900 rounded-xl"
                    >
                      <span className="text-sm text-warm-600 dark:text-warm-300">
                        {shortcut.desc}
                      </span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, i) => (
                          <kbd
                            key={i}
                            className="px-2 py-1 text-xs font-mono bg-cream-200 dark:bg-warm-700 text-warm-700 dark:text-warm-200 rounded"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SettingsPanel
