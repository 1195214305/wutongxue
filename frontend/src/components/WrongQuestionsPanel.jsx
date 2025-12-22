import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEY = 'wutongxue_wrong_questions'

function WrongQuestionsPanel({ isOpen, onClose }) {
  const [wrongQuestions, setWrongQuestions] = useState([])
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [retryAnswer, setRetryAnswer] = useState(null)
  const [filter, setFilter] = useState('all') // all, unmastered, mastered

  // 加载错题
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setWrongQuestions(JSON.parse(saved))
    }
  }, [isOpen])

  // 保存错题
  const saveWrongQuestions = (newQuestions) => {
    setWrongQuestions(newQuestions)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newQuestions))
  }

  // 删除错题
  const handleDelete = (id) => {
    saveWrongQuestions(wrongQuestions.filter(q => q.id !== id))
    if (selectedQuestion?.id === id) {
      setSelectedQuestion(null)
    }
  }

  // 标记为已掌握
  const handleMarkMastered = (id) => {
    saveWrongQuestions(wrongQuestions.map(q =>
      q.id === id ? { ...q, mastered: !q.mastered } : q
    ))
  }

  // 重做题目
  const handleRetry = (question) => {
    setSelectedQuestion(question)
    setShowAnswer(false)
    setRetryAnswer(null)
  }

  // 提交重做答案
  const handleSubmitRetry = () => {
    setShowAnswer(true)
    if (retryAnswer === selectedQuestion.correctIndex) {
      // 答对了，增加正确次数
      saveWrongQuestions(wrongQuestions.map(q =>
        q.id === selectedQuestion.id
          ? { ...q, retryCount: (q.retryCount || 0) + 1, lastRetry: Date.now() }
          : q
      ))
    }
  }

  // 筛选错题
  const filteredQuestions = wrongQuestions.filter(q => {
    if (filter === 'mastered') return q.mastered
    if (filter === 'unmastered') return !q.mastered
    return true
  })

  // 导出错题
  const handleExport = () => {
    let markdown = `# 无痛学 - 错题本\n\n`
    markdown += `导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`
    markdown += `共 ${wrongQuestions.length} 道错题\n\n`
    markdown += `---\n\n`

    wrongQuestions.forEach((q, index) => {
      markdown += `## 题目 ${index + 1}\n\n`
      markdown += `**来源**: ${q.fileName || '未知'}\n\n`
      markdown += `**题目**: ${q.question}\n\n`
      markdown += `**选项**:\n`
      q.options.forEach((opt, i) => {
        const marker = i === q.correctIndex ? '✓' : (i === q.userAnswer ? '✗' : ' ')
        markdown += `${marker} ${String.fromCharCode(65 + i)}. ${opt}\n`
      })
      markdown += `\n**正确答案**: ${String.fromCharCode(65 + q.correctIndex)}\n`
      markdown += `**你的答案**: ${String.fromCharCode(65 + q.userAnswer)}\n`
      if (q.explanation) {
        markdown += `\n**解析**: ${q.explanation}\n`
      }
      markdown += `\n---\n\n`
    })

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `无痛学-错题本-${new Date().toISOString().slice(0, 10)}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
          <div className="p-4 border-b border-cream-200 dark:border-warm-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-terracotta-100 dark:bg-terracotta-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-terracotta-600 dark:text-terracotta-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-warm-800 dark:text-cream-100">错题本</h3>
                <span className="px-2 py-0.5 bg-terracotta-100 dark:bg-terracotta-900/30 text-terracotta-600 dark:text-terracotta-400 text-xs rounded-full">
                  {wrongQuestions.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="p-2 rounded-lg hover:bg-cream-100 dark:hover:bg-warm-700 text-warm-500 dark:text-warm-400 transition-colors"
                  title="导出错题"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
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

            {/* 筛选 */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === 'all'
                    ? 'bg-warm-600 text-white'
                    : 'bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300'
                }`}
              >
                全部 ({wrongQuestions.length})
              </button>
              <button
                onClick={() => setFilter('unmastered')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === 'unmastered'
                    ? 'bg-terracotta-500 text-white'
                    : 'bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300'
                }`}
              >
                未掌握 ({wrongQuestions.filter(q => !q.mastered).length})
              </button>
              <button
                onClick={() => setFilter('mastered')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === 'mastered'
                    ? 'bg-sage-500 text-white'
                    : 'bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300'
                }`}
              >
                已掌握 ({wrongQuestions.filter(q => q.mastered).length})
              </button>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="p-4 overflow-y-auto max-h-[65vh]">
            {selectedQuestion ? (
              // 重做题目视图
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedQuestion(null)}
                  className="flex items-center gap-1 text-warm-500 hover:text-warm-700 dark:text-warm-400 dark:hover:text-warm-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  返回列表
                </button>

                <div className="p-4 bg-cream-50 dark:bg-warm-700/50 rounded-xl">
                  <p className="font-medium text-warm-800 dark:text-cream-100 mb-4">
                    {selectedQuestion.question}
                  </p>

                  <div className="space-y-2">
                    {selectedQuestion.options.map((option, index) => {
                      const isCorrect = showAnswer && index === selectedQuestion.correctIndex
                      const isWrong = showAnswer && retryAnswer === index && index !== selectedQuestion.correctIndex
                      const isSelected = retryAnswer === index

                      return (
                        <button
                          key={index}
                          onClick={() => !showAnswer && setRetryAnswer(index)}
                          disabled={showAnswer}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            isCorrect
                              ? 'bg-sage-100 dark:bg-sage-900/30 border-2 border-sage-500'
                              : isWrong
                              ? 'bg-terracotta-100 dark:bg-terracotta-900/30 border-2 border-terracotta-500'
                              : isSelected
                              ? 'bg-warm-100 dark:bg-warm-600 border-2 border-warm-500'
                              : 'bg-white dark:bg-warm-800 border border-cream-200 dark:border-warm-600 hover:border-warm-300 dark:hover:border-warm-500'
                          }`}
                        >
                          <span className="text-warm-700 dark:text-cream-200">
                            {String.fromCharCode(65 + index)}. {option}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {showAnswer && selectedQuestion.explanation && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>解析：</strong>{selectedQuestion.explanation}
                      </p>
                    </div>
                  )}

                  {!showAnswer ? (
                    <button
                      onClick={handleSubmitRetry}
                      disabled={retryAnswer === null}
                      className="mt-4 w-full py-2 bg-warm-600 hover:bg-warm-700 disabled:bg-warm-300 dark:disabled:bg-warm-600 text-white rounded-lg transition-colors"
                    >
                      提交答案
                    </button>
                  ) : (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleRetry(selectedQuestion)}
                        className="flex-1 py-2 bg-warm-600 hover:bg-warm-700 text-white rounded-lg transition-colors"
                      >
                        再做一次
                      </button>
                      <button
                        onClick={() => handleMarkMastered(selectedQuestion.id)}
                        className={`flex-1 py-2 rounded-lg transition-colors ${
                          selectedQuestion.mastered
                            ? 'bg-cream-200 dark:bg-warm-600 text-warm-600 dark:text-warm-300'
                            : 'bg-sage-500 hover:bg-sage-600 text-white'
                        }`}
                      >
                        {selectedQuestion.mastered ? '取消掌握' : '标记已掌握'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : filteredQuestions.length === 0 ? (
              // 空状态
              <div className="text-center py-12 text-warm-400 dark:text-warm-500">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg">
                  {filter === 'all' ? '还没有错题' : filter === 'mastered' ? '还没有已掌握的题目' : '所有错题都已掌握'}
                </p>
                <p className="text-sm mt-2">完成测验后，错题会自动收集到这里</p>
              </div>
            ) : (
              // 错题列表
              <div className="space-y-3">
                {filteredQuestions.map((question) => (
                  <div
                    key={question.id}
                    className={`p-4 rounded-xl border transition-colors ${
                      question.mastered
                        ? 'bg-sage-50 dark:bg-sage-900/10 border-sage-200 dark:border-sage-800'
                        : 'bg-cream-50 dark:bg-warm-700/50 border-cream-200 dark:border-warm-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-warm-700 dark:text-cream-200 font-medium line-clamp-2">
                        {question.question}
                      </p>
                      {question.mastered && (
                        <span className="px-2 py-0.5 bg-sage-100 dark:bg-sage-900/30 text-sage-600 dark:text-sage-400 text-xs rounded-full flex-shrink-0">
                          已掌握
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-warm-400 dark:text-warm-500 mb-3">
                      <span>{question.fileName || '未知来源'}</span>
                      <span>重做 {question.retryCount || 0} 次</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRetry(question)}
                        className="flex-1 py-1.5 bg-warm-600 hover:bg-warm-700 text-white text-sm rounded-lg transition-colors"
                      >
                        重做
                      </button>
                      <button
                        onClick={() => handleMarkMastered(question.id)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          question.mastered
                            ? 'bg-cream-200 dark:bg-warm-600 text-warm-600 dark:text-warm-300'
                            : 'bg-sage-100 dark:bg-sage-900/30 text-sage-600 dark:text-sage-400'
                        }`}
                      >
                        {question.mastered ? '取消' : '掌握'}
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="p-1.5 hover:bg-terracotta-100 dark:hover:bg-terracotta-900/30 text-terracotta-500 rounded-lg transition-colors"
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
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// 添加错题的辅助函数
export const addWrongQuestion = (question, userAnswer, fileName) => {
  const saved = localStorage.getItem(STORAGE_KEY)
  const wrongQuestions = saved ? JSON.parse(saved) : []

  // 检查是否已存在相同题目
  const exists = wrongQuestions.some(q => q.question === question.question)
  if (exists) return false

  const newQuestion = {
    id: Date.now().toString(),
    question: question.question,
    options: question.options,
    correctIndex: question.correctIndex,
    explanation: question.explanation,
    userAnswer,
    fileName,
    mastered: false,
    retryCount: 0,
    createdAt: Date.now()
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify([newQuestion, ...wrongQuestions]))
  return true
}

export default WrongQuestionsPanel
