import { motion, AnimatePresence } from 'framer-motion'

const CHANGELOG = [
  {
    version: 'v1.7.1',
    date: '2025-12-23',
    highlighted: true,
    highlightLabel: '数据云端化',
    changes: [
      { type: 'feature', text: '所有用户数据云端存储 - 笔记、收藏、打卡、错题、成就等' },
      { type: 'feature', text: '学习数据中心显示真实统计数据' },
      { type: 'improve', text: '环境音效升级为真实音频（雨声、森林、海浪等）' },
      { type: 'improve', text: '音效支持多源备用，确保播放稳定' },
      { type: 'fix', text: '修复学习数据中心硬编码假数据问题' },
      { type: 'fix', text: '修复提醒设置未保存到云端问题' }
    ]
  },
  {
    version: 'v1.7.0',
    date: '2025-12-23',
    highlighted: true,
    highlightLabel: '重大更新',
    changes: [
      { type: 'feature', text: '学习数据统计仪表盘 - 可视化学习时长、次数、趋势' },
      { type: 'feature', text: '智能笔记系统 - 随时记录学习心得，支持导出' },
      { type: 'feature', text: '知识点收藏夹 - 收藏重要知识点，分类管理' },
      { type: 'feature', text: '学习目标与打卡系统 - 设定目标，连续打卡' },
      { type: 'feature', text: '错题本系统 - 自动收集测验错题，支持重做' },
      { type: 'feature', text: '学习成就系统 - 20+成就徽章，激励学习' },
      { type: 'feature', text: '学习提醒通知 - 定时提醒，养成学习习惯' },
      { type: 'improve', text: '新增右侧工具栏，快速访问所有功能' }
    ]
  },
  {
    version: 'v1.6.2',
    date: '2025-12-23',
    changes: [
      { type: 'feature', text: '添加环境音效播放器（雨声、森林、海浪等）' },
      { type: 'feature', text: '添加番茄钟专注计时器（25分钟专注+5分钟休息）' },
      { type: 'feature', text: '添加设置面板（字体大小调节、快捷键查看）' },
      { type: 'improve', text: '优化学习体验，支持自定义字体大小' },
      { type: 'improve', text: '新增快捷键提示面板' }
    ]
  },
  {
    version: 'v1.6.1',
    date: '2025-12-23',
    highlighted: true,
    highlightLabel: '里程碑版本',
    changes: [
      { type: 'feature', text: '迁移至 Turso 云端数据库，数据永久保存' },
      { type: 'fix', text: '修复服务重启后用户数据丢失的问题' },
      { type: 'improve', text: '提升数据库稳定性和访问速度' }
    ]
  },
  {
    version: 'v1.6.0',
    date: '2025-12-23',
    changes: [
      { type: 'feature', text: '添加管理员后台面板，可视化查看用户数据' },
      { type: 'feature', text: '添加 .doc 格式文件支持（旧版 Word 文档）' },
      { type: 'feature', text: '添加语音朗读功能，可朗读 AI 回复' },
      { type: 'feature', text: '添加消息复制功能，一键复制对话内容' },
      { type: 'improve', text: '添加后端健康检查，优化服务监控' },
      { type: 'fix', text: '修复后端服务休眠监控失败问题' }
    ]
  },
  {
    version: 'v1.5.0',
    date: '2025-12-22',
    changes: [
      { type: 'feature', text: '添加用户登录注册系统，支持多设备同步' },
      { type: 'feature', text: '添加新用户引导教程' },
      { type: 'feature', text: '添加 GitHub 项目链接' },
      { type: 'improve', text: '学习历史记录云端存储，永不丢失' },
      { type: 'improve', text: '优化历史记录恢复功能' }
    ]
  },
  {
    version: 'v1.4.0',
    date: '2025-12-22',
    changes: [
      { type: 'feature', text: '学习历史记录支持点击恢复对话' },
      { type: 'feature', text: '历史记录不限保留次数，支持折叠显示' },
      { type: 'improve', text: '优化历史记录展示，默认显示3条，可展开查看全部' }
    ]
  },
  {
    version: 'v1.3.0',
    date: '2025-12-22',
    changes: [
      { type: 'feature', text: '添加帮助中心和更新记录' },
      { type: 'feature', text: '添加学习历史记录功能' },
      { type: 'feature', text: '添加对话导出功能（Markdown格式）' },
      { type: 'feature', text: '添加流式输出（打字机效果）' },
      { type: 'feature', text: '添加深色模式切换' },
      { type: 'feature', text: '添加知识点测验功能' },
      { type: 'improve', text: '优化移动端适配' }
    ]
  },
  {
    version: 'v1.2.0',
    date: '2025-12-21',
    changes: [
      { type: 'feature', text: '添加模型切换功能（Qwen Turbo/Max）' },
      { type: 'improve', text: '右上角显示当前模型，点击可切换' }
    ]
  },
  {
    version: 'v1.1.0',
    date: '2025-12-21',
    changes: [
      { type: 'feature', text: '扩展文件格式支持' },
      { type: 'feature', text: '支持 PDF、Word、Excel 文件解析' },
      { type: 'feature', text: '支持多种代码文件格式' },
      { type: 'fix', text: '修复 PDF.js worker CDN 路径问题' }
    ]
  },
  {
    version: 'v1.0.0',
    date: '2025-12-20',
    changes: [
      { type: 'feature', text: '项目初始化' },
      { type: 'feature', text: '实现文件上传功能' },
      { type: 'feature', text: '实现场景选择（职场/校园/实操）' },
      { type: 'feature', text: '实现沉浸式对话学习' },
      { type: 'feature', text: '实现学习进度摘要' }
    ]
  }
]

const typeColors = {
  feature: 'bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-400',
  improve: 'bg-warm-100 text-warm-700 dark:bg-warm-900/30 dark:text-warm-400',
  fix: 'bg-terracotta-100 text-terracotta-700 dark:bg-terracotta-900/30 dark:text-terracotta-400'
}

const typeLabels = {
  feature: '新功能',
  improve: '优化',
  fix: '修复'
}

function ChangelogModal({ isOpen, onClose }) {
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
                <div className="w-10 h-10 rounded-xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-sage-600 dark:text-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-serif font-semibold text-warm-800 dark:text-cream-100">更新记录</h3>
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
          <div className="p-6 overflow-y-auto max-h-[65vh]">
            <div className="space-y-8">
              {CHANGELOG.map((release, index) => (
                <div key={release.version} className="relative">
                  {/* 时间线 */}
                  {index < CHANGELOG.length - 1 && (
                    <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-cream-200 dark:bg-warm-700" />
                  )}

                  {/* 版本标题 */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                      release.highlighted
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg shadow-amber-200 dark:shadow-amber-900/30'
                        : 'bg-warm-600 dark:bg-warm-500'
                    }`}>
                      {release.highlighted ? (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`font-semibold ${
                            release.highlighted
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-warm-800 dark:text-cream-100'
                          }`}>{release.version}</h4>
                          {release.highlighted && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 rounded-full">
                              {release.highlightLabel}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-warm-500 dark:text-warm-400">{release.date}</p>
                      </div>
                    </div>
                  </div>

                  {/* 更新内容 */}
                  <div className="ml-12 space-y-2">
                    {release.changes.map((change, changeIndex) => (
                      <div key={changeIndex} className="flex items-start gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[change.type]}`}>
                          {typeLabels[change.type]}
                        </span>
                        <span className="text-warm-600 dark:text-warm-300 text-sm">{change.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ChangelogModal
