import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Volume2, VolumeX } from 'lucide-react';
import { connectLive } from '../services/gemini';

interface LiveVoiceViewProps {
  onClose: () => void;
}

export const LiveVoiceView: React.FC<LiveVoiceViewProps> = ({ onClose }) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueue = useRef<Int16Array[]>([]);
  const isPlaying = useRef(false);

  useEffect(() => {
    const startSession = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        const audioContext = new AudioContext({ sampleRate: 16000 });
        audioContextRef.current = audioContext;

        const session = await connectLive({
          onopen: () => {
            setIsConnecting(false);
            setIsRecording(true);
          },
          onmessage: async (message: any) => {
            if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
              const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
              const binaryString = atob(base64Audio);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const pcmData = new Int16Array(bytes.buffer);
              audioQueue.current.push(pcmData);
              if (!isPlaying.current) {
                playNextInQueue();
              }
            }
            
            if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
              setTranscript(prev => prev + ' ' + message.serverContent.modelTurn.parts[0].text);
            }

            if (message.serverContent?.interrupted) {
              audioQueue.current = [];
              isPlaying.current = false;
            }
          },
          onerror: (err: any) => {
            console.error('Live API Error:', err);
            setError('Connection error. Please try again.');
          },
          onclose: () => {
            onClose();
          }
        });
        
        sessionRef.current = session;

        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (!isRecording || isMuted) return;
          
          const inputData = e.inputBuffer.getChannelData(0);
          // Convert Float32 to Int16
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
          }
          
          const buffer = pcmData.buffer;
          const bytes = new Uint8Array(buffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64Data = btoa(binary);

          session.sendRealtimeInput({
            media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
          });
        };

        source.connect(processor);
        processor.connect(audioContext.destination);

      } catch (err: any) {
        console.error('Microphone access error:', err);
        setError('Microphone access denied or not supported.');
        setIsConnecting(false);
      }
    };

    startSession();

    return () => {
      cleanup();
    };
  }, []);

  const playNextInQueue = () => {
    if (audioQueue.current.length === 0 || !audioContextRef.current) {
      isPlaying.current = false;
      return;
    }

    isPlaying.current = true;
    const pcmData = audioQueue.current.shift()!;
    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      floatData[i] = pcmData[i] / 0x7FFF;
    }

    const buffer = audioContextRef.current.createBuffer(1, floatData.length, 16000);
    buffer.getChannelData(0).set(floatData);
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = playNextInQueue;
    source.start();
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (sessionRef.current) {
      sessionRef.current.close();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
    >
      <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-[32px] p-8 relative overflow-hidden shadow-2xl">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 blur-3xl animate-pulse" />
        </div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 transition-all"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-8 relative">
            <motion.div 
              animate={isRecording && !isMuted ? {
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full"
            />
            <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isMuted ? 'border-red-500/50 bg-red-500/10' : 'border-cyan-500/50 bg-cyan-500/10'}`}>
              {isMuted ? (
                <MicOff className="h-10 w-10 text-red-400" />
              ) : (
                <Mic className={`h-10 w-10 text-cyan-400 ${isRecording ? 'animate-pulse' : ''}`} />
              )}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {isConnecting ? 'Connecting...' : isMuted ? 'Microphone Muted' : 'Listening...'}
          </h2>
          <p className="text-slate-400 mb-8 max-w-xs">
            {error || (isConnecting ? 'Setting up secure voice channel' : 'Speak naturally, NeXa is listening')}
          </p>

          <div className="w-full bg-white/5 rounded-2xl p-4 min-h-[100px] mb-8 text-left border border-white/5">
            <p className="text-sm text-slate-500 uppercase tracking-widest font-bold mb-2">Transcript</p>
            <p className="text-slate-300 italic">
              {transcript || 'NeXa\'s response will appear here...'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMute}
              className={`p-4 rounded-2xl transition-all border ${isMuted ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-slate-400'}`}
            >
              {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-8 py-4 rounded-2xl bg-white text-black font-bold transition-all hover:bg-slate-200"
            >
              End Conversation
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
