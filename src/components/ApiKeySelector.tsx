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
        log.info("API Key ready via AI Studio");
        onReady();
      }
    } else {
      // Fallback for local development (npm run dev / npm run preview)
      log.warn("window.aistudio not detected - running in local development mode");

      // Check for API key in environment
      const apiKey = process.env.API_KEY;
      const hasValidKey = apiKey && apiKey !== 'undefined' && apiKey.trim().length > 0;

      log.info("Local dev API key check:", {
        hasKey: !!apiKey,
        keyType: typeof apiKey,
        keyLength: apiKey ? apiKey.length : 0,
        isValidFormat: hasValidKey
      });

      if (hasValidKey) {
        setHasKey(true);
        log.info("API Key configured for local development");
        onReady();
      } else {
        log.error("No API key found. Ensure GEMINI_API_KEY is set in .env.local and rebuild with 'npm run build'");
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

  // Determine if running in local dev (no aistudio interface)
  const isLocalDev = !window.aistudio;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Key className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">API Key Required</h2>

        {isLocalDev ? (
          <>
            <p className="text-slate-400 mb-4 leading-relaxed">
              Running in <strong className="text-amber-400">local development mode</strong>. To use Gemini APIs:
            </p>
            <ol className="text-left text-sm text-slate-400 mb-6 space-y-2 bg-slate-800/50 rounded-lg p-4">
              <li>1. Create <code className="text-blue-400">.env.local</code> in project root</li>
              <li>2. Add: <code className="text-green-400">GEMINI_API_KEY=your-api-key</code></li>
              <li>3. Rebuild: <code className="text-yellow-400">npm run build</code></li>
              <li>4. Restart: <code className="text-yellow-400">npm run preview</code></li>
            </ol>
          </>
        ) : (
          <p className="text-slate-400 mb-6 leading-relaxed">
            To use <strong>Gemini 3 Pro</strong> and generate <strong>4K images</strong>, you must select a paid API key from a Google Cloud Project with billing enabled.
          </p>
        )}

        {!isLocalDev && (
          <button
            onClick={() => void handleSelectKey()}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mb-4"
          >
            <Lock className="w-4 h-4" />
            Select API Key
          </button>
        )}

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
