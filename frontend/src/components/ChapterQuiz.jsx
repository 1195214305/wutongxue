import React, { useState } from 'react';
import './ChapterQuiz.css';

const ChapterQuiz = ({ chapter, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const questions = chapter.quiz || [];
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    if (showResults) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateScore();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });
    const finalScore = (correctCount / questions.length) * 100;
    setScore(finalScore);
    setShowResults(true);
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  if (questions.length === 0) {
    return (
      <div className="quiz-empty">
        <p>本章节暂无测验</p>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="quiz-results">
        <div className="results-card">
          <div className="results-header">
            <div className="score-circle">
              <svg className="score-ring" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#E8D9CE" strokeWidth="8"/>
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#7A5C48"
                  strokeWidth="8"
                  strokeDasharray={`${(score / 100) * 339.292} 339.292`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="score-text">
                <span className="score-number">{Math.round(score)}</span>
                <span className="score-label">分</span>
              </div>
            </div>
            <h2>测验完成！</h2>
            <p className="results-summary">
              你答对了 {questions.filter((q, i) => selectedAnswers[i] === q.correctAnswer).length} / {questions.length} 题
            </p>
          </div>

          <div className="results-details">
            {questions.map((q, index) => {
              const isCorrect = selectedAnswers[index] === q.correctAnswer;
              return (
                <div key={index} className={`result-item ${isCorrect ? 'correct' : 'wrong'}`}>
                  <div className="result-icon">
                    {isCorrect ? (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M16.25 5L7.5 13.75L3.75 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="result-content">
                    <p className="result-question">问题 {index + 1}: {q.question}</p>
                    <p className="result-answer">
                      你的答案: {q.options[selectedAnswers[index]]}
                      {!isCorrect && ` (正确答案: ${q.options[q.correctAnswer]})`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="results-actions">
            <button className="action-btn secondary" onClick={handleRetry}>
              重新测验
            </button>
            <button className="action-btn primary" onClick={() => onComplete(score)}>
              继续学习
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chapter-quiz-container">
      <div className="quiz-header">
        <h2>章节测验</h2>
        <div className="quiz-progress">
          <span>问题 {currentQuestionIndex + 1} / {questions.length}</span>
          <div className="progress-dots">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`dot ${index === currentQuestionIndex ? 'active' : ''} ${selectedAnswers[index] !== undefined ? 'answered' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="quiz-question">
        <h3>{currentQuestion.question}</h3>
        <div className="quiz-options">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              className={`quiz-option ${selectedAnswers[currentQuestionIndex] === index ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-navigation">
        <button
          className="nav-btn secondary"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          上一题
        </button>
        <button
          className="nav-btn primary"
          onClick={handleNext}
          disabled={selectedAnswers[currentQuestionIndex] === undefined}
        >
          {currentQuestionIndex === questions.length - 1 ? '提交测验' : '下一题'}
        </button>
      </div>
    </div>
  );
};

export default ChapterQuiz;
