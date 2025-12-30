const OpenAI = require('openai');

// Cpass.cc API 客户端配置
class CpassService {
  constructor() {
    // 使用提供的测试密钥
    this.apiKey = process.env.CPASS_API_KEY || 'sk-7dNMP2LKUCu4ozIIA9Gv4SPLkBRyMF8LPx8IxvkPyPAegn6Y';
    this.baseURL = 'https://api.cpass.cc/v1';

    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseURL,
      timeout: 120000, // 2分钟超时
      maxRetries: 2
    });

    // 可用的模型列表
    this.availableModels = {
      haiku: 'claude-haiku-4-5-20251001',
      opus: 'claude-opus-4-5-20251101',
      sonnet: 'claude-sonnet-4-5-20250929'
    };
  }

  // 调用AI生成内容
  async generateContent(messages, model = 'haiku', options = {}) {
    try {
      // 默认使用 haiku，更快更便宜
      const modelName = this.availableModels[model] || this.availableModels.haiku;

      console.log(`调用 Cpass API: 模型=${modelName}`);

      const completion = await this.client.chat.completions.create({
        model: modelName,
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000
      });

      const content = completion.choices[0].message.content;
      console.log(`Cpass API 响应成功，内容长度: ${content.length}`);

      return content;
    } catch (error) {
      console.error('Cpass API调用错误:', error.message);
      throw new Error(`AI生成失败: ${error.message}`);
    }
  }

  // 流式生成内容
  async streamContent(messages, model = 'haiku', onChunk, options = {}) {
    try {
      const modelName = this.availableModels[model] || this.availableModels.haiku;

      const stream = await this.client.chat.completions.create({
        model: modelName,
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000,
        stream: true
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
      console.error('Cpass API流式调用错误:', error.message);
      throw new Error(`AI生成失败: ${error.message}`);
    }
  }
}

module.exports = new CpassService();
