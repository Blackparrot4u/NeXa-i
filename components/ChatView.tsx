import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message } from '../types';
import { ChatMessage } from './ChatMessage';
import { Zap } from 'lucide-react';

interface ChatViewProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({ messages, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
      <AnimatePresence initial={false}>
        {messages.map((msg, index) => (
          <ChatMessage key={`${index}-${msg.timestamp}`} message={msg} />
        ))}
      </AnimatePresence>
      
      {isLoading && (!messages.length || (messages[messages.length - 1]?.role !== 'model' || messages[messages.length - 1]?.content === '')) && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-4"
        >
          <div className="h-10 w-10 rounded-2xl bg-cyan-500/20 flex-shrink-0 flex items-center justify-center border border-cyan-500/30">
            <Zap className="h-5 w-5 text-cyan-400 animate-pulse" />
          </div>
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-3 bg-white/5 rounded-full w-1/3 animate-pulse"></div>
            <div className="h-3 bg-white/5 rounded-full w-1/2 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
