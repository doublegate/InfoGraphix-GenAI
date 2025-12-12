import React from 'react';
import { X, Sparkles, ExternalLink, Cpu, Image as ImageIcon } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-6 border-b border-slate-700 flex justify-between items-start">
          <div className="flex items-center gap-3">
             <div className="bg-blue-500/20 p-3 rounded-xl">
               <Sparkles className="w-6 h-6 text-blue-400" />
             </div>
             <div>
               <h2 className="text-2xl font-bold text-white">About InfoGraphix AI</h2>
               <p className="text-sm text-slate-400">Powered by Google Gemini Models</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          <div className="space-y-4">
            <p className="text-slate-300 leading-relaxed">
              InfoGraphix AI is an advanced research and visualization tool designed to transform complex topics into professional-grade infographics instantly.
            </p>
            <p className="text-slate-300 leading-relaxed">
              It leverages a two-step generative process to ensure high accuracy and visual fidelity:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors">
              <div className="flex items-center gap-2 mb-2 text-blue-400 font-semibold">
                <Cpu className="w-5 h-5" />
                <span>Reasoning Engine</span>
              </div>
              <h3 className="text-white font-bold mb-1">Gemini 3 Pro Preview</h3>
              <p className="text-sm text-slate-400">
                Uses deep "Thinking" mode with a 32k token budget to research topics, verify facts via Google Search, and structure the data hierarchy.
              </p>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 hover:border-purple-500/30 transition-colors">
              <div className="flex items-center gap-2 mb-2 text-purple-400 font-semibold">
                <ImageIcon className="w-5 h-5" />
                <span>Visualization Engine</span>
              </div>
              <h3 className="text-white font-bold mb-1">Nano Banana Pro</h3>
              <p className="text-sm text-slate-400">
                (Gemini 3 Pro Image Preview) generates high-resolution (up to 4K) layouts, adhering to strict style and palette constraints.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
             <h4 className="text-sm font-semibold text-white mb-2">Capabilities</h4>
             <ul className="grid grid-cols-2 gap-2 text-sm text-slate-400">
               <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> URL & Repo Analysis</li>
               <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> 4K Resolution Output</li>
               <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Advanced GitHub Filtering</li>
               <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Version Control & Comparison</li>
             </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900 p-4 border-t border-slate-700 flex justify-between items-center">
          <p className="text-xs text-slate-500">
            Version 1.5.0 • Built with React & Google GenAI SDK
          </p>
          <a 
            href="https://ai.google.dev/gemini-api/docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            API Documentation <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
};

export default AboutModal;