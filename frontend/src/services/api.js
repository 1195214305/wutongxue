// 通义千问 API 服务 - 纯前端版本
// 注意：生产环境建议通过环境变量配置
const API_KEY = import.meta.env.VITE_DASHSCOPE_API_KEY || 'sk-54ae495d0e8e4dfb92607467bfcdf357'

const API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'

export async function callQwenAPI(messages, options = {}) {
  const { temperature = 0.8, maxTokens = 1500, model = 'qwen-turbo' } = options

  if (!API_KEY) {
    throw new Error('API Key 未配置')
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
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

// 生成学习场景
export async function generateScenario(content, scenario, model = 'qwen-turbo') {
  const scenarioMap = {
    'workplace': '职场办公场景，如同事之间的协作讲解',
    'campus': '校园学习场景，如导师带教或同学讨论',
    'practice': '实操场景，如现场问题解决'
  }

  const systemPrompt = `你是一个情景式学习助手。请基于以下知识内容，构建一个${scenarioMap[scenario] || '自然的学习场景'}。

要求：
1. 以自然的人物对话推进情节
2. 对话需具备合理动机（如同事协作讲解、导师带教、场景化问题解决等）
3. 通过情节自然融入知识要点，避免密集问句
4. 以沉浸式体验帮助用户理解并掌握知识
5. 每次回复控制在合适的长度，让用户有参与感
6. 使用生动的场景描述和人物对话

知识内容：
${content}

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
