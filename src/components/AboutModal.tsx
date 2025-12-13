import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sparkles, ExternalLink, Cpu, Image as ImageIcon } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

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
               <h2 className="text-2xl font-bold text-white">{t('about.title')}</h2>
               <p className="text-sm text-slate-400">{t('about.subtitle')}</p>
             </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 p-2 rounded-lg transition-colors"
            aria-label={t('about.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">

          <div className="space-y-4">
            <p className="text-slate-300 leading-relaxed">
              {t('about.description1')}
            </p>
            <p className="text-slate-300 leading-relaxed">
              {t('about.description2')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors">
              <div className="flex items-center gap-2 mb-2 text-blue-400 font-semibold">
                <Cpu className="w-5 h-5" />
                <span>{t('about.reasoningEngine')}</span>
              </div>
              <h3 className="text-white font-bold mb-1">{t('about.reasoningTitle')}</h3>
              <p className="text-sm text-slate-400">
                {t('about.reasoningDesc')}
              </p>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 hover:border-purple-500/30 transition-colors">
              <div className="flex items-center gap-2 mb-2 text-purple-400 font-semibold">
                <ImageIcon className="w-5 h-5" />
                <span>{t('about.visualizationEngine')}</span>
              </div>
              <h3 className="text-white font-bold mb-1">{t('about.visualizationTitle')}</h3>
              <p className="text-sm text-slate-400">
                {t('about.visualizationDesc')}
              </p>
            </div>
          </div>

          <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
             <h4 className="text-sm font-semibold text-white mb-2">{t('about.capabilities')}</h4>
             <ul className="grid grid-cols-2 gap-2 text-sm text-slate-400">
               <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> {t('about.capability1')}</li>
               <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> {t('about.capability2')}</li>
               <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> {t('about.capability3')}</li>
               <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> {t('about.capability4')}</li>
             </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900 p-4 border-t border-slate-700 flex justify-between items-center">
          <p className="text-xs text-slate-500">
            {t('about.version')} 2.1.0 • {t('about.footer')}
          </p>
          <a
            href="https://ai.google.dev/gemini-api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            {t('about.apiDocs')} <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
};

export default AboutModal;