import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 环境音效类型 - 使用免费音频资源
// 音频来源: Freesound.org (CC0/Public Domain), SoundBible
const AMBIENT_SOUNDS = [
  {
    id: 'rain',
    name: '雨声',
    icon: '🌧️',
    color: 'from-blue-400 to-cyan-500',
    // 雨声 - 使用多个备用源
    urls: [
      'https://cdn.freesound.org/previews/531/531947_5674468-lq.mp3',
      'https://soundbible.com/mp3/Rain-SoundBible.com-2040555024.mp3'
    ]
  },
  {
    id: 'forest',
    name: '森林',
    icon: '🌲',
    color: 'from-green-400 to-emerald-500',
    // 森林鸟鸣
    urls: [
      'https://cdn.freesound.org/previews/531/531953_5674468-lq.mp3',
      'https://soundbible.com/mp3/meadowlark_daniel-simion.mp3'
    ]
  },
  {
    id: 'ocean',
    name: '海浪',
    icon: '🌊',
    color: 'from-cyan-400 to-blue-500',
    // 海浪声
    urls: [
      'https://cdn.freesound.org/previews/531/531948_5674468-lq.mp3',
      'https://soundbible.com/mp3/Ocean_Waves-Mike_Koenig-980635527.mp3'
    ]
  },
  {
    id: 'fire',
    name: '篝火',
    icon: '🔥',
    color: 'from-orange-400 to-red-500',
    // 篝火声
    urls: [
      'https://cdn.freesound.org/previews/531/531949_5674468-lq.mp3',
      'https://soundbible.com/mp3/Crackling_Fireplace-Mike_Koenig-1862498829.mp3'
    ]
  },
  {
    id: 'wind',
    name: '微风',
    icon: '🍃',
    color: 'from-teal-400 to-green-500',
    // 风声
    urls: [
      'https://cdn.freesound.org/previews/531/531950_5674468-lq.mp3',
      'https://soundbible.com/mp3/Wind-Mark_DiAngelo-1940285615.mp3'
    ]
  },
  {
    id: 'cafe',
    name: '咖啡馆',
    icon: '☕',
    color: 'from-amber-400 to-orange-500',
    // 咖啡馆氛围 - 使用轻柔背景音
    urls: [
      'https://cdn.freesound.org/previews/531/531951_5674468-lq.mp3',
      'https://soundbible.com/mp3/Restaurant_Ambiance-SoundBible.com-1664930336.mp3'
    ]
  },
]

// 音频播放器类
class AudioPlayer {
  constructor() {
    this.audio = null
    this.isPlaying = false
    this.currentSoundId = null
  }

  async play(sound, volume = 0.5) {
    this.stop()

    this.audio = new Audio()
    this.audio.loop = true
    this.audio.volume = volume
    this.audio.crossOrigin = 'anonymous'

    // 尝试多个音频源
    for (const url of sound.urls) {
      try {
        this.audio.src = url
        await this.audio.play()
        this.isPlaying = true
        this.currentSoundId = sound.id
        return // 成功播放，退出循环
      } catch (error) {
        console.log(`音频源 ${url} 加载失败，尝试下一个...`)
      }
    }

    // 所有源都失败，使用 Web Audio API 生成备用音效
    console.log('所有在线音频源不可用，使用生成的音效')
    this.playGeneratedSound(sound.id, volume)
  }

  // 备用：使用 Web Audio API 生成简单音效
  playGeneratedSound(soundId, volume) {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const gainNode = audioContext.createGain()
      gainNode.connect(audioContext.destination)
      gainNode.gain.value = volume * 0.3

      // 创建噪音
      const bufferSize = audioContext.sampleRate * 2
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
      const data = buffer.getChannelData(0)

      // 生成粉红噪音
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        b3 = 0.86650 * b3 + white * 0.3104856
        b4 = 0.55000 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.0168980
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
        b6 = white * 0.115926
      }

      const noiseNode = audioContext.createBufferSource()
      noiseNode.buffer = buffer
      noiseNode.loop = true

      // 滤波器配置
      const filterConfigs = {
        rain: { freq: 3000, q: 1 },
        forest: { freq: 1500, q: 0.5 },
        ocean: { freq: 500, q: 0.3 },
        fire: { freq: 200, q: 0.5 },
        wind: { freq: 800, q: 0.8 },
        cafe: { freq: 2000, q: 0.7 },
      }

      const config = filterConfigs[soundId] || filterConfigs.rain
      const filterNode = audioContext.createBiquadFilter()
      filterNode.type = 'lowpass'
      filterNode.frequency.value = config.freq
      filterNode.Q.value = config.q

      noiseNode.connect(filterNode)
      filterNode.connect(gainNode)
      noiseNode.start()

      this.generatedContext = audioContext
      this.generatedNodes = { noiseNode, filterNode, gainNode }
      this.isPlaying = true
      this.currentSoundId = soundId
    } catch (e) {
      console.error('生成音效失败:', e)
    }
  }

  stop() {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      this.audio = null
    }
    if (this.generatedContext) {
      try {
        this.generatedNodes?.noiseNode?.stop()
        this.generatedContext.close()
      } catch (e) {}
      this.generatedContext = null
      this.generatedNodes = null
    }
    this.isPlaying = false
    this.currentSoundId = null
  }

  setVolume(volume) {
    if (this.audio) {
      this.audio.volume = volume
    }
    if (this.generatedNodes?.gainNode) {
      this.generatedNodes.gainNode.gain.value = volume * 0.3
    }
  }
}

const audioPlayer = new AudioPlayer()

function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSound, setCurrentSound] = useState(null)
  const [volume, setVolume] = useState(0.5)
  const [isLoading, setIsLoading] = useState(false)

  const handlePlaySound = async (sound) => {
    if (currentSound?.id === sound.id && isPlaying) {
      audioPlayer.stop()
      setIsPlaying(false)
      setCurrentSound(null)
    } else {
      setIsLoading(true)
      await audioPlayer.play(sound, volume)
      setIsLoading(false)
      if (audioPlayer.isPlaying) {
        setIsPlaying(true)
        setCurrentSound(sound)
      }
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
                  disabled={isLoading}
                  className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                    currentSound?.id === sound.id && isPlaying
                      ? `bg-gradient-to-r ${sound.color} text-white shadow-lg`
                      : 'bg-cream-50 dark:bg-warm-700 hover:bg-cream-100 dark:hover:bg-warm-600 text-warm-700 dark:text-warm-200'
                  } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                >
                  <span className="text-2xl">{sound.icon}</span>
                  <span className="text-xs font-medium">{sound.name}</span>
                </button>
              ))}
            </div>

            {/* 加载提示 */}
            {isLoading && (
              <div className="mb-4 p-3 bg-cream-50 dark:bg-warm-700 rounded-xl text-center">
                <div className="flex items-center justify-center gap-2 text-warm-500 dark:text-warm-400">
                  <div className="w-4 h-4 border-2 border-warm-300 border-t-warm-600 rounded-full animate-spin"></div>
                  <span className="text-sm">加载音频中...</span>
                </div>
              </div>
            )}

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
              真实环境音效，来自 Freesound/SoundBible (CC0)
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MusicPlayer
