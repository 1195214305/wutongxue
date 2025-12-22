// 文件解析工具 - 支持多种格式
import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'
import * as XLSX from 'xlsx'

// 设置 PDF.js worker - 使用 unpkg CDN（更可靠）
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

// 后端 API 地址
const API_BASE = import.meta.env.VITE_API_BASE || 'https://wutongxue-backend.onrender.com'

// 支持的文件类型
export const SUPPORTED_EXTENSIONS = {
  // 文本文件
  text: ['.txt', '.md', '.markdown'],
  // 文档文件
  document: ['.pdf', '.doc', '.docx'],
  // 表格文件
  spreadsheet: ['.xlsx', '.xls', '.csv'],
  // 代码文件
  code: [
    '.js', '.jsx', '.ts', '.tsx',
    '.py', '.java', '.c', '.cpp', '.h',
    '.css', '.scss', '.less',
    '.html', '.xml', '.json',
    '.sql', '.sh', '.bash',
    '.go', '.rs', '.rb', '.php',
    '.swift', '.kt', '.scala',
    '.vue', '.svelte'
  ]
}

// 获取所有支持的扩展名
export const getAllSupportedExtensions = () => {
  return [
    ...SUPPORTED_EXTENSIONS.text,
    ...SUPPORTED_EXTENSIONS.document,
    ...SUPPORTED_EXTENSIONS.spreadsheet,
    ...SUPPORTED_EXTENSIONS.code
  ]
}

// 获取文件类型
export const getFileType = (fileName) => {
  const ext = '.' + fileName.split('.').pop().toLowerCase()

  if (SUPPORTED_EXTENSIONS.text.includes(ext)) return 'text'
  if (SUPPORTED_EXTENSIONS.document.includes(ext)) return 'document'
  if (SUPPORTED_EXTENSIONS.spreadsheet.includes(ext)) return 'spreadsheet'
  if (SUPPORTED_EXTENSIONS.code.includes(ext)) return 'code'

  return null
}

// 获取代码语言名称
const getLanguageName = (ext) => {
  const langMap = {
    '.js': 'JavaScript',
    '.jsx': 'JavaScript (React)',
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript (React)',
    '.py': 'Python',
    '.java': 'Java',
    '.c': 'C',
    '.cpp': 'C++',
    '.h': 'C/C++ Header',
    '.css': 'CSS',
    '.scss': 'SCSS',
    '.less': 'Less',
    '.html': 'HTML',
    '.xml': 'XML',
    '.json': 'JSON',
    '.sql': 'SQL',
    '.sh': 'Shell',
    '.bash': 'Bash',
    '.go': 'Go',
    '.rs': 'Rust',
    '.rb': 'Ruby',
    '.php': 'PHP',
    '.swift': 'Swift',
    '.kt': 'Kotlin',
    '.scala': 'Scala',
    '.vue': 'Vue',
    '.svelte': 'Svelte'
  }
  return langMap[ext] || 'Code'
}

// 解析纯文本文件
const parseTextFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error('文本文件读取失败'))
    reader.readAsText(file, 'UTF-8')
  })
}

// 解析 PDF 文件
const parsePdfFile = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    let fullText = ''
    const totalPages = pdf.numPages

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map(item => item.str).join(' ')
      fullText += `\n--- 第 ${i} 页 ---\n${pageText}\n`
    }

    return fullText.trim()
  } catch (error) {
    throw new Error('PDF 文件解析失败: ' + error.message)
  }
}

// 解析 Word 文档 (.docx)
const parseWordFile = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value
  } catch (error) {
    throw new Error('Word 文档解析失败: ' + error.message)
  }
}

// 解析旧版 Word 文档 (.doc) - 需要通过后端 API
const parseDocFile = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE}/api/parse-doc`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || '解析失败')
    }

    const data = await response.json()
    return data.content
  } catch (error) {
    throw new Error('.doc 文件解析失败: ' + error.message)
  }
}

// 解析 Excel 表格
const parseExcelFile = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })

    let fullText = ''

    workbook.SheetNames.forEach((sheetName, index) => {
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      fullText += `\n=== 工作表: ${sheetName} ===\n`

      // 转换为表格文本格式
      jsonData.forEach((row, rowIndex) => {
        if (row.length > 0) {
          const rowText = row.map(cell => cell !== undefined ? String(cell) : '').join(' | ')
          fullText += rowText + '\n'

          // 在第一行后添加分隔线（表头）
          if (rowIndex === 0) {
            fullText += row.map(() => '---').join(' | ') + '\n'
          }
        }
      })
    })

    return fullText.trim()
  } catch (error) {
    throw new Error('Excel 文件解析失败: ' + error.message)
  }
}

// 解析 CSV 文件
const parseCsvFile = async (file) => {
  try {
    const text = await parseTextFile(file)
    const lines = text.split('\n')

    let formattedText = '=== CSV 数据 ===\n'

    lines.forEach((line, index) => {
      if (line.trim()) {
        const cells = line.split(',').map(cell => cell.trim())
        formattedText += cells.join(' | ') + '\n'

        // 在第一行后添加分隔线
        if (index === 0) {
          formattedText += cells.map(() => '---').join(' | ') + '\n'
        }
      }
    })

    return formattedText.trim()
  } catch (error) {
    throw new Error('CSV 文件解析失败: ' + error.message)
  }
}

// 解析代码文件
const parseCodeFile = async (file) => {
  try {
    const content = await parseTextFile(file)
    const ext = '.' + file.name.split('.').pop().toLowerCase()
    const language = getLanguageName(ext)

    return `=== ${language} 代码文件: ${file.name} ===\n\n${content}`
  } catch (error) {
    throw new Error('代码文件读取失败: ' + error.message)
  }
}

// 主解析函数
export const parseFile = async (file) => {
  const fileName = file.name
  const ext = '.' + fileName.split('.').pop().toLowerCase()
  const fileType = getFileType(fileName)

  if (!fileType) {
    throw new Error(`不支持的文件格式: ${ext}`)
  }

  switch (fileType) {
    case 'text':
      return await parseTextFile(file)

    case 'document':
      if (ext === '.pdf') {
        return await parsePdfFile(file)
      } else if (ext === '.docx') {
        return await parseWordFile(file)
      } else if (ext === '.doc') {
        return await parseDocFile(file)
      }
      break

    case 'spreadsheet':
      if (ext === '.csv') {
        return await parseCsvFile(file)
      } else {
        return await parseExcelFile(file)
      }

    case 'code':
      return await parseCodeFile(file)

    default:
      throw new Error(`不支持的文件格式: ${ext}`)
  }
}

// 获取文件类型的友好名称
export const getFileTypeLabel = (fileName) => {
  const ext = '.' + fileName.split('.').pop().toLowerCase()
  const fileType = getFileType(fileName)

  const labels = {
    text: '文本文件',
    document: ext === '.pdf' ? 'PDF 文档' : 'Word 文档',
    spreadsheet: ext === '.csv' ? 'CSV 表格' : 'Excel 表格',
    code: getLanguageName(ext) + ' 文件'
  }

  return labels[fileType] || '未知文件'
}
