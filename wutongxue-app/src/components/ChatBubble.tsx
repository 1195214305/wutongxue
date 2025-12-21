import React from 'react';
import { motion } from 'framer-motion';
import { Message } from '../data/demoScenario';
import { User, Bot, Terminal } from 'lucide-react';

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center my-6"
      >
        <div className="flex items-center space-x-2 text-stone-500 text-sm bg-stone-100 px-3 py-1 rounded-full font-mono border border-stone-200">
          <Terminal size={12} />
          <span>{message.content}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[80%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar Area */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-4' : 'mr-4'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
            isUser ? 'bg-stone-200 border-stone-300' : 'bg-brand-800 text-white border-brand-900'
          }`}>
            {isUser ? <User size={18} className="text-stone-600" /> : <Bot size={18} />}
          </div>
        </div>

        {/* Content Area */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`text-xs mb-1 font-bold tracking-wider text-stone-400 uppercase ${isUser ? 'text-right' : 'text-left'}`}>
            {isUser ? 'LEARNER' : 'MENTOR'}
          </div>
          
          <div className={`p-6 shadow-sm border ${
            isUser 
              ? 'bg-white rounded-2xl rounded-tr-sm border-stone-100' 
              : 'bg-white rounded-2xl rounded-tl-sm border-stone-200'
          }`}>
            <p className={`text-base leading-relaxed ${isUser ? 'text-stone-700 font-sans' : 'text-ink font-serif'}`}>
              {message.content}
            </p>
            {message.image && (
              <div className="mt-4 rounded-lg overflow-hidden border border-stone-100">
                <img src={message.image} alt="Context" className="w-full h-auto" />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
