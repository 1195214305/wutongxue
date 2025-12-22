import { motion, AnimatePresence } from 'framer-motion'

function HelpModal({ isOpen, onClose }) {
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
          <div className="p-6 border-b border-cream-200 dark:border-warm-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warm-100 dark:bg-warm-700 flex items-center justify-center">
                  <svg className="w-5 h-5 text-warm-600 dark:text-warm-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-serif font-semibold text-warm-800 dark:text-cream-100">使用帮助</h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-cream-100 dark:hover:bg-warm-700 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 内容 */}
          <div className="p-6 overflow-y-auto max-h-[65vh] space-y-6">
            {/* 简介 */}
            <section>
              <h4 className="text-lg font-semibold text-warm-800 dark:text-cream-100 mb-3">什么是无痛学？</h4>
              <p className="text-warm-600 dark:text-warm-300 leading-relaxed">
                无痛学是一个沉浸式情景学习系统，通过AI生成的人物对话帮助你轻松掌握知识。
                告别枯燥的死记硬背，在有趣的场景中自然学习！
              </p>
            </section>

            {/* 使用步骤 */}
            <section>
              <h4 className="text-lg font-semibold text-warm-800 dark:text-cream-100 mb-3">如何使用？</h4>
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: '上传知识文件',
                    desc: '支持 PDF、Word、Excel、TXT、Markdown、代码文件等多种格式'
                  },
                  {
                    step: 2,
                    title: '选择学习场景',
                    desc: '职场办公、校园学习、实操场景三种模式，选择最适合你的'
                  },
                  {
                    step: 3,
                    title: '沉浸式学习',
                    desc: 'AI会创建生动的对话场景，你可以参与互动，随时提问'
                  }
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-warm-100 dark:bg-warm-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-warm-600 dark:text-warm-300">{item.step}</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-warm-700 dark:text-cream-200">{item.title}</h5>
                      <p className="text-sm text-warm-500 dark:text-warm-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 功能介绍 */}
            <section>
              <h4 className="text-lg font-semibold text-warm-800 dark:text-cream-100 mb-3">功能特色</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '🎯', title: '模型切换', desc: '支持 Turbo/Max 模型' },
                  { icon: '📝', title: '学习摘要', desc: '随时查看学习进度' },
                  { icon: '💾', title: '历史记录', desc: '自动保存学习会话' },
                  { icon: '📤', title: '导出功能', desc: '导出对话为Markdown' },
                  { icon: '🌙', title: '深色模式', desc: '保护眼睛舒适阅读' },
                  { icon: '📱', title: '移动适配', desc: '手机平板都能用' }
                ].map((item, index) => (
                  <div key={index} className="p-3 bg-cream-50 dark:bg-warm-700/50 rounded-xl">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <h5 className="font-medium text-warm-700 dark:text-cream-200 text-sm">{item.title}</h5>
                    <p className="text-xs text-warm-500 dark:text-warm-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 快捷键 */}
            <section>
              <h4 className="text-lg font-semibold text-warm-800 dark:text-cream-100 mb-3">快捷键</h4>
              <div className="space-y-2">
                {[
                  { key: 'Enter', desc: '发送消息' },
                  { key: 'Shift + Enter', desc: '换行' },
                  { key: 'Esc', desc: '关闭弹窗' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-cream-100 dark:border-warm-700 last:border-0">
                    <span className="text-warm-600 dark:text-warm-300">{item.desc}</span>
                    <kbd className="px-2 py-1 bg-cream-100 dark:bg-warm-700 rounded text-sm font-mono text-warm-700 dark:text-cream-200">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </section>

            {/* 支持的文件格式 */}
            <section>
              <h4 className="text-lg font-semibold text-warm-800 dark:text-cream-100 mb-3">支持的文件格式</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-warm-600 dark:text-warm-300">
                  <span className="font-medium">文档：</span>PDF, Word, TXT, MD
                </div>
                <div className="text-warm-600 dark:text-warm-300">
                  <span className="font-medium">表格：</span>Excel, CSV
                </div>
                <div className="text-warm-600 dark:text-warm-300">
                  <span className="font-medium">代码：</span>JS, Python, Java...
                </div>
                <div className="text-warm-600 dark:text-warm-300">
                  <span className="font-medium">其他：</span>HTML, JSON, XML...
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default HelpModal
