// 通义千问 API 服务 - 纯前端版本
// 注意：生产环境建议通过环境变量配置
const API_KEY = import.meta.env.VITE_DASHSCOPE_API_KEY || 'sk-54ae495d0e8e4dfb92607467bfcdf357'

const API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'

// 最大字符数限制（保守估计，1个token约等于1.5个中文字符）
const MAX_CONTENT_LENGTH = 20000

// 截断消息内容，保持在限制范围内
function truncateMessages(messages, maxLength = MAX_CONTENT_LENGTH) {
  let totalLength = 0
  const truncatedMessages = []

  // 从后往前遍历，保留最近的消息
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]
    const msgLength = msg.content.length

    if (totalLength + msgLength > maxLength) {
      // 如果是第一条消息（system prompt），截断内容
      if (i === 0 && msg.role === 'system') {
        const remainingLength = maxLength - totalLength
        if (remainingLength > 500) {
          truncatedMessages.unshift({
            role: msg.role,
            content: msg.content.slice(0, remainingLength - 100) + '\n\n[内容已截断...]'
          })
        }
      }
      break
    }

    totalLength += msgLength
    truncatedMessages.unshift(msg)
  }

  return truncatedMessages
}

export async function callQwenAPI(messages, options = {}) {
  const { temperature = 0.8, maxTokens = 1500, model = 'qwen-turbo' } = options

  if (!API_KEY) {
    throw new Error('API Key 未配置')
  }

  // 截断过长的消息
  const truncatedMessages = truncateMessages(messages)

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages: truncatedMessages,
      temperature,
      max_tokens: maxTokens
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    console.error('API 错误:', response.status, error)
    throw new Error(error.error?.message || error.message || `请求失败 (${response.status})`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// 截断文件内容
function truncateContent(content, maxLength = 15000) {
  if (content.length <= maxLength) {
    return content
  }
  return content.slice(0, maxLength) + '\n\n[内容过长，已截断...]'
}

// 生成学习场景
export async function generateScenario(content, scenario, model = 'qwen-turbo') {
  const scenarioMap = {
    'workplace': '职场办公场景，如同事之间的协作讲解',
    'campus': '校园学习场景，如导师带教或同学讨论',
    'practice': '实操场景，如现场问题解决'
  }

  // 截断过长的内容
  const truncatedContent = truncateContent(content)

  const systemPrompt = `你是一个情景式学习助手。请基于以下知识内容，构建一个${scenarioMap[scenario] || '自然的学习场景'}。

要求：
1. 以自然的人物对话推进情节
2. 对话需具备合理动机（如同事协作讲解、导师带教、场景化问题解决等）
3. 通过情节自然融入知识要点，避免密集问句
4. 以沉浸式体验帮助用户理解并掌握知识
5. 每次回复控制在合适的长度，让用户有参与感
6. 使用生动的场景描述和人物对话

知识内容：
${truncatedContent}

请开始创建一个引人入胜的学习场景，介绍场景背景和主要人物，然后开始第一段对话。`

  const messages = [{ role: 'system', content: systemPrompt }]
  const response = await callQwenAPI(messages, { model })

  return {
    systemPrompt,
    response
  }
}

// 继续对话
export async function continueChat(messages, userMessage, model = 'qwen-turbo') {
  const updatedMessages = [...messages, { role: 'user', content: userMessage }]
  const response = await callQwenAPI(updatedMessages, { model })
  return response
}

// 获取学习摘要
export async function getSummary(messages, model = 'qwen-turbo') {
  const summaryPrompt = '请根据之前的对话，总结用户已经学习到的知识要点，以及还有哪些知识点需要继续学习。用简洁的列表形式呈现。'
  const updatedMessages = [...messages, { role: 'user', content: summaryPrompt }]
  const response = await callQwenAPI(updatedMessages, { temperature: 0.5, maxTokens: 800, model })
  return response
}

// 生成知识测验
export async function generateQuiz(messages, model = 'qwen-turbo') {
  const quizPrompt = `请根据之前的对话内容，生成3道选择题来测试用户的学习效果。

请严格按照以下JSON格式返回，不要添加任何其他内容：
{
  "questions": [
    {
      "question": "题目内容",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "correctIndex": 0,
      "explanation": "答案解释"
    }
  ]
}

注意：
1. correctIndex 是正确答案的索引（0-3）
2. 题目要基于对话中讲解的知识点
3. 选项要有一定迷惑性但不要太难
4. 每道题都要有简短的答案解释`

  const updatedMessages = [...messages, { role: 'user', content: quizPrompt }]
  const response = await callQwenAPI(updatedMessages, { temperature: 0.3, maxTokens: 1500, model })

  try {
    // 尝试从响应中提取JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('无法解析测验数据')
  } catch (err) {
    console.error('解析测验数据失败:', err)
    return { error: '生成测验失败，请重试。' }
  }
}
