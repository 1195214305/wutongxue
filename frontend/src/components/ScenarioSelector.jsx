import { motion } from 'framer-motion'

const scenarios = [
  {
    id: 'workplace',
    title: '职场办公',
    description: '同事之间的协作讲解，在工作场景中自然学习专业知识',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: 'warm'
  },
  {
    id: 'campus',
    title: '校园学习',
    description: '导师带教或同学讨论，重温校园时光的学习氛围',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    ),
    color: 'sage'
  },
  {
    id: 'practice',
    title: '实操场景',
    description: '现场问题解决，在实际操作中边做边学',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: 'terracotta'
  }
]

const colorClasses = {
  warm: {
    bg: 'bg-warm-50',
    icon: 'text-warm-500',
    border: 'border-warm-200',
    selected: 'bg-warm-100'
  },
  sage: {
    bg: 'bg-sage-50',
    icon: 'text-sage-500',
    border: 'border-sage-200',
    selected: 'bg-sage-100'
  },
  terracotta: {
    bg: 'bg-terracotta-50',
    icon: 'text-terracotta-500',
    border: 'border-terracotta-200',
    selected: 'bg-terracotta-100'
  }
}

function ScenarioSelector({ fileName, selectedScenario, onSelect, onStart, onStartImmersiveLearning }) {
  const handleScenarioClick = (scenarioId) => {
    onSelect(scenarioId)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cream-100 dark:bg-warm-800 rounded-full text-sm text-warm-600 dark:text-warm-300 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {fileName}
        </div>
        <h2 className="text-3xl font-serif font-semibold text-warm-800 dark:text-cream-100 mb-3">
          选择学习方式
        </h2>
        <p className="text-warm-500 dark:text-warm-400 text-lg">
          选择最适合你的学习模式
        </p>
      </div>

      {/* 沉浸式学习入口 - 放在最显眼的位置 */}
      {onStartImmersiveLearning && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div
            onClick={onStartImmersiveLearning}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-warm-600 via-warm-700 to-warm-800 dark:from-warm-500 dark:via-warm-600 dark:to-warm-700 p-6 cursor-pointer group hover:shadow-xl transition-all duration-300"
          >
            {/* 装饰性背景 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2" />

            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              {/* 图标 */}
              <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-cream-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>

              {/* 文字内容 */}
              <div className="flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full mb-3">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-cream-50 uppercase tracking-wide">推荐</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-cream-50 mb-2">
                  沉浸式学习模式
                </h3>
                <p className="text-cream-100/90 leading-relaxed mb-3">
                  AI 为你生成个性化课本，包含实时互动问题、章节测验、PPT讲解和思维导图
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {['个性化内容', '互动问题', '章节测验', 'PPT讲解', '思维导图'].map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-white/10 rounded-full text-xs text-cream-100">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 箭头 */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 group-hover:translate-x-1 transition-all duration-300">
                  <svg className="w-6 h-6 text-cream-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 分隔线 */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-cream-200 dark:bg-warm-700" />
        <span className="text-sm text-warm-400 dark:text-warm-500">或选择情景对话模式</span>
        <div className="flex-1 h-px bg-cream-200 dark:bg-warm-700" />
      </div>

      <div className="grid gap-4 mb-10">
        {scenarios.map((scenario, index) => {
          const colors = colorClasses[scenario.color]
          const isSelected = selectedScenario === scenario.id

          return (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`scenario-card p-6 cursor-pointer ${isSelected ? 'selected' : ''}`}
              onClick={() => handleScenarioClick(scenario.id)}
            >
              <div className="flex items-start gap-5">
                <div className={`w-14 h-14 rounded-xl ${colors.bg} dark:bg-opacity-20 ${colors.icon} flex items-center justify-center flex-shrink-0`}>
                  {scenario.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-warm-800 dark:text-cream-100">{scenario.title}</h3>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-warm-600 bg-warm-600 dark:border-warm-400 dark:bg-warm-400' : 'border-warm-300 dark:border-warm-600'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <p className="text-warm-500 dark:text-warm-400 mt-1">{scenario.description}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="text-center">
        <motion.button
          className="btn-primary px-10 py-3 text-lg"
          disabled={!selectedScenario}
          onClick={onStart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          开始情景对话
        </motion.button>
      </div>
    </div>
  )
}

export default ScenarioSelector
