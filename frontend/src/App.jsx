import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import UploadSection from './components/UploadSection'
import ScenarioSelector from './components/ScenarioSelector'
import ChatInterface from './components/ChatInterface'
import Header from './components/Header'
import HelpModal from './components/HelpModal'
import ChangelogModal from './components/ChangelogModal'
import AuthModal from './components/AuthModal'
import UserTour from './components/UserTour'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// localStorage keys
const STORAGE_KEYS = {
  DARK_MODE: 'wutongxue_dark_mode',
  HISTORY: 'wutongxue_history',
  SESSIONS: 'wutongxue_sessions'
}

const API_BASE = import.meta.env.VITE_API_BASE || 'https://wutongxue-backend.onrender.com'

function AppContent() {
  const [step, setStep] = useState(1) // 1: 上传, 2: 选择场景, 3: 学习对话
  const [sessionId, setSessionId] = useState(null)
  const [fileName, setFileName] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [scenario, setScenario] = useState(null)
  const [currentModel, setCurrentModel] = useState('qwen-turbo')
  const [restoredMessages, setRestoredMessages] = useState(null) // 恢复的历史消息

  const { user, token, isAuthenticated } = useAuth()

  // 深色模式
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE)
    return saved ? JSON.parse(saved) : false
  })

  // 弹窗状态
  const [showHelp, setShowHelp] = useState(false)
  const [showChangelog, setShowChangelog] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  // 学习历史（本地 + 云端）
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY)
    return saved ? JSON.parse(saved) : []
  })

  // 从服务器获取历史记录
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchCloudHistory()
    }
  }, [isAuthenticated, token])

  const fetchCloudHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        // 转换服务器数据格式
        const cloudHistory = data.history.map(item => ({
          id: item.id,
          fileName: item.file_name,
          scenario: item.scenario,
          model: item.model,
          timestamp: item.updated_at,
          isCloud: true
        }))
        setHistory(cloudHistory)
      }
    } catch (error) {
      console.error('获取云端历史记录失败:', error)
    }
  }

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
        setShowAuth(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleUploadSuccess = async (data) => {
    setFileName(data.fileName)
    setFileContent(data.content)
    setRestoredMessages(null)

    // 如果用户已登录，创建云端会话
    if (isAuthenticated && token) {
      try {
        const response = await fetch(`${API_BASE}/api/session/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            fileName: data.fileName,
            fileContent: data.content,
            model: currentModel
          })
        })
        if (response.ok) {
          const result = await response.json()
          setSessionId(result.sessionId)
        } else {
          setSessionId(data.sessionId)
        }
      } catch (error) {
        console.error('创建云端会话失败:', error)
        setSessionId(data.sessionId)
      }
    } else {
      setSessionId(data.sessionId)
    }

    setStep(2)
  }

  const handleScenarioSelect = (selectedScenario) => {
    setScenario(selectedScenario)
  }

  // 保存会话数据（本地）
  const saveSession = (id, messages, apiMessages) => {
    // 如果已登录，数据会自动保存到云端，不需要本地保存
    if (isAuthenticated) return

    try {
      const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '{}')
      sessions[id] = {
        messages,
        apiMessages,
        updatedAt: Date.now()
      }
      // 保留最近20个会话的数据
      const sessionIds = Object.keys(sessions)
      if (sessionIds.length > 20) {
        const sortedIds = sessionIds.sort((a, b) => sessions[b].updatedAt - sessions[a].updatedAt)
        sortedIds.slice(20).forEach(id => delete sessions[id])
      }
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))
    } catch (err) {
      console.error('保存会话失败:', err)
    }
  }

  // 获取会话数据
  const getSession = async (id, isCloud) => {
    if (isCloud && isAuthenticated && token) {
      try {
        const response = await fetch(`${API_BASE}/api/session/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          return {
            messages: data.session.messages.filter(m => m.role !== 'system').map(m => ({
              type: m.role === 'user' ? 'user' : 'assistant',
              content: m.content
            })),
            apiMessages: data.session.messages,
            fileContent: data.session.file_content
          }
        }
      } catch (error) {
        console.error('获取云端会话失败:', error)
      }
      return null
    }

    // 本地会话
    try {
      const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS) || '{}')
      return sessions[id] || null
    } catch (err) {
      console.error('获取会话失败:', err)
      return null
    }
  }

  const handleStartLearning = async () => {
    if (scenario) {
      // 更新云端会话的场景
      if (isAuthenticated && token && sessionId) {
        try {
          await fetch(`${API_BASE}/api/session/create`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              fileName,
              fileContent,
              scenario,
              model: currentModel
            })
          })
        } catch (error) {
          console.error('更新会话场景失败:', error)
        }
      }

      setStep(3)

      // 保存到本地历史记录（未登录用户）
      if (!isAuthenticated) {
        const newHistory = {
          id: sessionId,
          fileName,
          scenario,
          model: currentModel,
          timestamp: Date.now()
        }
        const existingIndex = history.findIndex(h => h.id === sessionId)
        let updatedHistory
        if (existingIndex >= 0) {
          updatedHistory = [...history]
          updatedHistory[existingIndex] = newHistory
          updatedHistory.unshift(updatedHistory.splice(existingIndex, 1)[0])
        } else {
          updatedHistory = [newHistory, ...history]
        }
        setHistory(updatedHistory)
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory))
      } else {
        // 刷新云端历史
        fetchCloudHistory()
      }
    }
  }

  // 恢复历史会话
  const handleRestoreHistory = async (historyItem) => {
    const session = await getSession(historyItem.id, historyItem.isCloud)
    if (session && session.messages && session.messages.length > 0) {
      setSessionId(historyItem.id)
      setFileName(historyItem.fileName)
      setScenario(historyItem.scenario)
      setCurrentModel(historyItem.model)
      setFileContent(session.fileContent || '')
      setRestoredMessages({
        messages: session.messages,
        apiMessages: session.apiMessages
      })
      setStep(3)
    } else {
      alert('该学习记录的对话内容已过期，请重新上传文件开始学习。')
    }
  }

  // 删除历史记录
  const handleDeleteHistory = async (historyId, isCloud) => {
    if (isCloud && isAuthenticated && token) {
      try {
        await fetch(`${API_BASE}/api/history/${historyId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        fetchCloudHistory()
      } catch (error) {
        console.error('删除云端历史记录失败:', error)
      }
    } else {
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

  const handleShowAuth = (mode = 'login') => {
    setAuthMode(mode)
    setShowAuth(true)
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
        onShowAuth={handleShowAuth}
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

      {/* 底部 GitHub 链接 */}
      <div className="fixed bottom-4 left-4 z-40">
        <a
          href="https://github.com/1195214305/wutongxue"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-warm-800/80 backdrop-blur-sm rounded-full shadow-sm border border-cream-200 dark:border-warm-700 text-warm-600 dark:text-warm-300 hover:text-warm-800 dark:hover:text-cream-100 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
          <span>GitHub</span>
        </a>
      </div>

      {/* 底部装饰 */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cream-300 via-warm-300 to-sage-300 dark:from-warm-700 dark:via-warm-600 dark:to-sage-700 opacity-50" />

      {/* 弹窗 */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <ChangelogModal isOpen={showChangelog} onClose={() => setShowChangelog(false)} />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} initialMode={authMode} />

      {/* 新用户引导 */}
      <UserTour />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
