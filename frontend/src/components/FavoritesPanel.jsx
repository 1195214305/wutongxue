import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://wutongxue-backend.onrender.com'

function FavoritesPanel({ isOpen, onClose }) {
  const { token, isAuthenticated } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  // 加载收藏
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchFavorites()
    }
  }, [isOpen, isAuthenticated])

  const fetchFavorites = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites.map(f => ({
          id: f.id,
          content: f.content,
          sessionId: f.session_id,
          fileName: f.file_name,
          tag: f.tag,
          createdAt: f.created_at
        })))
      }
    } catch (error) {
      console.error('获取收藏失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 删除收藏
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/favorites/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        setFavorites(favorites.filter(f => f.id !== id))
      }
    } catch (error) {
      console.error('删除收藏失败:', error)
    }
  }

  // 更新标签
  const handleUpdateTag = async (id, tag) => {
    try {
      const response = await fetch(`${API_BASE}/api/favorites/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tag })
      })
      if (response.ok) {
        setFavorites(favorites.map(f =>
          f.id === id ? { ...f, tag } : f
        ))
      }
    } catch (error) {
      console.error('更新标签失败:', error)
    }
  }

  // 获取所有标签
  const allTags = [...new Set(favorites.map(f => f.tag).filter(Boolean))]

  // 筛选收藏
  const filteredFavorites = favorites.filter(f => {
    const matchesSearch = f.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = selectedTag === 'all' || f.tag === selectedTag
    return matchesSearch && matchesTag
  })

  // 导出收藏
  const handleExport = () => {
    let markdown = `# 无痛学 - 知识点收藏\n\n`
    markdown += `导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`
    markdown += `共收藏 ${favorites.length} 个知识点\n\n`
    markdown += `---\n\n`

    const groupedByTag = {}
    favorites.forEach(f => {
      const tag = f.tag || '未分类'
      if (!groupedByTag[tag]) groupedByTag[tag] = []
      groupedByTag[tag].push(f)
    })

    Object.entries(groupedByTag).forEach(([tag, items]) => {
      markdown += `## ${tag}\n\n`
      items.forEach((item, index) => {
        markdown += `### ${index + 1}. ${item.fileName || '未知来源'}\n\n`
        markdown += `${item.content}\n\n`
        markdown += `*收藏时间: ${new Date(item.createdAt).toLocaleString('zh-CN')}*\n\n`
      })
    })

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `无痛学-收藏-${new Date().toISOString().slice(0, 10)}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-warm-900/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-warm-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-warm"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="p-4 border-b border-cream-200 dark:border-warm-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-rose-600 dark:text-rose-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-warm-800 dark:text-cream-100">知识点收藏</h3>
                <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs rounded-full">
                  {favorites.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="p-2 rounded-lg hover:bg-cream-100 dark:hover:bg-warm-700 text-warm-500 dark:text-warm-400 transition-colors"
                  title="导出收藏"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-cream-100 dark:hover:bg-warm-700 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 搜索框 */}
            <div className="relative mb-3">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索收藏内容..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-cream-200 dark:border-warm-600 bg-cream-50 dark:bg-warm-700 text-warm-700 dark:text-cream-200 placeholder-warm-400 dark:placeholder-warm-500 focus:outline-none focus:ring-2 focus:ring-warm-500"
              />
            </div>

            {/* 标签筛选 */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedTag('all')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedTag === 'all'
                    ? 'bg-warm-600 text-white'
                    : 'bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300'
                }`}
              >
                全部
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedTag === tag
                      ? 'bg-warm-600 text-white'
                      : 'bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 收藏列表 */}
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            {!isAuthenticated ? (
              <div className="text-center py-12 text-warm-400 dark:text-warm-500">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-lg">登录后可使用收藏功能</p>
                <p className="text-sm mt-2">您的收藏将安全存储在云端</p>
              </div>
            ) : isLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-warm-200 border-t-warm-600 rounded-full animate-spin mx-auto"></div>
              </div>
            ) : filteredFavorites.length === 0 ? (
              <div className="text-center py-12 text-warm-400 dark:text-warm-500">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className="text-lg">还没有收藏</p>
                <p className="text-sm mt-2">在学习过程中长按AI回复可以收藏知识点</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFavorites.map((favorite) => (
                  <div
                    key={favorite.id}
                    className="p-4 bg-cream-50 dark:bg-warm-700/50 rounded-xl border border-cream-200 dark:border-warm-600"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {favorite.fileName && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded">
                            {favorite.fileName}
                          </span>
                        )}
                        {favorite.tag && (
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded">
                            {favorite.tag}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(favorite.id)}
                        className="p-1 hover:bg-terracotta-100 dark:hover:bg-terracotta-900/30 text-terracotta-500 rounded transition-colors flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <p className="text-warm-700 dark:text-cream-200 whitespace-pre-wrap text-sm leading-relaxed mb-3">
                      {favorite.content.length > 300
                        ? favorite.content.slice(0, 300) + '...'
                        : favorite.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-warm-400 dark:text-warm-500">
                        {new Date(favorite.createdAt).toLocaleString('zh-CN')}
                      </span>
                      <select
                        value={favorite.tag || ''}
                        onChange={(e) => handleUpdateTag(favorite.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded border border-cream-200 dark:border-warm-600 bg-white dark:bg-warm-700 text-warm-600 dark:text-warm-300"
                      >
                        <option value="">添加标签</option>
                        <option value="重要">重要</option>
                        <option value="待复习">待复习</option>
                        <option value="已掌握">已掌握</option>
                        <option value="概念">概念</option>
                        <option value="公式">公式</option>
                        <option value="案例">案例</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// 添加收藏的辅助函数
export const addToFavorites = async (content, fileName, sessionId, token) => {
  if (!token) {
    alert('请先登录后再收藏')
    return false
  }

  try {
    const response = await fetch(`${API_BASE}/api/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        content,
        fileName,
        sessionId
      })
    })

    if (response.ok) {
      return true
    }
    return false
  } catch (error) {
    console.error('收藏失败:', error)
    return false
  }
}

export default FavoritesPanel
