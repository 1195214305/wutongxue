const cpassService = require('./cpassService');
const crypto = require('crypto');

class ImmersiveLearningService {
  // 计算内容哈希，用于文件去重
  calculateContentHash(content) {
    return crypto.createHash('md5').update(content).digest('hex');
  }

  // 解析文件内容并生成章节（快速版本，先返回第一批）
  async parseAndGenerateChapters(fileContent, fileName, userProfile) {
    try {
      console.log('开始解析内容，生成沉浸式学习材料...');
      console.log(`文件名: ${fileName}, 内容长度: ${fileContent.length}`);

      // 计算内容哈希
      const contentHash = this.calculateContentHash(fileContent);

      // 计算总章节数
      const batchSize = 25000; // 每章节处理 25000 字符
      const totalChapters = Math.min(Math.ceil(fileContent.length / batchSize), 8);

      // 先生成第一个章节（快速响应）
      const firstChapterContent = fileContent.substring(0, Math.min(30000, fileContent.length));
      const firstChapter = await this.generateFirstChapter(firstChapterContent, fileName, userProfile, totalChapters);

      console.log(`第一章生成完成，共计划 ${totalChapters} 章`);

      return {
        chapters: [firstChapter],
        contentHash,
        totalLength: fileContent.length,
        totalChapters,
        generatedChapters: 1,
        hasMore: totalChapters > 1
      };
    } catch (error) {
      console.error('解析内容失败:', error.message);
      return this.getDefaultChapters(fileContent, fileName);
    }
  }

  // 生成更多章节（用于后续请求）
  async generateMoreChapters(fileContent, fileName, userProfile, startChapter, endChapter) {
    const chapters = [];
    const batchSize = 25000;

    for (let i = startChapter; i <= endChapter && i <= 8; i++) {
      const start = (i - 1) * batchSize;
      const end = Math.min(i * batchSize, fileContent.length);

      if (start >= fileContent.length) break;

      const batchContent = fileContent.substring(start, end);
      console.log(`正在生成第 ${i} 章...`);

      try {
        const chapter = await this.generateSingleChapter(batchContent, i, Math.min(Math.ceil(fileContent.length / batchSize), 8), userProfile);
        chapters.push(chapter);
      } catch (error) {
        console.error(`生成第 ${i} 章失败:`, error.message);
        chapters.push(this.getDefaultSingleChapter(batchContent, i));
      }
    }

    return chapters;
  }

  // 生成第一个章节（包含更多内容）
  async generateFirstChapter(content, fileName, userProfile, totalChapters) {
    const prompt = `你是专业的教育内容设计师。请为以下学习材料生成第一章的学习内容。

学习材料（这是第1/${totalChapters}部分，共${content.length}字）：
${content}

用户教育水平：${this.getEducationLevelLabel(userProfile.educationLevel)}
用户兴趣：${userProfile.interests?.join('、') || '无'}

请生成一个完整的章节，包含：
1. 4-5个段落（每段300-400字，深入讲解，附带互动问题）
2. 4-5个测验题（覆盖核心概念）
3. 4-5张PPT（包含详细讲解笔记）

返回JSON格式：
{
  "title": "章节标题（根据内容提炼）",
  "summary": "章节概要（80字）",
  "keyConcepts": ["概念1", "概念2", "概念3", "概念4"],
  "paragraphs": [
    {
      "subtitle": "小标题",
      "content": "段落内容（300-400字，深入讲解知识点）",
      "question": {
        "question": "互动问题（检验理解）",
        "options": ["A选项", "B选项", "C选项", "D选项"],
        "correctAnswer": 0,
        "explanation": "详细解释为什么这个答案正确（50字）"
      }
    }
  ],
  "quiz": [
    {
      "question": "测验题目",
      "options": ["A选项", "B选项", "C选项", "D选项"],
      "correctAnswer": 0,
      "explanation": "答案解释"
    }
  ],
  "pptSlides": [
    {
      "title": "PPT标题",
      "bulletPoints": ["要点1", "要点2", "要点3", "要点4"],
      "notes": "详细讲解笔记（150字）"
    }
  ]
}

只返回JSON，不要其他文字。`;

    const response = await cpassService.generateContent([
      { role: 'user', content: prompt }
    ], 'haiku', { temperature: 0.6, maxTokens: 8000 });

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI返回格式错误');
    }

    return JSON.parse(jsonMatch[0]);
  }

  // 生成单个章节
  async generateSingleChapter(content, chapterNum, totalChapters, userProfile) {
    const prompt = `你是专业的教育内容设计师。这是学习材料的第 ${chapterNum}/${totalChapters} 部分。

学习材料内容：
${content}

用户教育水平：${this.getEducationLevelLabel(userProfile.educationLevel)}

请生成一个完整的章节，包含：
1. 4-5个段落（每段300-400字，深入讲解，附带互动问题）
2. 4-5个测验题
3. 4-5张PPT

返回JSON格式：
{
  "title": "章节标题（根据内容提炼）",
  "summary": "章节概要（80字）",
  "keyConcepts": ["概念1", "概念2", "概念3"],
  "paragraphs": [
    {
      "subtitle": "小标题",
      "content": "段落内容（300-400字）",
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

只返回JSON。`;

    const response = await cpassService.generateContent([
      { role: 'user', content: prompt }
    ], 'haiku', { temperature: 0.6, maxTokens: 6000 });

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI返回格式错误');
    }

    return JSON.parse(jsonMatch[0]);
  }

  // 获取默认单个章节
  getDefaultSingleChapter(content, chapterNum) {
    return {
      title: `第 ${chapterNum} 章`,
      summary: '学习内容',
      keyConcepts: ['核心概念'],
      paragraphs: [{
        subtitle: '主要内容',
        content: content.substring(0, 500),
        question: {
          question: '你理解了这部分内容吗？',
          options: ['完全理解', '大部分理解', '部分理解', '需要复习'],
          correctAnswer: 0,
          explanation: '继续学习吧！'
        }
      }],
      quiz: [],
      pptSlides: [{
        title: `第 ${chapterNum} 章`,
        bulletPoints: ['学习要点'],
        notes: ''
      }]
    };
  }

  // 获取默认章节（降级方案）
  getDefaultChapters(fileContent, fileName) {
    const contentHash = this.calculateContentHash(fileContent);
    const totalChapters = Math.min(Math.ceil(fileContent.length / 25000), 8);

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
      contentHash,
      totalLength: fileContent.length,
      totalChapters,
      generatedChapters: 1,
      hasMore: totalChapters > 1
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
