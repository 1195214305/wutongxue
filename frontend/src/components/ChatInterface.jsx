import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateScenario, continueChat, getSummary } from '../services/api'

function ChatInterface({ scenario, fileName, fileContent }) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStarting, setIsStarting] = useState(true)
  const [showSummary, setShowSummary] = useState(false)
  const [summary, setSummary] = useState('')
  const [apiMessages, setApiMessages] = useState([]) // 用于API调用的消息历史
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    startLearning()
  }, [])

  const startLearning = async () => {
    setIsStarting(true)
    try {
      const result = await generateScenario(fileContent, scenario)

      // 保存API消息历史
      setApiMessages([
        { role: 'system', content: result.systemPrompt },
        { role: 'assistant', content: result.response }
      ])

      setMessages([{
        role: 'assistant',
        content: result.response
      }])
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
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await continueChat(apiMessages, userMessage)

      // 更新API消息历史
      setApiMessages(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: response }
      ])

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response
      }])
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
      const result = await getSummary(apiMessages)
      setSummary(result)
    } catch (err) {
      console.error('获取摘要失败:', err)
      setSummary('获取学习摘要失败，请重试。')
    }
  }

  const scenarioNames = {
    workplace: '职场办公',
    campus: '校园学习',
    practice: '实操场景'
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 顶部信息栏 */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-cream-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-warm-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {fileName}
          </div>
          <span className="text-cream-300">|</span>
          <div className="flex items-center gap-2 text-sm text-warm-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {scenarioNames[scenario]}
          </div>
        </div>
        <button
          onClick={handleGetSummary}
          className="btn-secondary text-sm py-2 px-4"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            学习进度
          </span>
        </button>
      </div>

      {/* 对话区域 */}
      <div className="bg-cream-50 rounded-2xl border border-cream-200 overflow-hidden">
        <div className="h-[500px] overflow-y-auto p-6 space-y-6">
          {isStarting ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full border-3 border-warm-200 border-t-warm-600 animate-spin" />
                <p className="text-warm-500">正在创建学习场景...</p>
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
                  <div className={`chat-bubble ${message.role} p-4 shadow-soft`}>
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-cream-200">
                        <div className="w-6 h-6 rounded-full bg-warm-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-warm-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <span className="text-xs text-warm-400 font-medium">学习助手</span>
                      </div>
                    )}
                    <div className={`whitespace-pre-wrap leading-relaxed ${
                      message.role === 'user' ? 'text-cream-50' : 'text-warm-700'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
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
        <div className="border-t border-cream-200 p-4 bg-white">
          <div className="flex gap-3">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入你的回复，参与到对话中..."
              className="input-field flex-1 resize-none"
              rows={2}
              disabled={isLoading || isStarting}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading || isStarting}
              className="btn-primary self-end px-6"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-warm-400">
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
            className="px-4 py-2 text-sm bg-cream-100 text-warm-600 rounded-full hover:bg-cream-200 transition-colors"
            disabled={isLoading || isStarting}
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
              className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-warm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-cream-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-serif font-semibold text-warm-800">学习进度摘要</h3>
                  <button
                    onClick={() => setShowSummary(false)}
                    className="w-8 h-8 rounded-full hover:bg-cream-100 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-5 h-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {summary ? (
                  <div className="whitespace-pre-wrap text-warm-700 leading-relaxed">
                    {summary}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 rounded-full border-2 border-warm-200 border-t-warm-600 animate-spin" />
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
