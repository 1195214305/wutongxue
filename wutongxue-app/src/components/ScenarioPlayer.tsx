import React, { useState, useEffect, useRef } from 'react';
import { Message, demoScenario } from '../data/demoScenario';
import { ChatBubble } from './ChatBubble';
import { Play, RotateCcw, ChevronRight } from 'lucide-react';

export const ScenarioPlayer: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedMessages]);

  const handleNext = () => {
    if (currentStep < demoScenario.length) {
      setDisplayedMessages([...displayedMessages, demoScenario[currentStep]]);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setDisplayedMessages([]);
  };

  const isFinished = currentStep >= demoScenario.length;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto">
      
      {/* Dialogue Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-4 scrollbar-hide">
        {displayedMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-stone-400">
            <p className="font-serif italic text-lg mb-4">"Learning begins with a conversation."</p>
            <button 
              onClick={handleNext}
              className="px-6 py-2 bg-brand-800 text-white rounded-full hover:bg-brand-900 transition-colors flex items-center space-x-2 shadow-lg"
            >
              <Play size={16} fill="currentColor" />
              <span>Start Scenario</span>
            </button>
          </div>
        )}
        
        {displayedMessages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Controls Area */}
      <div className="h-24 border-t border-stone-200 bg-paper/80 backdrop-blur-md flex items-center justify-center px-4">
        {displayedMessages.length > 0 && (
          <div className="flex space-x-4 w-full max-w-2xl justify-center">
            {!isFinished ? (
              <button 
                onClick={handleNext}
                className="w-full py-4 bg-stone-900 text-white rounded-xl shadow-xl hover:bg-black transition-all transform active:scale-[0.99] flex items-center justify-center space-x-2 group"
              >
                <span className="font-sans font-medium tracking-wide">CONTINUE</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button 
                onClick={handleReset}
                className="px-8 py-3 bg-stone-200 text-stone-600 rounded-xl hover:bg-stone-300 transition-colors flex items-center space-x-2"
              >
                <RotateCcw size={18} />
                <span>Replay</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
