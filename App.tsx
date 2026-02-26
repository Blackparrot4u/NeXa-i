import React, { useState, useEffect, useRef } from 'react';
import type { Chat } from '@google/genai';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Image as ImageIcon, Mic, Send, Plus, Home, Compass, Layout, TrendingUp, LogIn, X, Brain, Search, Globe } from 'lucide-react';
import { ChatView } from './components/ChatView';
import { MessageInput } from './components/MessageInput';
import { LiveVoiceView } from './components/LiveVoiceView';
import { DiscoverView } from './components/DiscoverView';
import type { Message } from './types';
import { Role } from './types';
import { createChatSession, createThinkingChatSession, analyzeImage, editImage } from './services/gemini';
import { 
  NexaLogoIcon, HomeIcon, DiscoverIcon, SpacesIcon, FinanceIcon, PlusIcon, 
  SignInIcon, AnalyzeIcon, PlanIcon, LocalIcon, SportsIcon, 
  AttachmentIcon, MicIcon, SendWaveIcon, BoltIcon
} from './components/icons';

const Sidebar: React.FC<{ 
  onNewChat: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}> = ({ onNewChat, activeTab, setActiveTab }) => (
  <aside className="w-20 md:w-64 bg-[#0d0d0d] flex flex-col p-4 border-r border-white/5 z-20">
    <div className="flex items-center justify-center md:justify-start gap-3 mb-10 px-2">
      <motion.div 
        whileHover={{ rotate: 180 }}
        transition={{ duration: 0.5 }}
      >
        <NexaLogoIcon className="h-10 w-10 flex-shrink-0" />
      </motion.div>
      <h1 className="text-2xl font-bold gradient-text hidden md:block">NeXa</h1>
    </div>
    
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        setActiveTab('Home');
        onNewChat();
      }} 
      className="flex items-center justify-center md:justify-start gap-3 w-full bg-white/5 hover:bg-white/10 p-3 rounded-xl mb-8 transition-all border border-white/5 shadow-lg"
    >
      <Plus className="h-5 w-5 text-cyan-400" />
      <span className="text-white font-medium hidden md:block">New Chat</span>
    </motion.button>

    <nav className="flex flex-col gap-2">
      {[
        { icon: Home, label: 'Home' },
        { icon: ImageIcon, label: 'Image Studio' },
      ].map((item, i) => (
        <motion.button 
          key={item.label}
          onClick={() => setActiveTab(item.label)}
          whileHover={{ x: 4 }}
          className={`flex items-center justify-center md:justify-start gap-4 p-3 rounded-xl transition-all ${activeTab === item.label ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
        >
          <item.icon className="h-5 w-5" />
          <span className="font-medium hidden md:block">{item.label}</span>
        </motion.button>
      ))}
    </nav>

    <div className="mt-auto">
      <a href="#" className="flex items-center justify-center md:justify-start gap-4 p-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all">
        <LogIn className="h-5 w-5" />
        <span className="font-medium hidden md:block">Sign In</span>
      </a>
    </div>
  </aside>
);

const WelcomeScreen: React.FC<{
  onSubmit: (e: React.FormEvent) => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  onSuggestionClick: (prompt: string) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isThinkingMode: boolean;
  onToggleThinking: () => void;
  isBytezMode: boolean;
  onToggleBytez: () => void;
  isSearchMode: boolean;
  onToggleSearch: () => void;
  onToggleLive: () => void;
  selectedImage: string | null;
  onRemoveImage: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}> = ({ 
  onSubmit, 
  value, 
  onChange, 
  isLoading, 
  onSuggestionClick, 
  onImageUpload, 
  isThinkingMode, 
  onToggleThinking,
  isBytezMode,
  onToggleBytez,
  isSearchMode,
  onToggleSearch,
  onToggleLive,
  selectedImage,
  onRemoveImage,
  fileInputRef
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full -z-10" />

      <div className="w-full max-w-3xl flex flex-col items-center z-10">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="mb-12"
        >
          <h1 className="text-7xl font-bold gradient-text tracking-tighter">NeXa</h1>
        </motion.div>
        
        <div className="w-full mb-6 flex justify-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleThinking}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all border ${isThinkingMode ? 'bg-purple-600 text-white border-purple-400 shadow-xl shadow-purple-500/20' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
          >
            <Sparkles className={`h-4 w-4 ${isThinkingMode ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-semibold tracking-wide uppercase">Thinking Mode</span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleBytez}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all border ${isBytezMode ? 'bg-emerald-600 text-white border-emerald-400 shadow-xl shadow-emerald-500/20' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
          >
            <Brain className={`h-4 w-4 ${isBytezMode ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-semibold tracking-wide uppercase">Gemini 3</span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleSearch}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all border ${isSearchMode ? 'bg-blue-600 text-white border-blue-400 shadow-xl shadow-blue-500/20' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
          >
            <Globe className={`h-4 w-4 ${isSearchMode ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-semibold tracking-wide uppercase">Search Mode</span>
          </motion.button>
        </div>

        <motion.form 
          layout
          onSubmit={onSubmit} 
          className="w-full glass-panel rounded-3xl p-5 shadow-2xl"
        >
          <AnimatePresence>
            {selectedImage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mb-4 relative inline-block group"
              >
                <img src={selectedImage} alt="Preview" className="h-28 w-28 object-cover rounded-2xl border border-white/20 shadow-xl" />
                <button 
                  type="button"
                  onClick={onRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-7 w-7 flex items-center justify-center text-lg shadow-xl hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="relative flex items-end gap-3">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={onChange}
              placeholder={isThinkingMode ? "Deep thinking enabled. Ask anything complex..." : "What's on your mind?"}
              disabled={isLoading}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
              className="flex-1 bg-transparent text-xl text-slate-100 placeholder-slate-500 focus:outline-none resize-none py-2 min-h-[44px]"
            />
            <div className="flex items-center gap-2 pb-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={onImageUpload}
                accept="image/*"
                className="hidden"
              />
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.9 }}
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-full text-slate-400 transition-colors"
              >
                <ImageIcon className="h-6 w-6" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.9 }}
                type="button" 
                onClick={onToggleLive}
                className="p-2.5 rounded-full text-slate-400 transition-colors"
              >
                <Mic className="h-6 w-6" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit" 
                disabled={isLoading || (!value.trim() && !selectedImage)} 
                className="p-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20"
              >
                <Send className="h-6 w-6 text-black" />
              </motion.button>
            </div>
          </div>
        </motion.form>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
          {[
            { label: 'Image Generation', icon: ImageIcon },
            { label: 'Analyze image', icon: AnalyzeIcon },
            { label: 'Question & Answer', icon: Sparkles },
            { label: 'Audio text-to-text', icon: MicIcon },
          ].map((suggestion, i) => (
            <motion.button 
              key={suggestion.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSuggestionClick(suggestion.label)} 
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/5 rounded-2xl text-sm font-medium text-slate-300 transition-all"
            >
              <suggestion.icon className="h-4 w-4 text-cyan-400"/>
              {suggestion.label}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.main>
  );
};

const App: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [isChatActive, setIsChatActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isBytezMode, setIsBytezMode] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isThinkingMode) {
      setChat(createThinkingChatSession());
    } else {
      setChat(createChatSession(isSearchMode, isBytezMode));
    }
  }, [isThinkingMode, isBytezMode, isSearchMode]);
  
  const handleNewChat = () => {
    setIsChatActive(false);
    setMessages([]);
    setInputValue('');
    setSelectedImage(null);
    if (isThinkingMode) {
      setChat(createThinkingChatSession());
    } else {
      setChat(createChatSession(isSearchMode, isBytezMode));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = async (messageText: string) => {
    if ((!messageText.trim() && !selectedImage) || isLoading || !chat) return;

    if (!isChatActive) {
      setMessages([]);
      setIsChatActive(true);
    }
    
    const userMessage: Message = {
      role: Role.User,
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: selectedImage || undefined,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    const currentImage = selectedImage;
    setSelectedImage(null);
    
    try {
      let modelResponse = '';
      const modelMessagePlaceholder: Message = {
        role: Role.Model,
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isThinking: isThinkingMode,
      };
      setMessages(prev => [...prev, modelMessagePlaceholder]);

      if (isBytezMode && messageText.toLowerCase().startsWith('qa:')) {
        const qaContent = messageText.replace(/qa:?/i, '').trim();
        const [context, question] = qaContent.split('|').map(s => s.trim());
        
        if (!context || !question) {
          modelResponse = "Please provide context and question in format: QA: [Context] | [Question]";
        } else {
          const response = await fetch('/api/bytez/qa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ context, question })
          });
          const data = await response.json();
          if (data.error) throw new Error(data.error);
          modelResponse = data.output;
        }

        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === Role.Model) {
            newMessages[newMessages.length - 1].content = modelResponse;
          }
          return newMessages;
        });
      } else if (currentImage) {
        const isEditing = messageText.toLowerCase().includes('edit') || 
                          messageText.toLowerCase().includes('add') || 
                          messageText.toLowerCase().includes('remove') ||
                          messageText.toLowerCase().includes('filter');
        
        const response = isEditing 
          ? await editImage(messageText, currentImage)
          : await analyzeImage(messageText, currentImage);

        for (const part of response.candidates[0].content.parts) {
          if (part.text) {
            modelResponse += part.text;
          } else if (part.inlineData) {
            const base64Data = part.inlineData.data;
            const imageUrl = `data:image/png;base64,${base64Data}`;
            setMessages(prev => {
              const newMessages = [...prev];
              if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === Role.Model) {
                newMessages[newMessages.length - 1].image = imageUrl;
              }
              return newMessages;
            });
          }
        }
        
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === Role.Model) {
            newMessages[newMessages.length - 1].content = modelResponse || (isEditing ? "Here is your edited image:" : "");
          }
          return newMessages;
        });
      } else {
        const stream = await chat.sendMessageStream({ message: messageText });
        for await (const chunk of stream) {
          const chunkText = chunk.text;
          modelResponse += chunkText;
          
          const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
          const sources = groundingChunks?.map((c: any) => ({
            title: c.web?.title || c.maps?.title || 'Source',
            url: c.web?.uri || c.maps?.uri || '#'
          })).filter((s: any) => s.url !== '#');

          setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === Role.Model) {
              newMessages[newMessages.length - 1].content = modelResponse;
              if (sources && sources.length > 0) {
                newMessages[newMessages.length - 1].sources = sources;
              }
            }
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: Role.Model,
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => {
         const newMessages = [...prev];
         if(newMessages.length > 0 && newMessages[newMessages.length - 1].role === Role.Model && newMessages[newMessages.length - 1].content === ''){
            newMessages[newMessages.length - 1] = errorMessage;
         } else {
            newMessages.push(errorMessage)
         }
         return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
    setInputValue('');
  };

  const handleSuggestionClick = (prompt: string) => {
    if (prompt === 'Image Generation') {
      setActiveTab('Image Studio');
      return;
    } else if (prompt === 'Question & Answer') {
      setIsBytezMode(true);
      setIsThinkingMode(false);
      setIsSearchMode(false);
    }
    
    let finalPrompt = prompt;
    if (prompt === 'Question & Answer') {
      finalPrompt = 'QA: My name is Simon and I live in London | Where do I live?';
    }

    setInputValue(finalPrompt);
    sendMessage(finalPrompt);
    setInputValue('');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans flex overflow-hidden">
      <Sidebar 
        onNewChat={handleNewChat} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      <AnimatePresence>
        {isLiveMode && (
          <LiveVoiceView onClose={() => setIsLiveMode(false)} />
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'Image Studio' ? (
            <motion.div
              key="image-studio"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-hidden"
            >
              <DiscoverView />
            </motion.div>
          ) : !isChatActive ? (
            <WelcomeScreen
              key="welcome"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              onSuggestionClick={handleSuggestionClick}
              onImageUpload={handleImageUpload}
              isThinkingMode={isThinkingMode}
              onToggleThinking={() => setIsThinkingMode(!isThinkingMode)}
              isBytezMode={isBytezMode}
              onToggleBytez={() => {
                setIsBytezMode(!isBytezMode);
                if (!isBytezMode) {
                  setIsThinkingMode(false);
                  setIsSearchMode(false);
                }
              }}
              isSearchMode={isSearchMode}
              onToggleSearch={() => {
                setIsSearchMode(!isSearchMode);
                if (!isSearchMode) {
                  setIsThinkingMode(false);
                  setIsBytezMode(false);
                }
              }}
              onToggleLive={() => setIsLiveMode(true)}
              selectedImage={selectedImage}
              onRemoveImage={() => setSelectedImage(null)}
              fileInputRef={fileInputRef}
            />
          ) : (
            <motion.main 
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center p-4 md:p-6 overflow-hidden"
            >
              <div className="w-full max-w-5xl flex-1 flex flex-col glass-panel rounded-3xl overflow-hidden">
                <ChatView messages={messages} isLoading={isLoading} />
                <MessageInput
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onSubmit={handleFormSubmit}
                  isLoading={isLoading}
                  onImageUpload={handleImageUpload}
                  isThinkingMode={isThinkingMode}
                  onToggleThinking={() => setIsThinkingMode(!isThinkingMode)}
                  isBytezMode={isBytezMode}
                  onToggleBytez={() => setIsBytezMode(!isBytezMode)}
                  selectedImage={selectedImage}
                  onRemoveImage={() => setSelectedImage(null)}
                  fileInputRef={fileInputRef}
                />
              </div>
            </motion.main>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;