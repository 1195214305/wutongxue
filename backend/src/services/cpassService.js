const OpenAI = require('openai');

// Cpass.cc API 客户端配置
class CpassService {
  constructor() {
    // 使用提供的测试密钥
    this.apiKey = 'sk-7dNMP2LKUCu4ozIIA9Gv4SPLkBRyMF8LPx8IxvkPyPAegn6Y';
    this.baseURL = 'https://api.cpass.cc/v1';

    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseURL
    });

    // 可用的模型列表
    this.availableModels = {
      haiku: 'claude-haiku-4-5-20251001',
      opus: 'claude-opus-4-5-20251101',
      sonnet: 'claude-sonnet-4-5-20250929'
    };
  }

  // 调用AI生成内容
  async generateContent(messages, model = 'sonnet', options = {}) {
    try {
      const modelName = this.availableModels[model] || this.availableModels.sonnet;

      const completion = await this.client.chat.completions.create({
        model: modelName,
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000,
        ...options
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Cpass API调用错误:', error);
      throw new Error(`AI生成失败: ${error.message}`);
    }
  }

  // 流式生成内容
  async streamContent(messages, model = 'sonnet', onChunk, options = {}) {
    try {
      const modelName = this.availableModels[model] || this.availableModels.sonnet;

      const stream = await this.client.chat.completions.create({
        model: modelName,
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000,
        stream: true,
        ...options
      });

      let fullContent = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          if (onChunk) {
            onChunk(content);
          }
        }
      }

      return fullContent;
    } catch (error) {
      console.error('Cpass API流式调用错误:', error);
      throw new Error(`AI生成失败: ${error.message}`);
    }
  }
}

module.exports = new CpassService();
