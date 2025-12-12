import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { Layers, Github, Globe, History as HistoryIcon, Info, List as ListIcon, BookTemplate, Contrast } from 'lucide-react';
import ApiKeySelector from './components/ApiKeySelector';
import InfographicForm from './components/InfographicForm';
import ProcessingState from './components/ProcessingState';
import InfographicResult from './components/InfographicResult';
import AboutModal from './components/AboutModal';
import SkipLink from './components/SkipLink';
import LanguageSelector from './components/LanguageSelector';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import { TemplateBrowser } from './components/TemplateManager';
import { analyzeTopic, generateInfographicImage } from './services/geminiService';
import { AspectRatio, GeneratedInfographic, ImageSize, GithubFilters, SavedVersion, Feedback, InfographicStyle, ColorPalette, TemplateConfig } from './types';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAnnouncer } from './hooks/useAnnouncer';
import { useHighContrast } from './hooks/useHighContrast';

// Lazy load heavy modal components for better code splitting
// Note: TemplateBrowser is statically imported (used by InfographicForm)
const VersionHistory = lazy(() => import('./components/VersionHistory'));
const BatchManager = lazy(() => import('./components/BatchGeneration/BatchManager'));

function App() {
  const { t } = useTranslation();
  const { announce } = useAnnouncer();
  const { isHighContrast, toggle: toggleHighContrast } = useHighContrast();

  const [isApiKeyReady, setIsApiKeyReady] = useState(false);
  const [processingStep, setProcessingStep] = useState<'idle' | 'analyzing' | 'generating' | 'complete'>('idle');
  const [result, setResult] = useState<GeneratedInfographic | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Current request state
  const [currentTopic, setCurrentTopic] = useState('');
  const [currentSize, setCurrentSize] = useState<ImageSize>(ImageSize.Resolution_1K);
  const [currentRatio, setCurrentRatio] = useState<AspectRatio>(AspectRatio.Portrait);
  const [currentStyle, setCurrentStyle] = useState<InfographicStyle>(InfographicStyle.Modern);
  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(ColorPalette.BlueWhite);
  const [currentFilters, setCurrentFilters] = useState<GithubFilters | undefined>(undefined);

  // Used for reloading form state
  const [formInitialValues, setFormInitialValues] = useState<any>(undefined);

  // UI State
  const [savedVersions, setSavedVersions] = useState<SavedVersion[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showBatchManager, setShowBatchManager] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [isCurrentResultSaved, setIsCurrentResultSaved] = useState(false);

  // Feedback for current session view
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | undefined>(undefined);

  // Active mode ('single' or 'batch')
  const [activeMode, setActiveMode] = useState<'single' | 'batch'>('single');

  // Load versions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('infographix_versions');
      if (stored) {
        setSavedVersions(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  const handleGenerate = async (
    topic: string, 
    size: ImageSize, 
    aspectRatio: AspectRatio, 
    style: InfographicStyle,
    palette: ColorPalette,
    filters?: GithubFilters,
    fileContent?: string
  ) => {
    setError(null);
    setResult(null);
    setCurrentFeedback(undefined);
    setIsCurrentResultSaved(false);
    
    // Update current context
    setCurrentTopic(topic);
    setCurrentSize(size);
    setCurrentRatio(aspectRatio);
    setCurrentStyle(style);
    setCurrentPalette(palette);
    setCurrentFilters(filters);
    
    setProcessingStep('analyzing');

    try {
      // Step 1: Deep Analysis with Thinking Model
      const analysis = await analyzeTopic(topic, style, palette, filters, fileContent);
      
      setProcessingStep('generating');

      // Step 2: Image Generation with Nano Banana Pro
      const imageUrl = await generateInfographicImage(analysis.visualPlan, size, aspectRatio);

      setResult({
        imageUrl,
        analysis
      });
      setProcessingStep('complete');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      setProcessingStep('idle');
    }
  };

  const handleSaveVersion = () => {
    if (!result) return;

    const newVersion: SavedVersion = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      topic: currentTopic,
      size: currentSize,
      aspectRatio: currentRatio,
      style: currentStyle,
      palette: currentPalette,
      filters: currentFilters,
      data: result,
      feedback: currentFeedback
    };

    const updated = [newVersion, ...savedVersions];
    
    try {
      localStorage.setItem('infographix_versions', JSON.stringify(updated));
      setSavedVersions(updated);
      setIsCurrentResultSaved(true);
    } catch (e) {
      setError("Failed to save to history. Local storage might be full (Base64 images are large).");
    }
  };

  const handleDeleteVersion = (id: string) => {
    const updated = savedVersions.filter(v => v.id !== id);
    setSavedVersions(updated);
    localStorage.setItem('infographix_versions', JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to delete all history? This cannot be undone.")) {
      setSavedVersions([]);
      localStorage.removeItem('infographix_versions');
    }
  };

  const handleLoadVersion = (version: SavedVersion) => {
    setResult(version.data);
    setCurrentTopic(version.topic);
    setCurrentSize(version.size);
    setCurrentRatio(version.aspectRatio);
    setCurrentStyle(version.style || InfographicStyle.Modern);
    setCurrentPalette(version.palette || ColorPalette.BlueWhite);
    setCurrentFilters(version.filters);
    setCurrentFeedback(version.feedback);
    setIsCurrentResultSaved(true); // Since it came from storage
    
    // Pass values down to form to repopulate
    setFormInitialValues({
      topic: version.topic,
      size: version.size,
      aspectRatio: version.aspectRatio,
      style: version.style || InfographicStyle.Modern,
      palette: version.palette || ColorPalette.BlueWhite,
      filters: version.filters
    });

    setProcessingStep('complete');
  };

  const handleFeedback = (rating: number, comment: string) => {
    const feedback: Feedback = {
      id: crypto.randomUUID(),
      rating,
      comment,
      timestamp: Date.now()
    };
    setCurrentFeedback(feedback);

    // If already saved, update the saved record
    if (isCurrentResultSaved && result) {
       // Ideally we would update the saved version here, but keeping it simple for now
    }
  };

  const handleApplyTemplate = (template: TemplateConfig) => {
    // Apply template to form
    setFormInitialValues({
      style: template.style,
      palette: template.palette,
      size: template.size,
      aspectRatio: template.aspectRatio
    });
    setShowTemplateManager(false);
  };

  const handleSwitchMode = (mode: 'single' | 'batch') => {
    setActiveMode(mode);
    if (mode === 'batch') {
      setShowBatchManager(true);
    }
  };

  // Handle keyboard shortcut to trigger new generation
  const handleKeyboardGenerate = () => {
    // Trigger form submission if not processing
    if (processingStep === 'idle' || processingStep === 'complete') {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  };

  // Close any open modals
  const handleEscape = () => {
    if (showHistory) setShowHistory(false);
    else if (showAbout) setShowAbout(false);
    else if (showBatchManager) setShowBatchManager(false);
    else if (showTemplateManager) setShowTemplateManager(false);
    else if (showKeyboardShortcuts) setShowKeyboardShortcuts(false);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onGenerate: handleKeyboardGenerate,
    onSave: result && !isCurrentResultSaved ? handleSaveVersion : undefined,
    onDownload: result ? () => {
      const link = document.createElement('a');
      link.download = `infographic-${Date.now()}.png`;
      link.href = result.imageUrl;
      link.click();
    } : undefined,
    onNew: () => {
      setResult(null);
      setError(null);
      setProcessingStep('idle');
      setFormInitialValues(undefined);
      setIsCurrentResultSaved(false);
      announce(t('form.newGeneration'));
    },
    onToggleHistory: () => {
      setShowHistory(prev => !prev);
      announce(showHistory ? 'History closed' : 'History opened');
    },
    onToggleTemplates: () => {
      setShowTemplateManager(prev => !prev);
      announce(showTemplateManager ? 'Templates closed' : 'Templates opened');
    },
    onToggleBatch: () => {
      setShowBatchManager(prev => !prev);
      announce(showBatchManager ? 'Batch manager closed' : 'Batch manager opened');
    },
    onShowHelp: () => {
      setShowKeyboardShortcuts(true);
      announce('Keyboard shortcuts help opened');
    },
    onEscape: handleEscape,
    onToggleHighContrast: () => {
      toggleHighContrast();
      announce(isHighContrast ? 'High contrast disabled' : 'High contrast enabled');
    }
  });

  // Announce processing state changes
  useEffect(() => {
    if (processingStep === 'analyzing') {
      announce(t('processing.analyzing'));
    } else if (processingStep === 'generating') {
      announce(t('processing.generating'));
    } else if (processingStep === 'complete' && result) {
      announce(t('result.title'));
    }
  }, [processingStep, result, announce, t]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-blue-500/30 font-sans">
      <SkipLink />

      <ApiKeySelector onReady={() => setIsApiKeyReady(true)} />

      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 animate-pulse" style={{animationDuration: '10s'}}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] translate-y-1/2 animate-pulse" style={{animationDuration: '12s'}}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 animate-in slide-in-from-top-5 duration-700">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                  <Layers className="text-white w-6 h-6" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                InfoGraphix <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">AI</span>
              </h1>
            </div>
            <p className="text-slate-400 max-w-xl">
              Generative infographics from Wikipedia & GitHub using Gemini 3 Pro.
            </p>
          </div>
          
          <nav className="flex gap-3 flex-wrap justify-center md:justify-end items-center" aria-label="Main navigation">
            <button
              onClick={() => setShowTemplateManager(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all text-slate-300 shadow-sm hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={t('nav.templates')}
            >
              <BookTemplate className="w-5 h-5" aria-hidden="true" />
              {t('nav.templates')}
            </button>
            <button
              onClick={() => handleSwitchMode('batch')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all text-slate-300 shadow-sm hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={t('nav.batch')}
            >
              <ListIcon className="w-5 h-5" aria-hidden="true" />
              {t('nav.batch')}
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all text-slate-300 shadow-sm hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`${t('nav.history')}${savedVersions.length > 0 ? `, ${savedVersions.length} saved versions` : ''}`}
            >
              <HistoryIcon className="w-5 h-5" aria-hidden="true" />
              {t('nav.history')} {savedVersions.length > 0 && <span className="bg-blue-600 text-white text-xs px-1.5 rounded-full" aria-hidden="true">{savedVersions.length}</span>}
            </button>
            <button
              onClick={toggleHighContrast}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              aria-label={t('accessibility.toggleHighContrast')}
              title={t('accessibility.highContrast')}
            >
              <Contrast className="w-5 h-5 text-slate-400" aria-hidden="true" />
            </button>
            <LanguageSelector />
            <button
              onClick={() => setShowAbout(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all text-slate-300 shadow-sm hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={t('nav.about')}
            >
              <Info className="w-5 h-5" aria-hidden="true" />
              {t('nav.about')}
            </button>
          </nav>
        </header>

        {/* Main Interface */}
        <main id="main-content" className="flex-grow" role="main">
          {isApiKeyReady ? (
            <>
              <InfographicForm 
                onSubmit={handleGenerate} 
                isProcessing={processingStep !== 'idle' && processingStep !== 'complete'} 
                initialValues={formInitialValues}
              />
              
              {error && (
                <div className="mt-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-200 text-center max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
                  {error}
                </div>
              )}

              <ProcessingState step={processingStep} />
              
              <InfographicResult 
                data={result} 
                onSave={handleSaveVersion}
                onFeedback={handleFeedback}
                currentFeedback={currentFeedback}
                isSaved={isCurrentResultSaved}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-slate-500 animate-pulse">Waiting for API Key selection...</p>
            </div>
          )}
        </main>

        <footer className="mt-20 py-6 text-center text-slate-600 text-sm border-t border-slate-800">
           <p>© {new Date().getFullYear()} InfoGraphix AI. Powered by Google Gemini 3 Pro & Nano Banana Pro.</p>
        </footer>
      </div>

      {/* Overlays - wrapped in Suspense for lazy loading */}
      <Suspense fallback={null}>
        <VersionHistory
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          versions={savedVersions}
          onLoadVersion={handleLoadVersion}
          onDeleteVersion={handleDeleteVersion}
          onClearHistory={handleClearHistory}
        />
      </Suspense>

      <AboutModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
      />

      <Suspense fallback={null}>
        <BatchManager
          isOpen={showBatchManager}
          onClose={() => {
            setShowBatchManager(false);
            setActiveMode('single');
          }}
        />
      </Suspense>

      <TemplateBrowser
        isOpen={showTemplateManager}
        onClose={() => setShowTemplateManager(false)}
        onApplyTemplate={handleApplyTemplate}
      />

      <KeyboardShortcutsModal
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
    </div>
  );
}

export default App;