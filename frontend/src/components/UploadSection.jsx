import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

function UploadSection({ onSuccess }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = async (file) => {
    setError('')
    setIsUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        onSuccess(response.data)
      }
    } catch (err) {
      setError(err.response?.data?.error || '上传失败，请重试')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif font-semibold text-warm-800 mb-3">
          开始你的学习之旅
        </h2>
        <p className="text-warm-500 text-lg">
          上传你想要学习的知识文件，我们将为你创造沉浸式的学习体验
        </p>
      </div>

      <motion.div
        className={`upload-zone rounded-2xl p-12 text-center cursor-pointer ${
          isDragging ? 'dragging' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".txt,.md,.pdf,.doc,.docx"
          onChange={handleFileSelect}
        />

        {isUploading ? (
          <div className="py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-warm-200 border-t-warm-600 animate-spin" />
            <p className="text-warm-600 font-medium">正在上传...</p>
          </div>
        ) : (
          <>
            {/* 上传图标 - SVG而非emoji */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-cream-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <p className="text-warm-700 font-medium text-lg mb-2">
              拖拽文件到这里，或点击选择
            </p>
            <p className="text-warm-400 text-sm">
              支持 TXT、Markdown、PDF、Word 格式
            </p>
          </>
        )}
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-terracotta-50 border border-terracotta-200 rounded-lg text-terracotta-600 text-sm text-center"
        >
          {error}
        </motion.div>
      )}

      {/* 特性说明 */}
      <div className="mt-12 grid grid-cols-3 gap-6">
        {[
          {
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            ),
            title: '情景对话',
            desc: '通过人物对话自然学习'
          },
          {
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            ),
            title: '沉浸体验',
            desc: '身临其境掌握知识'
          },
          {
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            ),
            title: '高效记忆',
            desc: '告别枯燥的死记硬背'
          }
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center p-4"
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-sage-50 text-sage-500 flex items-center justify-center">
              {item.icon}
            </div>
            <h3 className="font-medium text-warm-700 mb-1">{item.title}</h3>
            <p className="text-sm text-warm-400">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default UploadSection
