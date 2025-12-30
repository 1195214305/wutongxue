import React, { useState } from 'react';
import './PPTPresentation.css';

const PPTPresentation = ({ chapter }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = chapter.pptSlides || [];

  if (slides.length === 0) {
    return (
      <div className="ppt-empty">
        <p>本章节暂无PPT讲解</p>
      </div>
    );
  }

  const slide = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="ppt-presentation-container">
      <div className="ppt-controls-top">
        <div className="slide-counter">
          幻灯片 {currentSlide + 1} / {slides.length}
        </div>
        <div className="slide-thumbnails">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`thumbnail ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="ppt-slide">
        <div className="slide-content">
          <h2 className="slide-title">{slide.title}</h2>

          {slide.content && (
            <div className="slide-body">
              {slide.content.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          )}

          {slide.bulletPoints && slide.bulletPoints.length > 0 && (
            <ul className="slide-bullets">
              {slide.bulletPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          )}

          {slide.image && (
            <div className="slide-image">
              <img src={slide.image} alt={slide.title} />
            </div>
          )}

          {slide.notes && (
            <div className="slide-notes">
              <div className="notes-header">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 10.5V8M8 5.5H8.005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                讲解笔记
              </div>
              <p>{slide.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="ppt-controls-bottom">
        <button
          className="ppt-nav-btn"
          onClick={handlePrevious}
          disabled={currentSlide === 0}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          上一页
        </button>

        <div className="progress-indicator">
          <div className="progress-bar-ppt">
            <div
              className="progress-fill-ppt"
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            />
          </div>
        </div>

        <button
          className="ppt-nav-btn"
          onClick={handleNext}
          disabled={currentSlide === slides.length - 1}
        >
          下一页
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PPTPresentation;
