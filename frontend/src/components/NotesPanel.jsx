import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://wutongxue-backend.onrender.com'

function NotesPanel({ isOpen, onClose, sessionId, fileName }) {
  const { token, isAuthenticated } = useAuth()
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  // 加载笔记
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchNotes()
    }
  }, [isOpen, isAuthenticated])

  const fetchNotes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/notes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes.map(n => ({
          id: n.id,
          content: n.content,
          sessionId: n.session_id,
          fileName: n.file_name,
          createdAt: n.created_at,
          updatedAt: n.updated_at
        })))
      }
    } catch (error) {
      console.error('获取笔记失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 添加笔记
  const handleAddNote = async () => {
    if (!newNote.trim()) return

    if (!isAuthenticated) {
      alert('请先登录后再添加笔记')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId,
          fileName,
          content: newNote.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        const note = {
          id: data.noteId,
          content: newNote.trim(),
          sessionId,
          fileName,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        setNotes([note, ...notes])
        setNewNote('')
      }
    } catch (error) {
      console.error('添加笔记失败:', error)
    }
  }

  // 删除笔记
  const handleDeleteNote = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setNotes(notes.filter(n => n.id !== id))
      }
    } catch (error) {
      console.error('删除笔记失败:', error)
    }
  }

  // 编辑笔记
  const handleStartEdit = (note) => {
    setEditingId(note.id)
    setEditContent(note.content)
  }

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return

    try {
      const response = await fetch(`${API_BASE}/api/notes/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: editContent.trim() })
      })

      if (response.ok) {
        setNotes(notes.map(n =>
          n.id === editingId
            ? { ...n, content: editContent.trim(), updatedAt: Date.now() }
            : n
        ))
        setEditingId(null)
        setEditContent('')
      }
    } catch (error) {
      console.error('更新笔记失败:', error)
    }
  }

  // 导出笔记
  const handleExport = () => {
    const filteredNotes = filter === 'current'
      ? notes.filter(n => n.sessionId === sessionId)
      : notes

    let markdown = `# 无痛学 - 学习笔记\n\n`
    markdown += `导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`
    markdown += `---\n\n`

    filteredNotes.forEach((note, index) => {
      markdown += `## 笔记 ${index + 1}\n\n`
      if (note.fileName) {
        markdown += `**来源文件**: ${note.fileName}\n\n`
      }
      markdown += `**记录时间**: ${new Date(note.createdAt).toLocaleString('zh-CN')}\n\n`
      markdown += `${note.content}\n\n`
      markdown += `---\n\n`
    })

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `无痛学-笔记-${new Date().toISOString().slice(0, 10)}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filteredNotes = filter === 'current'
    ? notes.filter(n => n.sessionId === sessionId)
    : notes

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
          initial={{ scale: 0.9, opacity: 0, x: 100 }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          exit={{ scale: 0.9, opacity: 0, x: 100 }}
          className="bg-white dark:bg-warm-800 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-warm"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="p-4 border-b border-cream-200 dark:border-warm-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-warm-800 dark:text-cream-100">学习笔记</h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-cream-100 dark:hover:bg-warm-700 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 筛选和导出 */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filter === 'all'
                      ? 'bg-warm-600 text-white'
                      : 'bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300'
                  }`}
                >
                  全部 ({notes.length})
                </button>
                <button
                  onClick={() => setFilter('current')}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filter === 'current'
                      ? 'bg-warm-600 text-white'
                      : 'bg-cream-100 dark:bg-warm-700 text-warm-600 dark:text-warm-300'
                  }`}
                >
                  当前文件 ({notes.filter(n => n.sessionId === sessionId).length})
                </button>
              </div>
              <button
                onClick={handleExport}
                className="p-2 rounded-lg hover:bg-cream-100 dark:hover:bg-warm-700 text-warm-500 dark:text-warm-400 transition-colors"
                title="导出笔记"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>

          {/* 添加笔记 */}
          <div className="p-4 border-b border-cream-200 dark:border-warm-700">
            {!isAuthenticated ? (
              <div className="text-center py-4 text-warm-500 dark:text-warm-400">
                <p>登录后可保存笔记到云端</p>
              </div>
            ) : (
              <>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="记录你的学习心得..."
                  className="w-full p-3 rounded-xl border border-cream-200 dark:border-warm-600 bg-cream-50 dark:bg-warm-700 text-warm-700 dark:text-cream-200 placeholder-warm-400 dark:placeholder-warm-500 resize-none focus:outline-none focus:ring-2 focus:ring-warm-500"
                  rows={3}
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="mt-2 w-full py-2 bg-warm-600 hover:bg-warm-700 disabled:bg-warm-300 dark:disabled:bg-warm-600 text-white rounded-lg transition-colors"
                >
                  添加笔记
                </button>
              </>
            )}
          </div>

          {/* 笔记列表 */}
          <div className="p-4 overflow-y-auto max-h-[40vh]">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-warm-200 border-t-warm-600 rounded-full animate-spin mx-auto"></div>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-warm-400 dark:text-warm-500">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>还没有笔记</p>
                <p className="text-sm mt-1">学习过程中随时记录你的想法</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 bg-cream-50 dark:bg-warm-700/50 rounded-xl"
                  >
                    {editingId === note.id ? (
                      <div>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-2 rounded-lg border border-cream-200 dark:border-warm-600 bg-white dark:bg-warm-700 text-warm-700 dark:text-cream-200 resize-none focus:outline-none focus:ring-2 focus:ring-warm-500"
                          rows={3}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1 bg-sage-500 text-white rounded-lg text-sm"
                          >
                            保存
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 bg-cream-200 dark:bg-warm-600 text-warm-600 dark:text-warm-300 rounded-lg text-sm"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-warm-700 dark:text-cream-200 whitespace-pre-wrap mb-2">
                          {note.content}
                        </p>
                        <div className="flex items-center justify-between text-xs text-warm-400 dark:text-warm-500">
                          <div className="flex items-center gap-2">
                            {note.fileName && (
                              <span className="px-2 py-0.5 bg-cream-200 dark:bg-warm-600 rounded">
                                {note.fileName}
                              </span>
                            )}
                            <span>{new Date(note.createdAt).toLocaleString('zh-CN')}</span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleStartEdit(note)}
                              className="p-1 hover:bg-cream-200 dark:hover:bg-warm-600 rounded transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-1 hover:bg-terracotta-100 dark:hover:bg-terracotta-900/30 text-terracotta-500 rounded transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
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

export default NotesPanel
