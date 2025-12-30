import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { parseFile, getAllSupportedExtensions, getFileType, getFileTypeLabel } from '../utils/fileParser'

function UploadSection({ onSuccess, history = [], onRestoreHistory, onDeleteHistory, uploadedFile = null, onStartImmersiveLearning }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [parseProgress, setParseProgress] = useState('')
  const [historyExpanded, setHistoryExpanded] = useState(false) // 历史记录展开状态
  const fileInputRef = useRef(null)

  const supportedExtensions = getAllSupportedExtensions()
  const acceptString = supportedExtensions.join(',')

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = async (file) => {
    setError('')
    setIsUploading(true)
    setParseProgress('正在识别文件类型...')

    try {
      const fileType = getFileType(file.name)

      if (!fileType) {
        throw new Error('不支持的文件格式')
      }

      setParseProgress(`正在解析 ${getFileTypeLabel(file.name)}...`)

      // 解析文件内容
      const content = await parseFile(file)

      if (!content || content.trim().length === 0) {
        throw new Error('文件内容为空')
      }

      // 生成会话ID
      const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2)

      setParseProgress('解析完成！')

      setTimeout(() => {
        onSuccess({
          sessionId,
          fileName: file.name,
          content,
          fileType
        })
      }, 300)

    } catch (err) {
      console.error('文件解析错误:', err)
      setError(err.message || '文件读取失败，请重试')
    } finally {
      setIsUploading(false)
      setParseProgress('')
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`

    return date.toLocaleDateString('zh-CN')
  }

  const scenarioNames = {
    workplace: '职场办公',
    campus: '校园学习',
    practice: '实操场景'
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-warm-800 dark:text-cream-100 mb-3">
          开始你的学习之旅
        </h2>
        <p className="text-warm-500 dark:text-warm-400 text-base sm:text-lg">
          上传你想要学习的知识文件，我们将为你创造沉浸式的学习体验
        </p>
      </div>

      <motion.div
        className={`upload-zone rounded-2xl p-8 sm:p-12 text-center cursor-pointer ${
          isDragging ? 'dragging' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptString}
          onChange={handleFileSelect}
        />

        {isUploading ? (
          <div className="py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-warm-200 dark:border-warm-600 border-t-warm-600 dark:border-t-warm-400 animate-spin" />
            <p className="text-warm-600 dark:text-warm-300 font-medium">{parseProgress || '正在处理...'}</p>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-cream-100 dark:bg-warm-700 flex items-center justify-center">
              <svg className="w-10 h-10 text-warm-400 dark:text-warm-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <p className="text-warm-700 dark:text-cream-200 font-medium text-lg mb-2">
              拖拽文件到这里，或点击选择
            </p>
            <p className="text-warm-400 dark:text-warm-500 text-sm mb-4">
              支持多种文件格式
            </p>
          </>
        )}
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-terracotta-50 dark:bg-terracotta-900/20 border border-terracotta-200 dark:border-terracotta-800 rounded-lg text-terracotta-600 dark:text-terracotta-400 text-sm text-center"
        >
          {error}
        </motion.div>
      )}

      {/* 学习历史记录 */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <div
            className="flex items-center justify-between mb-4 cursor-pointer"
            onClick={() => setHistoryExpanded(!historyExpanded)}
          >
            <h3 className="text-lg font-medium text-warm-700 dark:text-cream-200 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              学习历史
              <span className="text-sm text-warm-400 dark:text-warm-500 font-normal">
                ({history.length}条记录)
              </span>
            </h3>
            <button className="p-1 rounded-lg hover:bg-cream-100 dark:hover:bg-warm-700 transition-colors">
              <svg
                className={`w-5 h-5 text-warm-400 transition-transform duration-200 ${historyExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <AnimatePresence>
            {historyExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {history.map((item, index) => (
                    <motion.div
                      key={item.id || index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="p-3 bg-cream-50 dark:bg-warm-800 rounded-xl border border-cream-200 dark:border-warm-700 flex items-center justify-between hover:bg-cream-100 dark:hover:bg-warm-700 cursor-pointer transition-colors group"
                      onClick={() => onRestoreHistory && onRestoreHistory(item)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-warm-100 dark:bg-warm-700 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-warm-500 dark:text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-warm-700 dark:text-cream-200 font-medium text-sm truncate">
                            {item.fileName}
                          </p>
                          <p className="text-warm-400 dark:text-warm-500 text-xs">
                            {scenarioNames[item.scenario]} · {formatTime(item.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-warm-100 dark:bg-warm-700 text-warm-500 dark:text-warm-400 rounded-full flex-shrink-0">
                          {item.model === 'qwen-max' ? 'Max' : 'Turbo'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteHistory && onDeleteHistory(item.id)
                          }}
                          className="w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-terracotta-100 dark:hover:bg-terracotta-900/30 text-warm-400 hover:text-terracotta-500 transition-all"
                          title="删除记录"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 折叠时显示最近3条预览 */}
          {!historyExpanded && (
            <div className="space-y-2">
              {history.slice(0, 3).map((item, index) => (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 bg-cream-50 dark:bg-warm-800 rounded-xl border border-cream-200 dark:border-warm-700 flex items-center justify-between hover:bg-cream-100 dark:hover:bg-warm-700 cursor-pointer transition-colors group"
                  onClick={() => onRestoreHistory && onRestoreHistory(item)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-warm-100 dark:bg-warm-700 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-warm-500 dark:text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-warm-700 dark:text-cream-200 font-medium text-sm truncate">
                        {item.fileName}
                      </p>
                      <p className="text-warm-400 dark:text-warm-500 text-xs">
                        {scenarioNames[item.scenario]} · {formatTime(item.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-warm-100 dark:bg-warm-700 text-warm-500 dark:text-warm-400 rounded-full flex-shrink-0">
                      {item.model === 'qwen-max' ? 'Max' : 'Turbo'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteHistory && onDeleteHistory(item.id)
                      }}
                      className="w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-terracotta-100 dark:hover:bg-terracotta-900/30 text-warm-400 hover:text-terracotta-500 transition-all"
                      title="删除记录"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
              {history.length > 3 && (
                <button
                  onClick={() => setHistoryExpanded(true)}
                  className="w-full py-2 text-sm text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-300 transition-colors"
                >
                  查看全部 {history.length} 条记录 ↓
                </button>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* 支持的文件格式说明 */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
            title: '文档',
            formats: 'PDF, Word, TXT, MD'
          },
          {
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ),
            title: '表格',
            formats: 'Excel, CSV'
          },
          {
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            ),
            title: '代码',
            formats: 'JS, Python, Java...'
          },
          {
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            ),
            title: '更多',
            formats: 'HTML, JSON, XML...'
          }
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-3 bg-cream-50 dark:bg-warm-800 rounded-xl border border-cream-200 dark:border-warm-700 text-center"
          >
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-warm-100 dark:bg-warm-700 text-warm-500 dark:text-warm-400 flex items-center justify-center">
              {item.icon}
            </div>
            <h4 className="font-medium text-warm-700 dark:text-cream-200 text-sm">{item.title}</h4>
            <p className="text-xs text-warm-400 dark:text-warm-500 mt-1">{item.formats}</p>
          </motion.div>
        ))}
      </div>

      {/* 特性说明 */}
      <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-6">
        {[
          {
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            ),
            title: '情景对话',
            desc: '通过人物对话自然学习'
          },
          {
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            ),
            title: '沉浸体验',
            desc: '身临其境掌握知识'
          },
          {
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            ),
            title: '高效记忆',
            desc: '告别枯燥的死记硬背'
          }
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="text-center p-3 sm:p-4"
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-sage-50 dark:bg-sage-900/30 text-sage-500 dark:text-sage-400 flex items-center justify-center">
              {item.icon}
            </div>
            <h3 className="font-medium text-warm-700 dark:text-cream-200 mb-1 text-sm sm:text-base">{item.title}</h3>
            <p className="text-xs sm:text-sm text-warm-400 dark:text-warm-500">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* 沉浸式学习入口 - 新功能 */}
      {uploadedFile && onStartImmersiveLearning && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-warm-50 via-cream-50 to-sage-50 dark:from-warm-800 dark:via-warm-800 dark:to-warm-700 border-2 border-warm-200 dark:border-warm-600 p-6 sm:p-8">
            {/* 装饰性背景 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sage-100/50 to-transparent dark:from-sage-900/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-warm-100/50 to-transparent dark:from-warm-900/20 rounded-full blur-3xl" />

            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              {/* 图标 */}
              <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-warm-600 to-warm-700 dark:from-warm-500 dark:to-warm-600 flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-cream-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>

              {/* 文字内容 */}
              <div className="flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-warm-600/10 dark:bg-warm-500/20 rounded-full mb-3">
                  <span className="w-2 h-2 bg-warm-600 dark:bg-warm-500 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-warm-700 dark:text-warm-300 uppercase tracking-wide">全新功能</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-semibold text-warm-800 dark:text-cream-100 mb-2">
                  沉浸式学习模式
                </h3>
                <p className="text-sm sm:text-base text-warm-600 dark:text-warm-300 leading-relaxed">
                  个性化课本 · 实时互动问题 · 章节测验 · PPT讲解 · 思维导图
                </p>
              </div>

              {/* 按钮 */}
              <motion.button
                onClick={onStartImmersiveLearning}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-warm-600 to-warm-700 dark:from-warm-500 dark:to-warm-600 text-cream-50 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>开始学习</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default UploadSection
