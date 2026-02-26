import React from 'react';
import { NexaLogoIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between p-4 md:px-8 border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <NexaLogoIcon className="h-10 w-10" />
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">NeXa</h1>
          <p className="text-xs text-slate-400">Shaping the Future</p>
        </div>
      </div>
      <nav className="hidden md:flex items-center gap-6">
        <a href="#" className="text-sm font-medium text-blue-400 border-b-2 border-blue-400 pb-1">Chat</a>
        <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">About</a>
        <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Contact</a>
      </nav>
    </header>
  );
};
