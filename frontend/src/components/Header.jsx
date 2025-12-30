import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import MusicPlayer from './MusicPlayer'
import PomodoroTimer from './PomodoroTimer'
import SettingsPanel from './SettingsPanel'

// 模型分组配置
const MODEL_GROUPS = {
  qwen: {
    name: '通义千问',
    desc: '阿里云大模型',
    models: [
      { id: 'qwen-turbo', name: 'Qwen Turbo', desc: '快速响应，适合日常学习' },
      { id: 'qwen-max', name: 'Qwen Max', desc: '更强理解力，适合复杂内容' }
    ]
  },
  cpass_cc_special: {
    name: 'Claude 系列',
    desc: 'CC特价分组 - 需配置API Key',
    requiresKey: true,
    keyStorageKey: 'cpass_cc_special_key',
    models: [
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', desc: '快速高效，性价比最高' },
      { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', desc: '平衡性能与速度' },
      { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5', desc: '最强性能，深度理解' }
    ]
  },
  cpass_codex: {
    name: 'GPT 系列',
    desc: 'Codex分组 - 需配置API Key',
    requiresKey: true,
    keyStorageKey: 'cpass_codex_key',
    models: [
      { id: 'gpt-5.1-thinking', name: 'GPT-5.1 Thinking', desc: '深度思考，适合复杂分析' },
      { id: 'gpt-5.2', name: 'GPT-5.2', desc: '最新版本，全能型' }
    ]
  }
}

// 获取所有模型的扁平列表
const getAllModels = () => {
  const models = []
  Object.entries(MODEL_GROUPS).forEach(([groupId, group]) => {
    group.models.forEach(model => {
      models.push({ ...model, groupId, groupName: group.name, requiresKey: group.requiresKey, keyStorageKey: group.keyStorageKey })
    })
  })
  return models
}

const ALL_MODELS = getAllModels()

function Header({ step, onReset, currentModel, onModelChange, darkMode, onDarkModeToggle, onShowHelp, onShowChangelog, onShowAuth, fontSize, onFontSizeChange, onShowChangePassword }) {
  const [showModelMenu, setShowModelMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [pendingModel, setPendingModel] = useState(null)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [apiKeyGroup, setApiKeyGroup] = useState(null)
  const modelMenuRef = useRef(null)
  const userMenuRef = useRef(null)

  const { user, isAuthenticated, logout } = useAuth()

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target)) {
        setShowModelMenu(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentModelInfo = ALL_MODELS.find(m => m.id === currentModel) || ALL_MODELS[0]

  // 处理模型选择
  const handleModelSelect = (model) => {
    if (model.requiresKey) {
      // 检查是否已配置 API Key
      const savedKey = localStorage.getItem(model.keyStorageKey)
      if (!savedKey) {
        // 需要配置 API Key
        setPendingModel(model)
        setApiKeyGroup(model.groupId)
        setApiKeyInput('')
        setShowApiKeyModal(true)
        setShowModelMenu(false)
        return
      }
    }
    onModelChange(model.id)
    setShowModelMenu(false)
  }

  // 保存 API Key 并切换模型
  const handleSaveApiKey = () => {
    if (apiKeyInput.trim() && pendingModel) {
      localStorage.setItem(pendingModel.keyStorageKey, apiKeyInput.trim())
      onModelChange(pendingModel.id)
      setShowApiKeyModal(false)
      setPendingModel(null)
      setApiKeyInput('')
      setApiKeyGroup(null)
    }
  }

  // 获取模型的显示名称（简短版）
  const getShortModelName = (modelId) => {
    if (modelId.startsWith('qwen')) return modelId === 'qwen-turbo' ? 'Turbo' : 'Max'
    if (modelId.startsWith('claude')) {
      if (modelId.includes('haiku')) return 'Haiku'
      if (modelId.includes('sonnet')) return 'Sonnet'
      if (modelId.includes('opus')) return 'Opus'
    }
    if (modelId.startsWith('gpt')) {
      if (modelId.includes('5.1')) return 'GPT-5.1'
      if (modelId.includes('5.2')) return 'GPT-5.2'
    }
    return modelId
  }

  return (
    <>
    <header className="border-b border-cream-200 dark:border-warm-700 bg-cream-50/80 dark:bg-warm-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer"
            onClick={onReset}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Logo */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-warm-500 to-warm-700 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-cream-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-serif font-semibold text-warm-800 dark:text-cream-100">无痛学</h1>
              <p className="text-xs text-warm-400 dark:text-warm-500 hidden sm:block">沉浸式情景学习</p>
            </div>
          </motion.div>

          <nav className="flex items-center gap-1 sm:gap-2">
            {/* 帮助按钮 */}
            <button
              onClick={onShowHelp}
              className="p-2 rounded-lg hover:bg-cream-100 dark:hover:bg-warm-800 transition-colors"
              title="帮助"
            >
              <svg className="w-5 h-5 text-warm-500 dark:text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* 更新记录按钮 */}
            <button
              onClick={onShowChangelog}
              className="p-2 rounded-lg hover:bg-cream-100 dark:hover:bg-warm-800 transition-colors"
              title="更新记录"
            >
              <svg className="w-5 h-5 text-warm-500 dark:text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </button>

            {/* 环境音效播放器 */}
            <MusicPlayer />

            {/* 番茄钟计时器 */}
            <PomodoroTimer />

            {/* 设置面板 */}
            <SettingsPanel fontSize={fontSize} onFontSizeChange={onFontSizeChange} />

            {/* 深色模式切换 */}
            <button
              id="dark-mode-toggle"
              onClick={onDarkModeToggle}
              className="p-2 rounded-lg hover:bg-cream-100 dark:hover:bg-warm-800 transition-colors"
              title={darkMode ? '切换到浅色模式' : '切换到深色模式'}
            >
              {darkMode ? (
                <svg className="w-5 h-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-warm-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* 模型切换 */}
            <div className="relative" ref={modelMenuRef} id="model-switcher">
              <button
                onClick={() => setShowModelMenu(!showModelMenu)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg bg-cream-100 dark:bg-warm-800 hover:bg-cream-200 dark:hover:bg-warm-700 transition-colors text-sm"
              >
                <svg className="w-4 h-4 text-warm-500 dark:text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-warm-700 dark:text-cream-200 font-medium hidden sm:inline">{currentModelInfo.name}</span>
                <span className="text-warm-700 dark:text-cream-200 font-medium sm:hidden">{getShortModelName(currentModel)}</span>
                <svg className={`w-4 h-4 text-warm-400 transition-transform ${showModelMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {showModelMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-warm-800 rounded-xl shadow-warm border border-cream-200 dark:border-warm-700 overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
                  >
                    {Object.entries(MODEL_GROUPS).map(([groupId, group], groupIndex) => (
                      <div key={groupId}>
                        {groupIndex > 0 && <div className="border-t border-cream-200 dark:border-warm-700" />}
                        <div className="px-3 py-2 bg-cream-50 dark:bg-warm-900">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-warm-600 dark:text-warm-300 uppercase tracking-wide">{group.name}</span>
                            {group.requiresKey && (
                              <span className="text-xs px-1.5 py-0.5 bg-warm-200 dark:bg-warm-700 text-warm-600 dark:text-warm-300 rounded">需API Key</span>
                            )}
                          </div>
                          <p className="text-xs text-warm-400 dark:text-warm-500 mt-0.5">{group.desc}</p>
                        </div>
                        <div className="p-2">
                          {group.models.map((model) => {
                            const fullModel = { ...model, groupId, requiresKey: group.requiresKey, keyStorageKey: group.keyStorageKey }
                            const hasKey = !group.requiresKey || localStorage.getItem(group.keyStorageKey)
                            return (
                              <button
                                key={model.id}
                                onClick={() => handleModelSelect(fullModel)}
                                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                                  currentModel === model.id
                                    ? 'bg-warm-100 dark:bg-warm-700 text-warm-800 dark:text-cream-100'
                                    : 'hover:bg-cream-50 dark:hover:bg-warm-700/50 text-warm-600 dark:text-warm-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{model.name}</span>
                                    {group.requiresKey && !hasKey && (
                                      <svg className="w-4 h-4 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                      </svg>
                                    )}
                                  </div>
                                  {currentModel === model.id && (
                                    <svg className="w-4 h-4 text-warm-600 dark:text-warm-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <p className="text-xs text-warm-400 dark:text-warm-500 mt-0.5">{model.desc}</p>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                    <div className="px-3 py-2 bg-cream-50 dark:bg-warm-900 border-t border-cream-200 dark:border-warm-700">
                      <p className="text-xs text-warm-400 dark:text-warm-500">
                        Claude/GPT 模型需要配置 Cpass.cc API Key
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 用户菜单 */}
            <div className="relative" ref={userMenuRef} id="user-menu">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg bg-sage-100 dark:bg-sage-900/30 hover:bg-sage-200 dark:hover:bg-sage-900/50 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-sage-500 dark:bg-sage-600 flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        {(user?.nickname || user?.username || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-sage-700 dark:text-sage-300 font-medium hidden sm:inline max-w-[80px] truncate">
                      {user?.nickname || user?.username}
                    </span>
                    <svg className={`w-4 h-4 text-sage-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-warm-800 rounded-xl shadow-warm border border-cream-200 dark:border-warm-700 overflow-hidden z-50"
                      >
                        <div className="p-3 border-b border-cream-200 dark:border-warm-700">
                          <p className="text-sm font-medium text-warm-800 dark:text-cream-100 truncate">
                            {user?.nickname || user?.username}
                          </p>
                          <p className="text-xs text-warm-400 dark:text-warm-500 mt-0.5">
                            已登录
                          </p>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={() => {
                              onShowChangePassword && onShowChangePassword()
                              setShowUserMenu(false)
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-cream-50 dark:hover:bg-warm-700/50 text-warm-600 dark:text-warm-300 text-sm flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            修改密码
                          </button>
                          <button
                            onClick={() => {
                              logout()
                              setShowUserMenu(false)
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-cream-50 dark:hover:bg-warm-700/50 text-warm-600 dark:text-warm-300 text-sm flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            退出登录
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <button
                  onClick={() => onShowAuth && onShowAuth('login')}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg bg-warm-700 hover:bg-warm-800 dark:bg-warm-600 dark:hover:bg-warm-500 transition-colors text-sm"
                >
                  <svg className="w-4 h-4 text-cream-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-cream-50 font-medium hidden sm:inline">登录</span>
                </button>
              )}
            </div>

            {step > 1 && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={onReset}
                className="hidden sm:flex text-sm text-warm-500 dark:text-warm-400 hover:text-warm-700 dark:hover:text-warm-300 transition-colors items-center gap-1 ml-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                重新开始
              </motion.button>
            )}
          </nav>
        </div>
      </div>
    </header>

      {/* API Key 配置模态框 */}
      <AnimatePresence>
        {showApiKeyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowApiKeyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-warm-800 rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-warm-100 dark:bg-warm-700 flex items-center justify-center">
                  <svg className="w-5 h-5 text-warm-600 dark:text-warm-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-warm-800 dark:text-cream-100">配置 API Key</h3>
                  <p className="text-sm text-warm-500 dark:text-warm-400">
                    {apiKeyGroup === 'cpass_cc_special' ? 'Claude 系列 (CC特价分组)' : 'GPT 系列 (Codex分组)'}
                  </p>
                </div>
              </div>

              <div className="mb-4 p-3 bg-cream-50 dark:bg-warm-900 rounded-lg">
                <p className="text-xs text-warm-600 dark:text-warm-300 mb-2">
                  <strong>获取 API Key：</strong>
                </p>
                <p className="text-xs text-warm-500 dark:text-warm-400">
                  访问 <a href="https://api.cpass.cc" target="_blank" rel="noopener noreferrer" className="text-warm-700 dark:text-warm-300 underline">api.cpass.cc</a> 获取对应分组的 API Key
                </p>
                <p className="text-xs text-warm-400 dark:text-warm-500 mt-1">
                  {apiKeyGroup === 'cpass_cc_special'
                    ? '支持模型：Claude Haiku/Sonnet/Opus 4.5'
                    : '支持模型：GPT-5.1 Thinking, GPT-5.2'}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-warm-700 dark:text-cream-200 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-4 py-3 bg-cream-50 dark:bg-warm-900 border border-cream-200 dark:border-warm-700 rounded-xl text-warm-800 dark:text-cream-100 placeholder-warm-400 dark:placeholder-warm-500 focus:outline-none focus:ring-2 focus:ring-warm-500 dark:focus:ring-warm-400"
                />
                <p className="text-xs text-warm-400 dark:text-warm-500 mt-2">
                  Key 将保存在浏览器本地，不会上传到服务器
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="flex-1 px-4 py-2.5 bg-cream-100 dark:bg-warm-700 text-warm-700 dark:text-cream-200 rounded-xl font-medium hover:bg-cream-200 dark:hover:bg-warm-600 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveApiKey}
                  disabled={!apiKeyInput.trim()}
                  className="flex-1 px-4 py-2.5 bg-warm-700 dark:bg-warm-600 text-cream-50 rounded-xl font-medium hover:bg-warm-800 dark:hover:bg-warm-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存并使用
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Header
