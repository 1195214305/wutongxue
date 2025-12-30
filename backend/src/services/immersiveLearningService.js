const cpassService = require('./cpassService');

class ImmersiveLearningService {
  // 解析文件内容并生成章节
  async parseAndGenerateChapters(fileContent, fileName, userProfile) {
    try {
      console.log('开始解析内容，生成沉浸式学习材料...');

      // 第一步：分析内容并划分章节
      const chaptersStructure = await this.analyzeAndDivideChapters(fileContent, userProfile);

      // 第二步：为每个章节生成详细内容
      const chapters = await this.generateChapterDetails(chaptersStructure, fileContent, userProfile);

      console.log(`成功生成 ${chapters.length} 个章节`);
      return { chapters };
    } catch (error) {
      console.error('解析内容失败:', error);
      throw error;
    }
  }

  // 分析内容并划分章节
  async analyzeAndDivideChapters(content, userProfile) {
    const prompt = `你是一位专业的教育内容设计师。请分析以下学习材料，将其划分为合理的章节结构。

学习材料：
${content.substring(0, 8000)} ${content.length > 8000 ? '...(内容过长，已截断)' : ''}

用户画像：
- 教育水平：${this.getEducationLevelLabel(userProfile.educationLevel)}
- 兴趣爱好：${userProfile.interests.join('、') || '无'}

请按照以下要求划分章节：
1. 每个章节应该是一个相对独立的知识单元
2. 章节数量建议在3-8个之间
3. 每个章节应该有清晰的主题
4. 考虑用户的教育水平，合理安排难度递进

请以JSON格式返回章节结构，格式如下：
{
  "chapters": [
    {
      "title": "章节标题",
      "summary": "章节概要（1-2句话）",
      "keyConcepts": ["关键概念1", "关键概念2"],
      "contentRange": {
        "start": 0,
        "end": 500
      }
    }
  ]
}

只返回JSON，不要其他说明文字。`;

    const response = await cpassService.generateContent([
      { role: 'user', content: prompt }
    ], 'sonnet', { temperature: 0.3, maxTokens: 3000 });

    // 解析JSON响应
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI返回格式错误');
    }

    const result = JSON.parse(jsonMatch[0]);
    return result.chapters;
  }

  // 为每个章节生成详细内容
  async generateChapterDetails(chaptersStructure, fullContent, userProfile) {
    const chapters = [];

    for (let i = 0; i < chaptersStructure.length; i++) {
      const chapterInfo = chaptersStructure[i];
      console.log(`正在生成第 ${i + 1}/${chaptersStructure.length} 章...`);

      // 提取章节对应的原文内容
      const chapterContent = this.extractChapterContent(fullContent, chapterInfo, i, chaptersStructure.length);

      // 生成章节的详细内容
      const chapterDetails = await this.generateSingleChapter(chapterContent, chapterInfo, userProfile, i + 1);

      chapters.push({
        ...chapterInfo,
        ...chapterDetails
      });
    }

    return chapters;
  }

  // 提取章节内容
  extractChapterContent(fullContent, chapterInfo, index, totalChapters) {
    // 简单的内容分割策略
    const chunkSize = Math.floor(fullContent.length / totalChapters);
    const start = index * chunkSize;
    const end = index === totalChapters - 1 ? fullContent.length : (index + 1) * chunkSize;

    return fullContent.substring(start, end);
  }

  // 生成单个章节的详细内容
  async generateSingleChapter(chapterContent, chapterInfo, userProfile, chapterNumber) {
    const prompt = `你是一位优秀的教育内容设计师。请为以下章节生成详细的学习内容。

章节信息：
- 标题：${chapterInfo.title}
- 概要：${chapterInfo.summary}

原文内容：
${chapterContent.substring(0, 6000)}${chapterContent.length > 6000 ? '...' : ''}

用户画像：
- 教育水平：${this.getEducationLevelLabel(userProfile.educationLevel)}
- 兴趣爱好：${userProfile.interests.join('、') || '无'}

请生成以下内容：

1. **段落内容**：将原文改写为3-5个段落，每个段落：
   - 根据用户的教育水平调整语言难度
   - 用用户感兴趣的例子来解释概念
   - 每个段落后附带一个互动问题

2. **章节测验**：生成5个选择题，测试本章节的核心概念

3. **PPT幻灯片**：生成3-5张PPT内容大纲

请以JSON格式返回，格式如下：
{
  "paragraphs": [
    {
      "subtitle": "段落小标题",
      "content": "段落内容（改写后的）",
      "rewrittenExample": "个性化例子（如果有）",
      "keyConcepts": [
        {"term": "术语", "definition": "定义"}
      ],
      "question": {
        "question": "问题内容",
        "options": ["选项A", "选项B", "选项C", "选项D"],
        "correctAnswer": 0,
        "explanation": "答案解释",
        "hint": "提示（可选）"
      }
    }
  ],
  "quiz": [
    {
      "question": "测验问题",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "correctAnswer": 0,
      "explanation": "答案解释"
    }
  ],
  "pptSlides": [
    {
      "title": "幻灯片标题",
      "bulletPoints": ["要点1", "要点2", "要点3"],
      "notes": "讲解笔记"
    }
  ]
}

只返回JSON，不要其他说明文字。`;

    const response = await cpassService.generateContent([
      { role: 'user', content: prompt }
    ], 'sonnet', { temperature: 0.7, maxTokens: 4000 });

    // 解析JSON响应
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
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
