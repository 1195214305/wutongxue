import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 环境音效类型 - 使用可靠的免费音频资源
// 音频来源: GitHub 托管的公共领域音频
const AMBIENT_SOUNDS = [
  {
    id: 'rain',
    name: '雨声',
    icon: '🌧️',
    color: 'from-blue-400 to-cyan-500',
  },
  {
    id: 'forest',
    name: '森林',
    icon: '🌲',
    color: 'from-green-400 to-emerald-500',
  },
  {
    id: 'ocean',
    name: '海浪',
    icon: '🌊',
    color: 'from-cyan-400 to-blue-500',
  },
  {
    id: 'fire',
    name: '篝火',
    icon: '🔥',
    color: 'from-orange-400 to-red-500',
  },
  {
    id: 'wind',
    name: '微风',
    icon: '🍃',
    color: 'from-teal-400 to-green-500',
  },
  {
    id: 'cafe',
    name: '咖啡馆',
    icon: '☕',
    color: 'from-amber-400 to-orange-500',
  },
]

// 使用 Web Audio API 生成高质量环境音效
class AmbientSoundGenerator {
  constructor() {
    this.audioContext = null
    this.masterGain = null
    this.nodes = []
    this.isPlaying = false
    this.currentSoundId = null
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.masterGain = this.audioContext.createGain()
      this.masterGain.connect(this.audioContext.destination)
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }
  }

  // 创建噪音缓冲区
  createNoiseBuffer(type = 'white', duration = 2) {
    const bufferSize = this.audioContext.sampleRate * duration
    const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)

      if (type === 'white') {
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1
        }
      } else if (type === 'pink') {
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
      } else if (type === 'brown') {
        let lastOut = 0
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1
          data[i] = (lastOut + (0.02 * white)) / 1.02
          lastOut = data[i]
          data[i] *= 3.5
        }
      }
    }
    return buffer
  }

  // 创建雨声效果
  createRainSound(volume) {
    // 主要雨声 - 粉红噪音 + 低通滤波
    const rainNoise = this.audioContext.createBufferSource()
    rainNoise.buffer = this.createNoiseBuffer('pink')
    rainNoise.loop = true

    const rainFilter = this.audioContext.createBiquadFilter()
    rainFilter.type = 'lowpass'
    rainFilter.frequency.value = 4000
    rainFilter.Q.value = 0.5

    const rainGain = this.audioContext.createGain()
    rainGain.gain.value = volume * 0.6

    rainNoise.connect(rainFilter)
    rainFilter.connect(rainGain)
    rainGain.connect(this.masterGain)
    rainNoise.start()

    // 雨滴声 - 高频点缀
    const dropsNoise = this.audioContext.createBufferSource()
    dropsNoise.buffer = this.createNoiseBuffer('white')
    dropsNoise.loop = true

    const dropsFilter = this.audioContext.createBiquadFilter()
    dropsFilter.type = 'highpass'
    dropsFilter.frequency.value = 3000

    const dropsGain = this.audioContext.createGain()
    dropsGain.gain.value = volume * 0.15

    dropsNoise.connect(dropsFilter)
    dropsFilter.connect(dropsGain)
    dropsGain.connect(this.masterGain)
    dropsNoise.start()

    this.nodes = [
      { source: rainNoise, gain: rainGain },
      { source: dropsNoise, gain: dropsGain }
    ]
  }

  // 创建森林声效果
  createForestSound(volume) {
    // 风吹树叶声
    const windNoise = this.audioContext.createBufferSource()
    windNoise.buffer = this.createNoiseBuffer('pink')
    windNoise.loop = true

    const windFilter = this.audioContext.createBiquadFilter()
    windFilter.type = 'bandpass'
    windFilter.frequency.value = 800
    windFilter.Q.value = 0.3

    const windGain = this.audioContext.createGain()
    windGain.gain.value = volume * 0.4

    windNoise.connect(windFilter)
    windFilter.connect(windGain)
    windGain.connect(this.masterGain)
    windNoise.start()

    // 鸟鸣模拟 - 高频调制
    const birdNoise = this.audioContext.createBufferSource()
    birdNoise.buffer = this.createNoiseBuffer('white')
    birdNoise.loop = true

    const birdFilter = this.audioContext.createBiquadFilter()
    birdFilter.type = 'bandpass'
    birdFilter.frequency.value = 3000
    birdFilter.Q.value = 5

    const birdGain = this.audioContext.createGain()
    birdGain.gain.value = volume * 0.08

    birdNoise.connect(birdFilter)
    birdFilter.connect(birdGain)
    birdGain.connect(this.masterGain)
    birdNoise.start()

    this.nodes = [
      { source: windNoise, gain: windGain },
      { source: birdNoise, gain: birdGain }
    ]
  }

  // 创建海浪声效果
  createOceanSound(volume) {
    // 海浪主体 - 棕色噪音
    const waveNoise = this.audioContext.createBufferSource()
    waveNoise.buffer = this.createNoiseBuffer('brown')
    waveNoise.loop = true

    const waveFilter = this.audioContext.createBiquadFilter()
    waveFilter.type = 'lowpass'
    waveFilter.frequency.value = 600
    waveFilter.Q.value = 0.2

    const waveGain = this.audioContext.createGain()
    waveGain.gain.value = volume * 0.7

    waveNoise.connect(waveFilter)
    waveFilter.connect(waveGain)
    waveGain.connect(this.masterGain)
    waveNoise.start()

    // 浪花声
    const foamNoise = this.audioContext.createBufferSource()
    foamNoise.buffer = this.createNoiseBuffer('white')
    foamNoise.loop = true

    const foamFilter = this.audioContext.createBiquadFilter()
    foamFilter.type = 'highpass'
    foamFilter.frequency.value = 2000

    const foamGain = this.audioContext.createGain()
    foamGain.gain.value = volume * 0.1

    foamNoise.connect(foamFilter)
    foamFilter.connect(foamGain)
    foamGain.connect(this.masterGain)
    foamNoise.start()

    this.nodes = [
      { source: waveNoise, gain: waveGain },
      { source: foamNoise, gain: foamGain }
    ]
  }

  // 创建篝火声效果
  createFireSound(volume) {
    // 火焰噼啪声
    const crackleNoise = this.audioContext.createBufferSource()
    crackleNoise.buffer = this.createNoiseBuffer('brown')
    crackleNoise.loop = true

    const crackleFilter = this.audioContext.createBiquadFilter()
    crackleFilter.type = 'lowpass'
    crackleFilter.frequency.value = 300
    crackleFilter.Q.value = 0.8

    const crackleGain = this.audioContext.createGain()
    crackleGain.gain.value = volume * 0.5

    crackleNoise.connect(crackleFilter)
    crackleFilter.connect(crackleGain)
    crackleGain.connect(this.masterGain)
    crackleNoise.start()

    // 火焰呼呼声
    const roarNoise = this.audioContext.createBufferSource()
    roarNoise.buffer = this.createNoiseBuffer('pink')
    roarNoise.loop = true

    const roarFilter = this.audioContext.createBiquadFilter()
    roarFilter.type = 'bandpass'
    roarFilter.frequency.value = 150
    roarFilter.Q.value = 0.5

    const roarGain = this.audioContext.createGain()
    roarGain.gain.value = volume * 0.3

    roarNoise.connect(roarFilter)
    roarFilter.connect(roarGain)
    roarGain.connect(this.masterGain)
    roarNoise.start()

    this.nodes = [
      { source: crackleNoise, gain: crackleGain },
      { source: roarNoise, gain: roarGain }
    ]
  }

  // 创建微风声效果
  createWindSound(volume) {
    // 主风声
    const windNoise = this.audioContext.createBufferSource()
    windNoise.buffer = this.createNoiseBuffer('pink')
    windNoise.loop = true

    const windFilter = this.audioContext.createBiquadFilter()
    windFilter.type = 'bandpass'
    windFilter.frequency.value = 500
    windFilter.Q.value = 0.2

    const windGain = this.audioContext.createGain()
    windGain.gain.value = volume * 0.5

    windNoise.connect(windFilter)
    windFilter.connect(windGain)
    windGain.connect(this.masterGain)
    windNoise.start()

    // 树叶沙沙声
    const leafNoise = this.audioContext.createBufferSource()
    leafNoise.buffer = this.createNoiseBuffer('white')
    leafNoise.loop = true

    const leafFilter = this.audioContext.createBiquadFilter()
    leafFilter.type = 'highpass'
    leafFilter.frequency.value = 1500

    const leafGain = this.audioContext.createGain()
    leafGain.gain.value = volume * 0.15

    leafNoise.connect(leafFilter)
    leafFilter.connect(leafGain)
    leafGain.connect(this.masterGain)
    leafNoise.start()

    this.nodes = [
      { source: windNoise, gain: windGain },
      { source: leafNoise, gain: leafGain }
    ]
  }

  // 创建咖啡馆声效果
  createCafeSound(volume) {
    // 人声嘈杂背景
    const chatterNoise = this.audioContext.createBufferSource()
    chatterNoise.buffer = this.createNoiseBuffer('pink')
    chatterNoise.loop = true

    const chatterFilter = this.audioContext.createBiquadFilter()
    chatterFilter.type = 'bandpass'
    chatterFilter.frequency.value = 1000
    chatterFilter.Q.value = 0.5

    const chatterGain = this.audioContext.createGain()
    chatterGain.gain.value = volume * 0.3

    chatterNoise.connect(chatterFilter)
    chatterFilter.connect(chatterGain)
    chatterGain.connect(this.masterGain)
    chatterNoise.start()

    // 杯碟声
    const clinkNoise = this.audioContext.createBufferSource()
    clinkNoise.buffer = this.createNoiseBuffer('white')
    clinkNoise.loop = true

    const clinkFilter = this.audioContext.createBiquadFilter()
    clinkFilter.type = 'highpass'
    clinkFilter.frequency.value = 4000

    const clinkGain = this.audioContext.createGain()
    clinkGain.gain.value = volume * 0.05

    clinkNoise.connect(clinkFilter)
    clinkFilter.connect(clinkGain)
    clinkGain.connect(this.masterGain)
    clinkNoise.start()

    this.nodes = [
      { source: chatterNoise, gain: chatterGain },
      { source: clinkNoise, gain: clinkGain }
    ]
  }

  play(soundId, volume = 0.5) {
    this.init()
    this.stop()

    this.masterGain.gain.value = 1

    switch (soundId) {
      case 'rain':
        this.createRainSound(volume)
        break
      case 'forest':
        this.createForestSound(volume)
        break
      case 'ocean':
        this.createOceanSound(volume)
        break
      case 'fire':
        this.createFireSound(volume)
        break
      case 'wind':
        this.createWindSound(volume)
        break
      case 'cafe':
        this.createCafeSound(volume)
        break
      default:
        this.createRainSound(volume)
    }

    this.isPlaying = true
    this.currentSoundId = soundId
  }

  stop() {
    this.nodes.forEach(node => {
      try {
        node.source.stop()
        node.source.disconnect()
        node.gain.disconnect()
      } catch (e) {}
    })
    this.nodes = []
    this.isPlaying = false
    this.currentSoundId = null
  }

  setVolume(volume) {
    this.nodes.forEach(node => {
      // 按比例调整各层音量
      const currentRatio = node.gain.gain.value / (this.lastVolume || 0.5)
      node.gain.gain.value = volume * currentRatio
    })
    this.lastVolume = volume
  }
}

const soundGenerator = new AmbientSoundGenerator()

function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSound, setCurrentSound] = useState(null)
  const [volume, setVolume] = useState(0.5)

  const handlePlaySound = (sound) => {
    if (currentSound?.id === sound.id && isPlaying) {
      soundGenerator.stop()
      setIsPlaying(false)
      setCurrentSound(null)
    } else {
      soundGenerator.play(sound.id, volume)
      setIsPlaying(true)
      setCurrentSound(sound)
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    soundGenerator.setVolume(newVolume)
  }

  const handleStop = () => {
    soundGenerator.stop()
    setIsPlaying(false)
    setCurrentSound(null)
  }

  // 组件卸载时停止播放
  useEffect(() => {
    return () => {
      soundGenerator.stop()
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
              使用 Web Audio API 生成，多层混合音效
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MusicPlayer
