import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message } from '../types';
import { Role } from '../types';
import { Sparkles, User, Zap, Search } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ModelMessage: React.FC<{ message: Message }> = ({ message }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-start gap-4 mb-6"
  >
    <div className={`flex-shrink-0 h-10 w-10 rounded-2xl ${message.isThinking ? 'bg-purple-600 shadow-purple-500/40' : 'bg-cyan-500 shadow-cyan-500/40'} flex items-center justify-center shadow-lg`}>
      {message.isThinking ? <Sparkles className="h-5 w-5 text-white" /> : <Zap className="h-5 w-5 text-black" />}
    </div>
    <div className="flex flex-col items-start max-w-[85%]">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl rounded-tl-none px-5 py-4 shadow-xl">
        {message.isThinking && (
          <div className="flex items-center gap-2 mb-3 text-purple-400 text-xs font-bold uppercase tracking-widest">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            Thinking Process
          </div>
        )}
        {message.image && (
          <div className="mb-4">
            <img src={message.image} alt="Generated" className="max-w-full rounded-xl border border-white/10 shadow-lg" />
          </div>
        )}
        <p className="text-[15px] leading-relaxed text-slate-200 whitespace-pre-wrap selection:bg-cyan-500/30">{message.content}</p>
        
        {message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Sources</p>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source, i) => (
                <a 
                  key={i} 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-cyan-400 transition-all flex items-center gap-1"
                >
                  <Search className="h-3 w-3" />
                  {source.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      <span className="text-[10px] font-medium text-slate-500 mt-2 ml-1 uppercase tracking-wider">{message.timestamp}</span>
    </div>
  </motion.div>
);

const UserMessage: React.FC<{ message: Message }> = ({ message }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-start gap-4 justify-end mb-6"
  >
    <div className="flex flex-col items-end max-w-[85%]">
      <div className="bg-cyan-500 rounded-2xl rounded-tr-none px-5 py-4 shadow-lg shadow-cyan-500/20">
        {message.image && (
          <div className="mb-3">
            <img src={message.image} alt="Uploaded" className="max-w-full rounded-xl border border-white/20 shadow-md" />
          </div>
        )}
        <p className="text-[15px] leading-relaxed text-black font-medium whitespace-pre-wrap">{message.content}</p>
      </div>
      <span className="text-[10px] font-medium text-slate-500 mt-2 mr-1 uppercase tracking-wider">{message.timestamp}</span>
    </div>
    <div className="flex-shrink-0 h-10 w-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-lg">
      <User className="h-5 w-5 text-slate-300" />
    </div>
  </motion.div>
);

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  if (message.role === Role.Model) {
    return <ModelMessage message={message} />;
  }
  return <UserMessage message={message} />;
};
