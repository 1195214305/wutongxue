const cpassService = require('./cpassService');

class ImmersiveLearningService {
  // 解析文件内容并生成章节 - 简化版，确保快速响应
  async parseAndGenerateChapters(fileContent, fileName, userProfile) {
    try {
      console.log('开始解析内容，生成沉浸式学习材料...');
      console.log(`文件名: ${fileName}, 内容长度: ${fileContent.length}`);

      // 只生成一个章节，确保快速响应
      const chapter = await this.generateQuickChapter(fileContent, fileName, userProfile);

      console.log('章节生成完成');
      return { chapters: [chapter] };
    } catch (error) {
      console.error('解析内容失败:', error.message);
      // 返回默认内容而不是抛出错误
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
        }]
      };
    }
  }

  // 快速生成单个章节
  async generateQuickChapter(content, fileName, userProfile) {
    const truncatedContent = content.substring(0, 2000);

    const prompt = `你是教育内容设计师。请为以下内容生成学习材料。

内容：
${truncatedContent}

用户教育水平：${this.getEducationLevelLabel(userProfile.educationLevel)}

请返回JSON格式：
{
  "title": "章节标题",
  "summary": "概要",
  "keyConcepts": ["概念1", "概念2"],
  "paragraphs": [
    {
      "subtitle": "小标题",
      "content": "内容（100字）",
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
      "bulletPoints": ["要点1", "要点2"],
      "notes": "笔记"
    }
  ]
}

生成1个段落、1个测验题、1张PPT。只返回JSON。`;

    const response = await cpassService.generateContent([
      { role: 'user', content: prompt }
    ], 'haiku', { temperature: 0.5, maxTokens: 2000 });

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI返回格式错误');
    }

    return JSON.parse(jsonMatch[0]);
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
