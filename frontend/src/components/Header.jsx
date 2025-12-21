import { motion } from 'framer-motion'

function Header({ step, onReset }) {
  return (
    <header className="border-b border-cream-200 bg-cream-50/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            onClick={onReset}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Logo - 使用SVG而非emoji */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-warm-500 to-warm-700 flex items-center justify-center">
              <svg className="w-6 h-6 text-cream-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold text-warm-800">无痛学</h1>
              <p className="text-xs text-warm-400">沉浸式情景学习</p>
            </div>
          </motion.div>

          <nav className="flex items-center gap-6">
            {step > 1 && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={onReset}
                className="text-sm text-warm-500 hover:text-warm-700 transition-colors flex items-center gap-1"
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
  )
}

export default Header
