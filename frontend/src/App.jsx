import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import UploadSection from './components/UploadSection'
import ScenarioSelector from './components/ScenarioSelector'
import ChatInterface from './components/ChatInterface'
import Header from './components/Header'
import HelpModal from './components/HelpModal'
import ChangelogModal from './components/ChangelogModal'

// localStorage keys
const STORAGE_KEYS = {
  DARK_MODE: 'wutongxue_dark_mode',
  HISTORY: 'wutongxue_history',
  SESSIONS: 'wutongxue_sessions'
}

function App() {
  const [step, setStep] = useState(1) // 1: 上传, 2: 选择场景, 3: 学习对话
  const [sessionId, setSessionId] = useState(null)
  const [fileName, setFileName] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [scenario, setScenario] = useState(null)
  const [currentModel, setCurrentModel] = useState('qwen-turbo')
  const [restoredMessages, setRestoredMessages] = useState(null) // 恢复的历史消息

  // 深色模式
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE)
    return saved ? JSON.parse(saved) : false
  })

  // 弹窗状态
  const [showHelp, setShowHelp] = useState(false)
  const [showChangelog, setShowChangelog] = useState(false)

  // 学习历史
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY)
    return saved ? JSON.parse(saved) : []
  })

  // 深色模式切换
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // ESC 键关闭弹窗
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowHelp(false)
        setShowChangelog(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleUploadSuccess = (data) => {
    setSessionId(data.sessionId)
    setFileName(data.fileName)
    setFileContent(data.content)
    setRestoredMessages(null) // 清除恢复的消息
    setStep(2)
  }

  const handleScenarioSelect = (selectedScenario) => {
    setScenario(selectedScenario)
  }

  // 保存会话数据
  const saveSession = (id, messages, apiMessages) => {
    try {
      const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '{}')
      sessions[id] = {
        messages,
        apiMessages,
        updatedAt: Date.now()
      }
      // 只保留最近10个会话的数据
      const sessionIds = Object.keys(sessions)
      if (sessionIds.length > 10) {
        const sortedIds = sessionIds.sort((a, b) => sessions[b].updatedAt - sessions[a].updatedAt)
        sortedIds.slice(10).forEach(id => delete sessions[id])
      }
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))
    } catch (err) {
      console.error('保存会话失败:', err)
    }
  }

  // 获取会话数据
  const getSession = (id) => {
    try {
      const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '{}')
      return sessions[id] || null
    } catch (err) {
      console.error('获取会话失败:', err)
      return null
    }
  }

  const handleStartLearning = () => {
    if (scenario) {
      setStep(3)
      // 保存到历史记录
      const newHistory = {
        id: sessionId,
        fileName,
        scenario,
        model: currentModel,
        timestamp: Date.now()
      }
      // 检查是否已存在相同ID的记录，如果存在则更新
      const existingIndex = history.findIndex(h => h.id === sessionId)
      let updatedHistory
      if (existingIndex >= 0) {
        updatedHistory = [...history]
        updatedHistory[existingIndex] = newHistory
        // 移到最前面
        updatedHistory.unshift(updatedHistory.splice(existingIndex, 1)[0])
      } else {
        updatedHistory = [newHistory, ...history] // 不限制历史记录数量
      }
      setHistory(updatedHistory)
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory))
    }
  }

  // 恢复历史会话
  const handleRestoreHistory = (historyItem) => {
    const session = getSession(historyItem.id)
    if (session && session.messages && session.messages.length > 0) {
      setSessionId(historyItem.id)
      setFileName(historyItem.fileName)
      setScenario(historyItem.scenario)
      setCurrentModel(historyItem.model)
      setRestoredMessages({
        messages: session.messages,
        apiMessages: session.apiMessages
      })
      setStep(3)
    } else {
      // 如果没有保存的会话数据，提示用户
      alert('该学习记录的对话内容已过期，请重新上传文件开始学习。')
    }
  }

  // 删除历史记录
  const handleDeleteHistory = (historyId) => {
    const updatedHistory = history.filter(h => h.id !== historyId)
    setHistory(updatedHistory)
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory))
    // 同时删除会话数据
    try {
      const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '{}')
      delete sessions[historyId]
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))
    } catch (err) {
      console.error('删除会话失败:', err)
    }
  }

  const handleReset = () => {
    setStep(1)
    setSessionId(null)
    setFileName('')
    setFileContent('')
    setScenario(null)
    setRestoredMessages(null)
  }

  const handleModelChange = (modelId) => {
    setCurrentModel(modelId)
  }

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode)
  }

  return (
    <div className={`min-h-screen bg-warm-50 dark:bg-warm-900 transition-colors`}>
      <Header
        step={step}
        onReset={handleReset}
        currentModel={currentModel}
        onModelChange={handleModelChange}
        darkMode={darkMode}
        onDarkModeToggle={handleDarkModeToggle}
        onShowHelp={() => setShowHelp(true)}
        onShowChangelog={() => setShowChangelog(true)}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* 进度指示器 */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    step >= s
                      ? 'bg-warm-700 dark:bg-warm-500 text-cream-50'
                      : 'bg-cream-200 dark:bg-warm-700 text-warm-400 dark:text-warm-500'
                  }`}
                >
                  {step > s ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s
                  )}
                </div>
                {s < 3 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 transition-all duration-300 ${
                    step > s ? 'bg-warm-700 dark:bg-warm-500' : 'bg-cream-200 dark:bg-warm-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 sm:gap-12 text-xs sm:text-sm text-warm-500 dark:text-warm-400">
            <span className={step >= 1 ? 'text-warm-700 dark:text-cream-200 font-medium' : ''}>上传知识</span>
            <span className={step >= 2 ? 'text-warm-700 dark:text-cream-200 font-medium' : ''}>选择场景</span>
            <span className={step >= 3 ? 'text-warm-700 dark:text-cream-200 font-medium' : ''}>沉浸学习</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <UploadSection
                onSuccess={handleUploadSuccess}
                history={history}
                onRestoreHistory={handleRestoreHistory}
                onDeleteHistory={handleDeleteHistory}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="scenario"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ScenarioSelector
                fileName={fileName}
                selectedScenario={scenario}
                onSelect={handleScenarioSelect}
                onStart={handleStartLearning}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ChatInterface
                sessionId={sessionId}
                scenario={scenario}
                fileName={fileName}
                fileContent={fileContent}
                model={currentModel}
                restoredMessages={restoredMessages}
                onSaveSession={saveSession}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 底部装饰 */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cream-300 via-warm-300 to-sage-300 dark:from-warm-700 dark:via-warm-600 dark:to-sage-700 opacity-50" />

      {/* 弹窗 */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <ChangelogModal isOpen={showChangelog} onClose={() => setShowChangelog(false)} />
    </div>
  )
}

export default App
