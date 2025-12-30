import React, { useState } from 'react';
import './MindMap.css';

const MindMap = ({ chapters, currentChapterIndex }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set([0]));

  const toggleNode = (index) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    setExpandedNodes(new Set(chapters.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set([currentChapterIndex]));
  };

  return (
    <div className="mindmap-container">
      <div className="mindmap-header">
        <h2>知识结构导图</h2>
        <div className="mindmap-controls">
          <button className="control-btn" onClick={expandAll}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            全部展开
          </button>
          <button className="control-btn" onClick={collapseAll}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            全部折叠
          </button>
        </div>
      </div>

      <div className="mindmap-content">
        <div className="mindmap-tree">
          {chapters.map((chapter, chapterIndex) => {
            const isExpanded = expandedNodes.has(chapterIndex);
            const isCurrent = chapterIndex === currentChapterIndex;

            return (
              <div key={chapterIndex} className="tree-node">
                <div
                  className={`node-header ${isCurrent ? 'current' : ''}`}
                  onClick={() => toggleNode(chapterIndex)}
                >
                  <button className="expand-btn">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      style={{
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div className="node-icon chapter-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M7 7H13M7 10H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="node-content">
                    <h3>第 {chapterIndex + 1} 章</h3>
                    <p>{chapter.title}</p>
                  </div>
                </div>

                {isExpanded && (
                  <div className="node-children">
                    {/* 章节概要 */}
                    {chapter.summary && (
                      <div className="child-node summary-node">
                        <div className="node-icon">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M8 10.5V8M8 5.5H8.005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <div className="child-content">
                          <span className="child-label">概要</span>
                          <p>{chapter.summary}</p>
                        </div>
                      </div>
                    )}

                    {/* 关键概念 */}
                    {chapter.keyConcepts && chapter.keyConcepts.length > 0 && (
                      <div className="child-node concepts-node">
                        <div className="node-icon">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 2L10.5 7H13.5L11 10.5L12.5 14L8 11.5L3.5 14L5 10.5L2.5 7H5.5L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="child-content">
                          <span className="child-label">关键概念</span>
                          <ul className="concepts-list">
                            {chapter.keyConcepts.map((concept, i) => (
                              <li key={i}>{concept}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* 段落列表 */}
                    {chapter.paragraphs && chapter.paragraphs.length > 0 && (
                      <div className="child-node paragraphs-node">
                        <div className="node-icon">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 4H13M3 8H13M3 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <div className="child-content">
                          <span className="child-label">内容结构</span>
                          <ul className="paragraphs-list">
                            {chapter.paragraphs.map((para, i) => (
                              <li key={i}>
                                {para.subtitle || `段落 ${i + 1}`}
                                {para.question && (
                                  <span className="has-question">含互动问题</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MindMap;
