import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateScenario, continueChat, getSummary, generateQuiz } from '../services/api'

function ChatInterface({ sessionId, scenario, fileName, fileContent, model, restoredMessages, onSaveSession }) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStarting, setIsStarting] = useState(true)
  const [showSummary, setShowSummary] = useState(false)
  const [summary, setSummary] = useState('')
  const [apiMessages, setApiMessages] = useState([])
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizData, setQuizData] = useState(null)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const messagesEndRef = useRef(null)
  const isRestoredRef = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingText])

  useEffect(() => {
    // 如果有恢复的消息，直接使用
    if (restoredMessages && !isRestoredRef.current) {
      isRestoredRef.current = true
      setMessages(restoredMessages.messages)
      setApiMessages(restoredMessages.apiMessages)
      setIsStarting(false)
    } else if (!restoredMessages && !isRestoredRef.current) {
      startLearning()
    }
  }, [restoredMessages])

  // 保存会话到 localStorage
  useEffect(() => {
    if (sessionId && messages.length > 0 && apiMessages.length > 0 && !isStarting && onSaveSession) {
      onSaveSession(sessionId, messages, apiMessages)
    }
  }, [messages, apiMessages, sessionId, isStarting])

  // 打字机效果
  const typeText = async (text, onUpdate) => {
    setIsStreaming(true)
    let currentText = ''
    const chars = text.split('')

    for (let i = 0; i < chars.length; i++) {
      currentText += chars[i]
      onUpdate(currentText)
      // 随机延迟模拟打字效果
      await new Promise(resolve => setTimeout(resolve, Math.random() * 20 + 10))
    }
    setIsStreaming(false)
    return currentText
  }

  const startLearning = async () => {
    setIsStarting(true)
    try {
      const result = await generateScenario(fileContent, scenario, model)

      const newApiMessages = [
        { role: 'system', content: result.systemPrompt },
        { role: 'assistant', content: result.response }
      ]
      setApiMessages(newApiMessages)

      // 使用打字机效果显示
      setMessages([{ role: 'assistant', content: '' }])
      await typeText(result.response, (text) => {
        setMessages([{ role: 'assistant', content: text }])
      })
    } catch (err) {
      console.error('开始学习失败:', err)
      setMessages([{
        role: 'assistant',
        content: '抱歉，启动学习场景时遇到了问题。请检查网络连接或刷新页面重试。\n\n错误信息：' + err.message
      }])
    } finally {
      setIsStarting(false)
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || isStreaming) return

    const userMessage = inputValue.trim()
    setInputValue('')
    const newMessages = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const response = await continueChat(apiMessages, userMessage, model)

      const newApiMessages = [
        ...apiMessages,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: response }
      ]
      setApiMessages(newApiMessages)

      // 使用打字机效果
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])
      await typeText(response, (text) => {
        setMessages(prev => {
          const updatedMessages = [...prev]
          updatedMessages[updatedMessages.length - 1] = { role: 'assistant', content: text }
          return updatedMessages
        })
      })
    } catch (err) {
      console.error('发送消息失败:', err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，处理你的回复时遇到了问题。请重试。'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleGetSummary = async () => {
    setShowSummary(true)
    setSummary('')
    try {
      const result = await getSummary(apiMessages, model)
      setSummary(result)
    } catch (err) {
      console.error('获取摘要失败:', err)
      setSummary('获取学习摘要失败，请重试。')
    }
  }

  // 导出对话为 Markdown
  const handleExport = () => {
    const scenarioNames = {
      workplace: '职场办公',
      campus: '校园学习',
      practice: '实操场景'
    }

    let markdown = `# 无痛学 - 学习记录\n\n`
    markdown += `**文件**: ${fileName}\n`
    markdown += `**场景**: ${scenarioNames[scenario]}\n`
    markdown += `**时间**: ${new Date().toLocaleString('zh-CN')}\n`
    markdown += `**模型**: ${model}\n\n`
    markdown += `---\n\n`

    messages.forEach((msg) => {
      if (msg.role === 'assistant') {
        markdown += `### 学习助手\n\n${msg.content}\n\n`
      } else {
        markdown += `### 我\n\n${msg.content}\n\n`
      }
    })

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `无痛学-${fileName}-${new Date().toISOString().slice(0, 10)}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 生成测验
  const handleStartQuiz = async () => {
    setShowQuiz(true)
    setQuizData(null)
    setQuizAnswers({})
    setQuizSubmitted(false)

    try {
      const quiz = await generateQuiz(apiMessages, model)
      setQuizData(quiz)
    } catch (err) {
      console.error('生成测验失败:', err)
      setQuizData({ error: '生成测验失败，请重试。' })
    }
  }

  const handleQuizAnswer = (questionIndex, answerIndex) => {
    if (quizSubmitted) return
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }))
  }

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true)
  }

  const scenarioNames = {
    workplace: '职场办公',
    campus: '校园学习',
    practice: '实操场景'
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 顶部信息栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-cream-200 dark:border-warm-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-warm-500 dark:text-warm-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="truncate max-w-[150px]">{fileName}</span>
          </div>
          <span className="text-cream-300 dark:text-warm-600 hidden sm:inline">|</span>
          <div className="flex items-center gap-2 text-sm text-warm-500 dark:text-warm-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {scenarioNames[scenario]}
          </div>
          {restoredMessages && (
            <span className="text-xs px-2 py-1 bg-sage-100 dark:bg-sage-900/30 text-sage-600 dark:text-sage-400 rounded-full">
              已恢复
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="btn-secondary text-sm py-2 px-3"
            title="导出对话"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button
            onClick={handleStartQuiz}
            className="btn-secondary text-sm py-2 px-3"
            title="知识测验"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </button>
          <button
            onClick={handleGetSummary}
            className="btn-secondary text-sm py-2 px-3"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className="hidden sm:inline">学习进度</span>
            </span>
          </button>
        </div>
      </div>

      {/* 对话区域 */}
      <div className="bg-cream-50 dark:bg-warm-800 rounded-2xl border border-cream-200 dark:border-warm-700 overflow-hidden">
        <div className="h-[400px] sm:h-[500px] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {isStarting && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full border-3 border-warm-200 dark:border-warm-600 border-t-warm-600 dark:border-t-warm-400 animate-spin" />
                <p className="text-warm-500 dark:text-warm-400">正在创建学习场景...</p>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`chat-bubble ${message.role} p-3 sm:p-4 shadow-soft max-w-[85%] sm:max-w-[80%]`}>
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-cream-200 dark:border-warm-600">
                        <div className="w-6 h-6 rounded-full bg-warm-100 dark:bg-warm-700 flex items-center justify-center">
                          <svg className="w-4 h-4 text-warm-600 dark:text-warm-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <span className="text-xs text-warm-400 dark:text-warm-500 font-medium">学习助手</span>
                      </div>
                    )}
                    <div className={`whitespace-pre-wrap leading-relaxed text-sm sm:text-base ${
                      message.role === 'user' ? 'text-cream-50' : 'text-warm-700 dark:text-cream-200'
                    }`}>
                      {message.content}
                      {isStreaming && index === messages.length - 1 && message.role === 'assistant' && (
                        <span className="inline-block w-2 h-4 bg-warm-500 dark:bg-warm-400 animate-pulse ml-1" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && !isStreaming && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="chat-bubble assistant p-4">
                    <div className="typing-indicator flex items-center gap-1">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="border-t border-cream-200 dark:border-warm-700 p-3 sm:p-4 bg-white dark:bg-warm-900">
          <div className="flex gap-2 sm:gap-3">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入你的回复，参与到对话中..."
              className="input-field flex-1 resize-none text-sm sm:text-base"
              rows={2}
              disabled={isLoading || isStarting || isStreaming}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading || isStarting || isStreaming}
              className="btn-primary self-end px-4 sm:px-6"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-warm-400 dark:text-warm-500">
            <span>按 Enter 发送</span>
            <span>Shift + Enter 换行</span>
          </div>
        </div>
      </div>

      {/* 快捷回复建议 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {['继续讲解', '能举个例子吗？', '这部分我理解了', '请再详细说明一下'].map((suggestion, index) => (
          <button
            key={index}
            onClick={() => setInputValue(suggestion)}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-cream-100 dark:bg-warm-800 text-warm-600 dark:text-warm-300 rounded-full hover:bg-cream-200 dark:hover:bg-warm-700 transition-colors"
            disabled={isLoading || isStarting || isStreaming}
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* 学习摘要弹窗 */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-warm-900/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSummary(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-warm-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-warm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-cream-200 dark:border-warm-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-serif font-semibold text-warm-800 dark:text-cream-100">学习进度摘要</h3>
                  <button
                    onClick={() => setShowSummary(false)}
                    className="w-8 h-8 rounded-full hover:bg-cream-100 dark:hover:bg-warm-700 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-5 h-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {summary ? (
                  <div className="whitespace-pre-wrap text-warm-700 dark:text-cream-200 leading-relaxed">
                    {summary}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 rounded-full border-2 border-warm-200 dark:border-warm-600 border-t-warm-600 dark:border-t-warm-400 animate-spin" />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 知识测验弹窗 */}
      <AnimatePresence>
        {showQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-warm-900/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQuiz(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-warm-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-warm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-cream-200 dark:border-warm-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-serif font-semibold text-warm-800 dark:text-cream-100">知识点测验</h3>
                  <button
                    onClick={() => setShowQuiz(false)}
                    className="w-8 h-8 rounded-full hover:bg-cream-100 dark:hover:bg-warm-700 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-5 h-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[65vh]">
                {!quizData ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto mb-4 rounded-full border-2 border-warm-200 dark:border-warm-600 border-t-warm-600 dark:border-t-warm-400 animate-spin" />
                      <p className="text-warm-500 dark:text-warm-400">正在生成测验题目...</p>
                    </div>
                  </div>
                ) : quizData.error ? (
                  <p className="text-warm-500 dark:text-warm-400 text-center">{quizData.error}</p>
                ) : (
                  <div className="space-y-6">
                    {quizData.questions?.map((q, qIndex) => (
                      <div key={qIndex} className="p-4 bg-cream-50 dark:bg-warm-700/50 rounded-xl">
                        <p className="font-medium text-warm-800 dark:text-cream-100 mb-3">
                          {qIndex + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options?.map((option, oIndex) => {
                            const isSelected = quizAnswers[qIndex] === oIndex
                            const isCorrect = quizSubmitted && oIndex === q.correctIndex
                            const isWrong = quizSubmitted && isSelected && oIndex !== q.correctIndex

                            return (
                              <button
                                key={oIndex}
                                onClick={() => handleQuizAnswer(qIndex, oIndex)}
                                disabled={quizSubmitted}
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
                                <span className="text-warm-700 dark:text-cream-200">{option}</span>
                              </button>
                            )
                          })}
                        </div>
                        {quizSubmitted && q.explanation && (
                          <p className="mt-3 text-sm text-warm-500 dark:text-warm-400 bg-cream-100 dark:bg-warm-700 p-3 rounded-lg">
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}

                    {!quizSubmitted && quizData.questions && (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(quizAnswers).length < quizData.questions.length}
                        className="w-full btn-primary py-3"
                      >
                        提交答案
                      </button>
                    )}

                    {quizSubmitted && quizData.questions && (
                      <div className="text-center p-4 bg-warm-100 dark:bg-warm-700 rounded-xl">
                        <p className="text-lg font-semibold text-warm-800 dark:text-cream-100">
                          得分: {quizData.questions.filter((q, i) => quizAnswers[i] === q.correctIndex).length} / {quizData.questions.length}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ChatInterface
