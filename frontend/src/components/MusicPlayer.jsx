import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 环境音效类型 - 使用本地音频文件
const AMBIENT_SOUNDS = [
  {
    id: 'rain',
    name: '雨声',
    icon: '🌧️',
    color: 'from-blue-400 to-cyan-500',
    file: '/sounds/rain.mp3'
  },
  {
    id: 'forest',
    name: '森林',
    icon: '🌲',
    color: 'from-green-400 to-emerald-500',
    file: '/sounds/forest.mp3'
  },
  {
    id: 'ocean',
    name: '海浪',
    icon: '🌊',
    color: 'from-cyan-400 to-blue-500',
    file: '/sounds/ocean.mp3'
  },
  {
    id: 'fire',
    name: '篝火',
    icon: '🔥',
    color: 'from-orange-400 to-red-500',
    file: '/sounds/fire.mp3'
  },
  {
    id: 'wind',
    name: '微风',
    icon: '🍃',
    color: 'from-teal-400 to-green-500',
    file: '/sounds/wind.mp3'
  },
  {
    id: 'cafe',
    name: '咖啡馆',
    icon: '☕',
    color: 'from-amber-400 to-orange-500',
    file: '/sounds/cafe.mp3'
  },
]

// 音频播放器
class AudioPlayer {
  constructor() {
    this.audio = null
    this.isPlaying = false
    this.currentSoundId = null
  }

  play(soundFile, soundId, volume = 0.5) {
    this.stop()

    this.audio = new Audio(soundFile)
    this.audio.loop = true
    this.audio.volume = volume

    this.audio.play().then(() => {
      this.isPlaying = true
      this.currentSoundId = soundId
    }).catch(err => {
      console.error('播放失败:', err)
      this.isPlaying = false
    })
  }

  stop() {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      this.audio = null
    }
    this.isPlaying = false
    this.currentSoundId = null
  }

  setVolume(volume) {
    if (this.audio) {
      this.audio.volume = volume
    }
  }
}

const audioPlayer = new AudioPlayer()

function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSound, setCurrentSound] = useState(null)
  const [volume, setVolume] = useState(0.5)

  const handlePlaySound = (sound) => {
    if (currentSound?.id === sound.id && isPlaying) {
      audioPlayer.stop()
      setIsPlaying(false)
      setCurrentSound(null)
    } else {
      audioPlayer.play(sound.file, sound.id, volume)
      setIsPlaying(true)
      setCurrentSound(sound)
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    audioPlayer.setVolume(newVolume)
  }

  const handleStop = () => {
    audioPlayer.stop()
    setIsPlaying(false)
    setCurrentSound(null)
  }

  // 组件卸载时停止播放
  useEffect(() => {
    return () => {
      audioPlayer.stop()
    }
  }, [])

  return (
    <div className="relative">
      {/* 音乐按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
          isPlaying
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/30'
            : 'bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300 hover:bg-cream-200 dark:hover:bg-warm-600'
        }`}
        title="环境音效"
      >
        {isPlaying ? (
          <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
          </svg>
        )}
      </button>

      {/* 音乐面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-12 w-72 bg-white dark:bg-warm-800 rounded-2xl shadow-warm border border-cream-200 dark:border-warm-700 p-4 z-50"
          >
            {/* 标题 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-warm-800 dark:text-cream-100">环境音效</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-full hover:bg-cream-100 dark:hover:bg-warm-700 flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* 当前播放 */}
            {currentSound && isPlaying && (
              <div className={`mb-4 p-3 rounded-xl bg-gradient-to-r ${currentSound.color} text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{currentSound.icon}</span>
                    <span className="font-medium">正在播放: {currentSound.name}</span>
                  </div>
                  <button
                    onClick={handleStop}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h12v12H6z"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* 音效选择 */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {AMBIENT_SOUNDS.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => handlePlaySound(sound)}
                  className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                    currentSound?.id === sound.id && isPlaying
                      ? `bg-gradient-to-r ${sound.color} text-white shadow-lg`
                      : 'bg-cream-50 dark:bg-warm-700 hover:bg-cream-100 dark:hover:bg-warm-600 text-warm-700 dark:text-warm-200'
                  }`}
                >
                  <span className="text-2xl">{sound.icon}</span>
                  <span className="text-xs font-medium">{sound.name}</span>
                </button>
              ))}
            </div>

            {/* 音量控制 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-warm-600 dark:text-warm-300">音量</span>
                <span className="text-warm-500 dark:text-warm-400">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-cream-200 dark:bg-warm-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* 提示 */}
            <p className="mt-3 text-xs text-warm-400 dark:text-warm-500 text-center">
              高品质环境音效，助你专注学习
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MusicPlayer
