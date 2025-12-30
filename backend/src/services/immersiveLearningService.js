const cpassService = require('./cpassService');

class ImmersiveLearningService {
  // 解析文件内容并生成章节
  async parseAndGenerateChapters(fileContent, fileName, userProfile) {
    try {
      console.log('开始解析内容，生成沉浸式学习材料...');
      console.log(`文件名: ${fileName}, 内容长度: ${fileContent.length}`);

      // 第一步：分析内容并划分章节（使用 haiku，更快）
      const chaptersStructure = await this.analyzeAndDivideChapters(fileContent, userProfile);
      console.log(`章节划分完成，共 ${chaptersStructure.length} 个章节`);

      // 第二步：为每个章节生成详细内容
      const chapters = await this.generateChapterDetails(chaptersStructure, fileContent, userProfile);

      console.log(`成功生成 ${chapters.length} 个章节`);
      return { chapters };
    } catch (error) {
      console.error('解析内容失败:', error.message);
      throw error;
    }
  }

  // 分析内容并划分章节
  async analyzeAndDivideChapters(content, userProfile) {
    // 截取内容，避免过长
    const truncatedContent = content.substring(0, 5000);

    const prompt = `你是一位专业的教育内容设计师。请分析以下学习材料，将其划分为合理的章节结构。

学习材料：
${truncatedContent}${content.length > 5000 ? '\n...(内容已截断)' : ''}

用户画像：
- 教育水平：${this.getEducationLevelLabel(userProfile.educationLevel)}
- 兴趣爱好：${userProfile.interests?.join('、') || '无'}

请按照以下要求划分章节：
1. 章节数量在2-5个之间
2. 每个章节应该有清晰的主题

请以JSON格式返回，格式如下：
{"chapters":[{"title":"章节标题","summary":"章节概要","keyConcepts":["概念1","概念2"]}]}

只返回JSON，不要其他文字。`;

    try {
      const response = await cpassService.generateContent([
        { role: 'user', content: prompt }
      ], 'haiku', { temperature: 0.3, maxTokens: 2000 });

      // 解析JSON响应
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('AI返回内容:', response);
        throw new Error('AI返回格式错误，无法解析JSON');
      }

      const result = JSON.parse(jsonMatch[0]);
      return result.chapters || [];
    } catch (error) {
      console.error('章节划分失败:', error.message);
      // 返回默认章节结构
      return [{
        title: '学习内容',
        summary: '主要学习内容',
        keyConcepts: ['核心概念']
      }];
    }
  }

  // 为每个章节生成详细内容
  async generateChapterDetails(chaptersStructure, fullContent, userProfile) {
    const chapters = [];

    for (let i = 0; i < chaptersStructure.length; i++) {
      const chapterInfo = chaptersStructure[i];
      console.log(`正在生成第 ${i + 1}/${chaptersStructure.length} 章: ${chapterInfo.title}`);

      try {
        // 提取章节对应的原文内容
        const chapterContent = this.extractChapterContent(fullContent, chapterInfo, i, chaptersStructure.length);

        // 生成章节的详细内容
        const chapterDetails = await this.generateSingleChapter(chapterContent, chapterInfo, userProfile, i + 1);

        chapters.push({
          ...chapterInfo,
          ...chapterDetails
        });
      } catch (error) {
        console.error(`生成第 ${i + 1} 章失败:`, error.message);
        // 添加默认章节内容
        chapters.push({
          ...chapterInfo,
          paragraphs: [{
            subtitle: chapterInfo.title,
            content: this.extractChapterContent(fullContent, chapterInfo, i, chaptersStructure.length).substring(0, 500),
            question: {
              question: '你理解了这部分内容吗？',
              options: ['完全理解', '大部分理解', '部分理解', '需要复习'],
              correctAnswer: 0,
              explanation: '继续学习下一部分吧！'
            }
          }],
          quiz: [],
          pptSlides: [{
            title: chapterInfo.title,
            bulletPoints: chapterInfo.keyConcepts || ['学习要点'],
            notes: chapterInfo.summary || ''
          }]
        });
      }
    }

    return chapters;
  }

  // 提取章节内容
  extractChapterContent(fullContent, chapterInfo, index, totalChapters) {
    const chunkSize = Math.floor(fullContent.length / totalChapters);
    const start = index * chunkSize;
    const end = index === totalChapters - 1 ? fullContent.length : (index + 1) * chunkSize;
    return fullContent.substring(start, end);
  }

  // 生成单个章节的详细内容
  async generateSingleChapter(chapterContent, chapterInfo, userProfile, chapterNumber) {
    // 截取内容
    const truncatedContent = chapterContent.substring(0, 3000);

    const prompt = `你是一位优秀的教育内容设计师。请为以下章节生成学习内容。

章节：${chapterInfo.title}
概要：${chapterInfo.summary}

原文：
${truncatedContent}${chapterContent.length > 3000 ? '...' : ''}

用户：${this.getEducationLevelLabel(userProfile.educationLevel)}

请生成JSON格式内容：
{
  "paragraphs": [
    {
      "subtitle": "小标题",
      "content": "改写后的段落内容（200字左右）",
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
      "question": "测验问题",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "解释"
    }
  ],
  "pptSlides": [
    {
      "title": "标题",
      "bulletPoints": ["要点1", "要点2"],
      "notes": "笔记"
    }
  ]
}

生成2-3个段落，2-3个测验题，2-3张PPT。只返回JSON。`;

    const response = await cpassService.generateContent([
      { role: 'user', content: prompt }
    ], 'haiku', { temperature: 0.7, maxTokens: 3000 });

    // 解析JSON响应
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('章节生成返回:', response.substring(0, 200));
      throw new Error('AI返回格式错误');
    }

    return JSON.parse(jsonMatch[0]);
  }

  // 获取教育水平标签
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
