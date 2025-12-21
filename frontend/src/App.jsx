import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import UploadSection from './components/UploadSection'
import ScenarioSelector from './components/ScenarioSelector'
import ChatInterface from './components/ChatInterface'
import Header from './components/Header'

function App() {
  const [step, setStep] = useState(1) // 1: 上传, 2: 选择场景, 3: 学习对话
  const [sessionId, setSessionId] = useState(null)
  const [fileName, setFileName] = useState('')
  const [fileContent, setFileContent] = useState('') // 新增：存储文件内容
  const [scenario, setScenario] = useState(null)

  const handleUploadSuccess = (data) => {
    setSessionId(data.sessionId)
    setFileName(data.fileName)
    setFileContent(data.content) // 保存文件内容
    setStep(2)
  }

  const handleScenarioSelect = (selectedScenario) => {
    setScenario(selectedScenario)
  }

  const handleStartLearning = () => {
    if (scenario) {
      setStep(3)
    }
  }

  const handleReset = () => {
    setStep(1)
    setSessionId(null)
    setFileName('')
    setFileContent('')
    setScenario(null)
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <Header step={step} onReset={handleReset} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* 进度指示器 */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    step >= s
                      ? 'bg-warm-700 text-cream-50'
                      : 'bg-cream-200 text-warm-400'
                  }`}
                >
                  {step > s ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s
                  )}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-0.5 mx-2 transition-all duration-300 ${
                    step > s ? 'bg-warm-700' : 'bg-cream-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-12 text-sm text-warm-500">
            <span className={step >= 1 ? 'text-warm-700 font-medium' : ''}>上传知识</span>
            <span className={step >= 2 ? 'text-warm-700 font-medium' : ''}>选择场景</span>
            <span className={step >= 3 ? 'text-warm-700 font-medium' : ''}>沉浸学习</span>
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
              <UploadSection onSuccess={handleUploadSuccess} />
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
                scenario={scenario}
                fileName={fileName}
                fileContent={fileContent}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 底部装饰 */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cream-300 via-warm-300 to-sage-300 opacity-50" />
    </div>
  )
}

export default App
