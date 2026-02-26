import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Sparkles, X, Brain } from 'lucide-react';

interface MessageInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isThinkingMode: boolean;
  onToggleThinking: () => void;
  isBytezMode: boolean;
  onToggleBytez: () => void;
  selectedImage: string | null;
  onRemoveImage: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  value, 
  onChange, 
  onSubmit, 
  isLoading, 
  onImageUpload, 
  isThinkingMode, 
  onToggleThinking,
  isBytezMode,
  onToggleBytez,
  selectedImage,
  onRemoveImage,
  fileInputRef
}) => {
  return (
    <div className="p-4 md:p-6 bg-black/20 backdrop-blur-md border-t border-white/5">
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="mb-4 relative inline-block group"
          >
            <img src={selectedImage} alt="Preview" className="h-24 w-24 object-cover rounded-2xl border border-white/10 shadow-2xl" />
            <button 
              onClick={onRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-7 w-7 flex items-center justify-center shadow-xl hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <form onSubmit={onSubmit} className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImageUpload}
            accept="image/*"
            className="hidden"
          />
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl text-slate-400 transition-colors"
            title="Upload Image"
          >
            <Paperclip className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={onToggleThinking}
            className={`p-3 rounded-xl transition-all ${isThinkingMode ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:bg-white/5'}`}
            title="Thinking Mode"
          >
            <Sparkles className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={onToggleBytez}
            className={`p-3 rounded-xl transition-all ${isBytezMode ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-white/5'}`}
            title="GPT-4.1-mini"
          >
            <Brain className="h-5 w-5" />
          </motion.button>
        </div>
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={isBytezMode ? "GPT-4.1-mini active..." : (isThinkingMode ? "Deep thinking enabled..." : "Type a message...")}
            disabled={isLoading}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isLoading || (!value.trim() && !selectedImage)}
          className="h-12 w-12 flex items-center justify-center bg-cyan-500 rounded-2xl text-black disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 flex-shrink-0"
        >
          <Send className="h-5 w-5" />
        </motion.button>
      </form>
    </div>
  );
};
