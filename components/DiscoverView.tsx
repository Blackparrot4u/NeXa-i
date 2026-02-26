import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Image as ImageIcon, Sparkles, Download, Share2, Trash2, Loader2 } from 'lucide-react';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

const INITIAL_IMAGES: GeneratedImage[] = [
  {
    id: 'img-1',
    url: 'https://storage.googleapis.com/aistudio-janus-prod-appspot/image-f22f7b82-f542-491a-965a-83863777f98e.png',
    prompt: 'A cute tiger cub resting in the forest',
    timestamp: Date.now() - 10000,
  },
  {
    id: 'img-2',
    url: 'https://storage.googleapis.com/aistudio-janus-prod-appspot/image-520635f7-63e8-42f1-bd69-80860362208f.png',
    prompt: 'Earth from space with a beautiful sunrise',
    timestamp: Date.now() - 20000,
  },
  {
    id: 'img-3',
    url: 'https://storage.googleapis.com/aistudio-janus-prod-appspot/image-07f07062-8e12-4217-a169-d9185a067f94.png',
    prompt: 'Futuristic armor variant concept art',
    timestamp: Date.now() - 30000,
  },
  {
    id: 'img-4',
    url: 'https://storage.googleapis.com/aistudio-janus-prod-appspot/image-0a56209e-108b-493a-8d19-482f76891009.png',
    prompt: 'A cute friendly ghost 3d render',
    timestamp: Date.now() - 40000,
  },
  {
    id: 'img-5',
    url: 'https://storage.googleapis.com/aistudio-janus-prod-appspot/image-5211d13c-7474-45e0-84a1-026d36e2978d.png',
    prompt: 'Abstract art showing chaos and sentiment',
    timestamp: Date.now() - 50000,
  },
  {
    id: 'img-6',
    url: 'https://storage.googleapis.com/aistudio-janus-prod-appspot/image-8317e082-774f-4a7b-a454-04663806a655.png',
    prompt: 'A spaceship flying through a colorful galaxy',
    timestamp: Date.now() - 60000,
  },
  {
    id: 'img-7',
    url: 'https://storage.googleapis.com/aistudio-janus-prod-appspot/image-91e84762-9214-4367-8631-011833d7b43b.png',
    prompt: 'A heart made of glowing circuit boards',
    timestamp: Date.now() - 70000,
  },
  {
    id: 'img-8',
    url: 'https://storage.googleapis.com/aistudio-janus-prod-appspot/image-3b3b4202-a165-4f32-a50e-5411c97a229a.png',
    prompt: 'Dream big silhouette art',
    timestamp: Date.now() - 80000,
  },
  {
    id: 'img-9',
    url: 'https://storage.googleapis.com/aistudio-janus-prod-appspot/image-c0e86b24-1f29-4328-b09e-7162985f403c.png',
    prompt: 'A hooded couple looking at each other',
    timestamp: Date.now() - 90000,
  }
];

export const DiscoverView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>(INITIAL_IMAGES);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/bytez/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const newImage: GeneratedImage = {
        id: Math.random().toString(36).substr(2, 9),
        url: data.output,
        prompt: prompt,
        timestamp: Date.now(),
      };

      setImages(prev => [newImage, ...prev]);
      setPrompt('');
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0a0a]">
      <div className="p-6 md:p-10 max-w-7xl mx-auto w-full flex-1 flex flex-col overflow-hidden">
        <header className="mb-10">
          <h2 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <ImageIcon className="h-8 w-8 text-cyan-400" />
            AI Image Studio
          </h2>
          <p className="text-slate-400">Create stunning visuals with Midjourney-powered AI</p>
        </header>

        <form onSubmit={handleGenerate} className="relative mb-12 group">
          <div className="absolute inset-0 bg-cyan-500/10 blur-2xl rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative flex items-center gap-4 bg-white/5 border border-white/10 rounded-3xl p-2 pl-6 focus-within:border-cyan-500/50 transition-all backdrop-blur-xl">
            <Search className="h-6 w-6 text-slate-500" />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-white text-lg placeholder-slate-500 py-4"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isGenerating || !prompt.trim()}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 px-8 py-4 rounded-2xl font-bold text-black flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate
                </>
              )}
            </motion.button>
          </div>
        </form>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {images.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-white/5 rounded-[40px]"
              >
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6">
                  <ImageIcon className="h-10 w-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No images yet</h3>
                <p className="text-slate-500 max-w-xs">Enter a prompt above to start creating your AI masterpiece</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                {images.map((img) => (
                  <motion.div
                    key={img.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/10"
                  >
                    <img
                      src={img.url}
                      alt={img.prompt}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <p className="text-white text-sm line-clamp-2 mb-4 font-medium">{img.prompt}</p>
                      <div className="flex items-center gap-2">
                        <button className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs font-bold">
                          <Download className="h-4 w-4" />
                          Save
                        </button>
                        <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2 rounded-xl transition-colors">
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(img.id)}
                          className="bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md text-red-400 p-2 rounded-xl transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
