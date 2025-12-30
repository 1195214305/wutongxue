import React, { useState, useEffect } from 'react';
import InteractiveQuestion from './InteractiveQuestion';
import './ChapterContent.css';

const ChapterContent = ({ chapter, onComplete }) => {
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);

  useEffect(() => {
    // 检查是否所有问题都已回答
    const totalQuestions = chapter.paragraphs.filter(p => p.question).length;
    setAllQuestionsAnswered(answeredQuestions.size === totalQuestions);
  }, [answeredQuestions, chapter]);

  const currentParagraph = chapter.paragraphs[currentParagraphIndex];
  const hasQuestion = currentParagraph?.question;

  const handleNextParagraph = () => {
    if (hasQuestion && !answeredQuestions.has(currentParagraphIndex)) {
      setShowQuestion(true);
    } else {
      moveToNextParagraph();
    }
  };

  const moveToNextParagraph = () => {
    if (currentParagraphIndex < chapter.paragraphs.length - 1) {
      setCurrentParagraphIndex(currentParagraphIndex + 1);
      setShowQuestion(false);
    }
  };

  const handleQuestionAnswer = (isCorrect) => {
    setAnsweredQuestions(new Set([...answeredQuestions, currentParagraphIndex]));
    setTimeout(() => {
      moveToNextParagraph();
    }, 1500);
  };

  const handleJumpToParagraph = (index) => {
    setCurrentParagraphIndex(index);
    setShowQuestion(false);
  };

  const progress = ((currentParagraphIndex + 1) / chapter.paragraphs.length) * 100;

  return (
    <div className="chapter-content-container">
      {/* 章节标题 */}
      <div className="chapter-header">
        <h1 className="chapter-title">{chapter.title}</h1>
        <p className="chapter-summary">{chapter.summary}</p>
      </div>

      {/* 阅读进度 */}
      <div className="reading-progress">
        <div className="progress-info">
          <span>阅读进度</span>
          <span className="progress-percentage">{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar-thin">
          <div className="progress-fill-thin" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* 段落导航 */}
      <div className="paragraph-nav">
        {chapter.paragraphs.map((para, index) => (
          <button
            key={index}
            className={`para-nav-btn ${index === currentParagraphIndex ? 'active' : ''} ${answeredQuestions.has(index) ? 'completed' : ''}`}
            onClick={() => handleJumpToParagraph(index)}
            title={`段落 ${index + 1}${para.question ? ' (含问题)' : ''}`}
          >
            {index + 1}
            {para.question && (
              <span className="question-indicator">
                {answeredQuestions.has(index) ? '✓' : '?'}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 主内容区 */}
      <div className="content-main">
        {!showQuestion ? (
          <div className="paragraph-content">
            {/* 段落标题 */}
            {currentParagraph.subtitle && (
              <h3 className="paragraph-subtitle">{currentParagraph.subtitle}</h3>
            )}

            {/* 段落内容 */}
            <div className="paragraph-text">
              {currentParagraph.content.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>

            {/* 重写的例子（如果有） */}
            {currentParagraph.rewrittenExample && (
              <div className="rewritten-example">
                <div className="example-header">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M10 14V10M10 6H10.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span>个性化例子</span>
                </div>
                <div className="example-content">
                  {currentParagraph.rewrittenExample}
                </div>
              </div>
            )}

            {/* 关键概念高亮（如果有） */}
            {currentParagraph.keyConcepts && currentParagraph.keyConcepts.length > 0 && (
              <div className="key-concepts">
                <h4>关键概念</h4>
                <div className="concepts-list">
                  {currentParagraph.keyConcepts.map((concept, index) => (
                    <div key={index} className="concept-item">
                      <span className="concept-term">{concept.term}</span>
                      <span className="concept-definition">{concept.definition}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 导航按钮 */}
            <div className="paragraph-actions">
              <button
                className="action-btn secondary"
                onClick={() => setCurrentParagraphIndex(Math.max(0, currentParagraphIndex - 1))}
                disabled={currentParagraphIndex === 0}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M11.25 13.5L6.75 9L11.25 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                上一段
              </button>

              <button
                className="action-btn primary"
                onClick={handleNextParagraph}
              >
                {hasQuestion && !answeredQuestions.has(currentParagraphIndex) ? (
                  <>
                    回答问题
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M9 9.75V9C9 8.17157 9.67157 7.5 10.5 7.5C11.3284 7.5 12 6.82843 12 6C12 5.17157 11.3284 4.5 10.5 4.5C9.67157 4.5 9 5.17157 9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <circle cx="9" cy="12.75" r="0.75" fill="currentColor"/>
                    </svg>
                  </>
                ) : currentParagraphIndex === chapter.paragraphs.length - 1 ? (
                  <>
                    完成章节
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M15 4.5L6.75 12.75L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                ) : (
                  <>
                    下一段
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M6.75 4.5L11.25 9L6.75 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <InteractiveQuestion
            question={currentParagraph.question}
            onAnswer={handleQuestionAnswer}
          />
        )}
      </div>

      {/* 完成提示 */}
      {currentParagraphIndex === chapter.paragraphs.length - 1 && allQuestionsAnswered && (
        <div className="completion-banner">
          <div className="completion-content">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#7A5C48"/>
              <path d="M16 9L10.5 14.5L8 12" stroke="#FAF7F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <h4>章节完成！</h4>
              <p>你已经完成了本章节的所有内容和问题</p>
            </div>
            <button className="btn-complete" onClick={onComplete}>
              进入章节测验
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterContent;
