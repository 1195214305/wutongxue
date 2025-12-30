import React, { useState, useEffect } from 'react';
import ChapterContent from './ChapterContent';
import ChapterQuiz from './ChapterQuiz';
import PPTPresentation from './PPTPresentation';
import MindMap from './MindMap';
import CpassApiConfigModal from './CpassApiConfigModal';
import './ImmersiveLearning.css';

const ImmersiveLearning = ({ fileContent, fileName, onBack }) => {
  const [currentView, setCurrentView] = useState('content'); // content, quiz, ppt, mindmap
  const [chapters, setChapters] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [userProfile, setUserProfile] = useState({
    educationLevel: '',
    interests: []
  });
  const [showProfileSetup, setShowProfileSetup] = useState(true);

  // 检查是否已配置API密钥
  useEffect(() => {
    const ccSpecialKey = localStorage.getItem('cpass_cc_special_key');
    const codexKey = localStorage.getItem('cpass_codex_key');

    if (!ccSpecialKey && !codexKey) {
      setShowApiConfig(true);
    }
  }, []);

  // 解析文件内容并生成章节
  useEffect(() => {
    if (fileContent && !showProfileSetup) {
      parseContentAndGenerateChapters();
    }
  }, [fileContent, showProfileSetup]);

  const parseContentAndGenerateChapters = async () => {
    setLoading(true);
    setError(null);

    try {
      // 调用后端API解析内容并生成章节
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://wutongxue-backend.onrender.com'
      const response = await fetch(`${API_BASE}/api/immersive-learning/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: fileContent,
          fileName: fileName,
          userProfile: userProfile
        })
      });

      if (!response.ok) {
        throw new Error('解析内容失败');
      }

      const data = await response.json();
      setChapters(data.chapters);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSetup = (profile) => {
    setUserProfile(profile);
    setShowProfileSetup(false);
  };

  const handleApiConfigSave = () => {
    setShowApiConfig(false);
  };

  const handleChapterComplete = () => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
      setCurrentView('content');
    }
  };

  const handleQuizComplete = (score) => {
    // 记录测验成绩
    console.log(`Chapter ${currentChapterIndex + 1} quiz score:`, score);
    handleChapterComplete();
  };

  const currentChapter = chapters[currentChapterIndex];
  const progress = chapters.length > 0 ? ((currentChapterIndex + 1) / chapters.length) * 100 : 0;

  if (showProfileSetup) {
    return (
      <div className="immersive-learning-container">
        <ProfileSetup onComplete={handleProfileSetup} onBack={onBack} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="immersive-learning-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>正在解析内容并生成个性化学习材料...</p>
          <p className="loading-hint">这可能需要几分钟时间</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="immersive-learning-container">
        <div className="error-state">
          <h3>出错了</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={onBack}>返回</button>
        </div>
      </div>
    );
  }

  return (
    <div className="immersive-learning-container">
      {/* API配置模态框 */}
      <CpassApiConfigModal
        isOpen={showApiConfig}
        onClose={() => setShowApiConfig(false)}
        onSave={handleApiConfigSave}
      />

      {/* 顶部导航栏 */}
      <div className="immersive-header">
        <button className="back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          返回
        </button>

        <div className="header-info">
          <h2>{fileName}</h2>
          <div className="chapter-indicator">
            第 {currentChapterIndex + 1} 章 / 共 {chapters.length} 章
          </div>
        </div>

        <button className="api-config-btn" onClick={() => setShowApiConfig(true)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M16.25 10C16.25 10.625 16.875 11.25 17.5 11.25V13.75C16.875 13.75 16.25 14.375 16.25 15H13.75C13.75 14.375 13.125 13.75 12.5 13.75V11.25C13.125 11.25 13.75 10.625 13.75 10H16.25Z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          API配置
        </button>
      </div>

      {/* 进度条 */}
      <div className="progress-section">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="progress-text">{Math.round(progress)}% 完成</span>
      </div>

      {/* 视图切换标签 */}
      <div className="view-tabs">
        <button
          className={`view-tab ${currentView === 'content' ? 'active' : ''}`}
          onClick={() => setCurrentView('content')}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 4.5H15M3 9H15M3 13.5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          章节内容
        </button>
        <button
          className={`view-tab ${currentView === 'quiz' ? 'active' : ''}`}
          onClick={() => setCurrentView('quiz')}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 13.1421 4.85786 16.5 9 16.5Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 9.75V9C9 8.17157 9.67157 7.5 10.5 7.5C11.3284 7.5 12 6.82843 12 6C12 5.17157 11.3284 4.5 10.5 4.5C9.67157 4.5 9 5.17157 9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="9" cy="12.75" r="0.75" fill="currentColor"/>
          </svg>
          章节测验
        </button>
        <button
          className={`view-tab ${currentView === 'ppt' ? 'active' : ''}`}
          onClick={() => setCurrentView('ppt')}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2.25" y="3.75" width="13.5" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M6 7.5H12M6 10.5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          PPT讲解
        </button>
        <button
          className={`view-tab ${currentView === 'mindmap' ? 'active' : ''}`}
          onClick={() => setCurrentView('mindmap')}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 6.75V3M9 15V11.25M11.25 9H15M3 9H6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="9" cy="3" r="1.5" fill="currentColor"/>
            <circle cx="9" cy="15" r="1.5" fill="currentColor"/>
            <circle cx="15" cy="9" r="1.5" fill="currentColor"/>
            <circle cx="3" cy="9" r="1.5" fill="currentColor"/>
          </svg>
          思维导图
        </button>
      </div>

      {/* 主内容区域 */}
      <div className="immersive-content">
        {currentView === 'content' && currentChapter && (
          <ChapterContent
            chapter={currentChapter}
            onComplete={() => setCurrentView('quiz')}
          />
        )}
        {currentView === 'quiz' && currentChapter && (
          <ChapterQuiz
            chapter={currentChapter}
            onComplete={handleQuizComplete}
          />
        )}
        {currentView === 'ppt' && currentChapter && (
          <PPTPresentation chapter={currentChapter} />
        )}
        {currentView === 'mindmap' && (
          <MindMap chapters={chapters} currentChapterIndex={currentChapterIndex} />
        )}
      </div>

      {/* 底部导航 */}
      <div className="immersive-footer">
        <button
          className="nav-btn"
          onClick={() => setCurrentChapterIndex(Math.max(0, currentChapterIndex - 1))}
          disabled={currentChapterIndex === 0}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          上一章
        </button>

        <button
          className="nav-btn primary"
          onClick={handleChapterComplete}
          disabled={currentChapterIndex === chapters.length - 1}
        >
          下一章
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

// 用户画像设置组件
const ProfileSetup = ({ onComplete, onBack }) => {
  const [educationLevel, setEducationLevel] = useState('');
  const [interests, setInterests] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete({
      educationLevel,
      interests: interests.split(',').map(i => i.trim()).filter(i => i)
    });
  };

  return (
    <div className="profile-setup">
      <button className="back-btn-simple" onClick={onBack}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        返回
      </button>

      <div className="profile-setup-content">
        <h2>个性化学习设置</h2>
        <p className="profile-desc">
          告诉我们一些关于你的信息，我们将根据你的教育水平和兴趣爱好，为你定制最适合的学习内容。
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>教育水平</label>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              required
              className="form-select"
            >
              <option value="">请选择...</option>
              <option value="middle_school">初中</option>
              <option value="high_school">高中</option>
              <option value="undergraduate">本科</option>
              <option value="graduate">研究生</option>
              <option value="professional">专业人士</option>
            </select>
          </div>

          <div className="form-group">
            <label>兴趣爱好</label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="例如：科技、音乐、运动、历史（用逗号分隔）"
              className="form-input"
            />
            <span className="form-hint">我们会用你熟悉的例子来解释概念</span>
          </div>

          <button type="submit" className="btn-primary btn-large">
            开始学习之旅
          </button>
        </form>
      </div>
    </div>
  );
};

export default ImmersiveLearning;
