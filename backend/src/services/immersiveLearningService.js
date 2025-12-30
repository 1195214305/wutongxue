const cpassService = require('./cpassService');
const crypto = require('crypto');

class ImmersiveLearningService {
  // 计算内容哈希，用于文件去重
  calculateContentHash(content) {
    return crypto.createHash('md5').update(content).digest('hex');
  }

  // 解析文件内容并生成章节
  async parseAndGenerateChapters(fileContent, fileName, userProfile) {
    try {
      console.log('开始解析内容，生成沉浸式学习材料...');
      console.log(`文件名: ${fileName}, 内容长度: ${fileContent.length}`);

      // 计算内容哈希
      const contentHash = this.calculateContentHash(fileContent);

      // 生成多个章节
      const chapters = await this.generateChapters(fileContent, fileName, userProfile);

      console.log(`章节生成完成，共 ${chapters.length} 个章节`);

      return {
        chapters,
        contentHash,
        totalLength: fileContent.length
      };
    } catch (error) {
      console.error('解析内容失败:', error.message);
      // 返回默认内容
      return this.getDefaultChapters(fileContent, fileName);
    }
  }

  // 生成多个章节
  async generateChapters(content, fileName, userProfile) {
    // 增加内容截取长度到 8000 字符
    const truncatedContent = content.substring(0, 8000);

    const prompt = `你是专业的教育内容设计师。请为以下学习材料生成完整的学习内容。

学习材料（共${content.length}字，以下是前8000字）：
${truncatedContent}

用户教育水平：${this.getEducationLevelLabel(userProfile.educationLevel)}
用户兴趣：${userProfile.interests?.join('、') || '无'}

请生成2-3个章节，每个章节包含：
1. 2-3个段落（每段200字左右，附带互动问题）
2. 2-3个测验题
3. 2-3张PPT

返回JSON格式：
{
  "chapters": [
    {
      "title": "章节标题",
      "summary": "章节概要",
      "keyConcepts": ["概念1", "概念2"],
      "paragraphs": [
        {
          "subtitle": "小标题",
          "content": "段落内容（200字）",
          "question": {
            "question": "问题",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": 0,
            "explanation": "解释"
          }
        }
      ],
      "quiz": [
        {
          "question": "测验题",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": 0,
          "explanation": "解释"
        }
      ],
      "pptSlides": [
        {
          "title": "PPT标题",
          "bulletPoints": ["要点1", "要点2", "要点3"],
          "notes": "讲解笔记"
        }
      ]
    }
  ]
}

只返回JSON，不要其他文字。`;

    const response = await cpassService.generateContent([
      { role: 'user', content: prompt }
    ], 'haiku', { temperature: 0.6, maxTokens: 4000 });

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI返回格式错误');
    }

    const result = JSON.parse(jsonMatch[0]);
    return result.chapters || [result];
  }

  // 获取默认章节（降级方案）
  getDefaultChapters(fileContent, fileName) {
    return {
      chapters: [{
        title: fileName || '学习内容',
        summary: '学习材料概要',
        keyConcepts: ['核心概念'],
        paragraphs: [{
          subtitle: '主要内容',
          content: fileContent.substring(0, 500),
          question: {
            question: '你理解了这部分内容吗？',
            options: ['完全理解', '大部分理解', '部分理解', '需要复习'],
            correctAnswer: 0,
            explanation: '继续学习吧！'
          }
        }],
        quiz: [{
          question: '这是一个测试问题',
          options: ['选项A', '选项B', '选项C', '选项D'],
          correctAnswer: 0,
          explanation: '这是答案解释'
        }],
        pptSlides: [{
          title: fileName || '学习内容',
          bulletPoints: ['要点1', '要点2', '要点3'],
          notes: '学习笔记'
        }]
      }],
      contentHash: this.calculateContentHash(fileContent),
      totalLength: fileContent.length
    };
  }

  getEducationLevelLabel(level) {
    const labels = {
      middle_school: '初中',
      high_school: '高中',
      undergraduate: '本科',
      graduate: '研究生',
      professional: '专业人士'
    };
    return labels[level] || '通用';
  }
}

module.exports = new ImmersiveLearningService();
