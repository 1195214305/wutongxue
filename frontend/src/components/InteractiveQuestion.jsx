import React, { useState } from 'react';
import './InteractiveQuestion.css';

const InteractiveQuestion = ({ question, onAnswer }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleOptionSelect = (optionIndex) => {
    if (showResult) return;
    setSelectedOption(optionIndex);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;

    const correct = selectedOption === question.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      onAnswer(correct);
    }, 2000);
  };

  return (
    <div className="interactive-question-container">
      <div className="question-card">
        {/* 问题标题 */}
        <div className="question-header">
          <div className="question-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h3>互动问题</h3>
        </div>

        {/* 问题内容 */}
        <div className="question-content">
          <p className="question-text">{question.question}</p>

          {/* 选项列表 */}
          <div className="options-list">
            {question.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrectOption = index === question.correctAnswer;
              const showCorrect = showResult && isCorrectOption;
              const showWrong = showResult && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  className={`option-btn ${isSelected ? 'selected' : ''} ${showCorrect ? 'correct' : ''} ${showWrong ? 'wrong' : ''}`}
                  onClick={() => handleOptionSelect(index)}
                  disabled={showResult}
                >
                  <span className="option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="option-text">{option}</span>
                  {showCorrect && (
                    <svg className="result-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M16.25 5L7.5 13.75L3.75 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {showWrong && (
                    <svg className="result-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* 提交按钮 */}
          {!showResult && (
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={selectedOption === null}
            >
              提交答案
            </button>
          )}

          {/* 结果反馈 */}
          {showResult && (
            <div className={`result-feedback ${isCorrect ? 'correct' : 'wrong'}`}>
              <div className="feedback-icon">
                {isCorrect ? (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14" fill="currentColor" opacity="0.1"/>
                    <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2"/>
                    <path d="M22 11L13.5 19.5L10 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14" fill="currentColor" opacity="0.1"/>
                    <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2"/>
                    <path d="M20 12L12 20M12 12L20 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="feedback-content">
                <h4>{isCorrect ? '回答正确！' : '回答错误'}</h4>
                <p className="feedback-explanation">{question.explanation}</p>
              </div>
            </div>
          )}
        </div>

        {/* 提示信息 */}
        {!showResult && question.hint && (
          <div className="question-hint">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 10.5V8M8 5.5H8.005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>提示：{question.hint}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveQuestion;
