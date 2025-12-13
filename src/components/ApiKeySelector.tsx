import React, { useEffect, useState, useCallback } from 'react';
import { log } from '../utils/logger';
import { Key, Lock, ExternalLink } from 'lucide-react';

interface ApiKeySelectorProps {
  onReady: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onReady }) => {
  const [hasKey, setHasKey] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkKey = useCallback(async () => {
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
      if (selected) {
        onReady();
      }
    } else {
      // Fallback for environments where aistudio object might not be present (e.g. local dev mock)
      // For this specific challenge, we assume the environment supports it, but safety check:
      log.warn("window.aistudio not detected. Assuming API_KEY is set in env for development.");
      if (process.env.API_KEY) {
        setHasKey(true);
        onReady();
      }
    }
    setLoading(false);
  }, [onReady]);

  useEffect(() => {
    void checkKey();
  }, [checkKey]);

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Assume success after dialog interaction or re-check
      void checkKey();
    }
  };

  if (loading) return null;

  if (hasKey) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Key className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">API Key Required</h2>
        <p className="text-slate-400 mb-6 leading-relaxed">
          To use <strong>Gemini 3 Pro</strong> and generate <strong>4K images</strong>, you must select a paid API key from a Google Cloud Project with billing enabled.
        </p>
        
        <button
          onClick={() => void handleSelectKey()}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mb-4"
        >
          <Lock className="w-4 h-4" />
          Select API Key
        </button>

        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-slate-500 hover:text-blue-400 flex items-center justify-center gap-1 transition-colors"
        >
          View Billing Documentation <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default ApiKeySelector;
