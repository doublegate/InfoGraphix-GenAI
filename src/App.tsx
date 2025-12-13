import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { Layers, History as HistoryIcon, Info, List as ListIcon, BookTemplate, Contrast, HelpCircle } from 'lucide-react';
import ApiKeySelector from './components/ApiKeySelector';
import InfographicForm from './components/InfographicForm';
import ProcessingState from './components/ProcessingState';
import InfographicResult from './components/InfographicResult';
import AboutModal from './components/AboutModal';
import SkipLink from './components/SkipLink';
import LanguageSelector from './components/LanguageSelector';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import ErrorBoundary from './components/ErrorBoundary';
import { TemplateBrowser } from './components/TemplateManager';
import { SavedVersion, Feedback, InfographicStyle, ColorPalette, TemplateConfig, BatchQueue, BatchStatus } from './types';
import { analyzeTopic, generateInfographicImage } from './services/geminiService';
import { updateQueueItem, getNextPendingItem, isQueueActive } from './services/batchService';
import { DELAY_BETWEEN_ITEMS } from './constants/performance';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAnnouncer } from './hooks/useAnnouncer';
import { useHighContrast } from './hooks/useHighContrast';
import { useModals } from './hooks/useModals';
import { useVersionHistory } from './hooks/useVersionHistory';
import { useGeneration } from './contexts';

// Lazy load heavy modal components for better code splitting
// Note: TemplateBrowser is statically imported (used by InfographicForm)
const VersionHistory = lazy(() => import('./components/VersionHistory'));
const BatchManager = lazy(() => import('./components/BatchGeneration/BatchManager'));

function App() {
  const { t } = useTranslation();
  const { announce } = useAnnouncer();
  const { isHighContrast, toggle: toggleHighContrast } = useHighContrast();

  // v1.8.0 - TD-006: Use Generation Context for shared state
  const {
    processingStep,
    result,
    error,
    currentTopic,
    currentSize,
    currentRatio,
    currentStyle,
    currentPalette,
    currentFilters,
    isCurrentResultSaved,
    currentFeedback,
    formInitialValues,
    handleGenerate,
    setIsCurrentResultSaved,
    setCurrentFeedback,
    setFormInitialValues,
    setError,
    setResult,
    setProcessingStep,
    setCurrentTopic,
    setCurrentSize,
    setCurrentRatio,
    setCurrentStyle,
    setCurrentPalette,
    setCurrentFilters
  } = useGeneration();

  // v1.8.0 - TD-009: Use custom hooks for state management
  const {
    showHistory,
    showAbout,
    showBatchManager,
    showTemplateManager,
    showKeyboardShortcuts,
    openHistory,
    closeHistory,
    toggleHistory,
    openAbout,
    closeAbout,
    openBatchManager,
    closeBatchManager,
    toggleBatchManager,
    openTemplateManager,
    closeTemplateManager,
    toggleTemplateManager,
    openKeyboardShortcuts,
    closeKeyboardShortcuts,
    closeAll: closeAllModals
  } = useModals();

  const {
    versions: savedVersions,
    isLoading: isLoadingVersions,
    save: saveVersion,
    remove: deleteVersion,
    clearAll: clearHistory
  } = useVersionHistory();

  const [isApiKeyReady, setIsApiKeyReady] = useState(false);

  // Active mode ('single' or 'batch')
  const [_activeMode, setActiveMode] = useState<'single' | 'batch'>('single');

  // v1.8.0 - TD-009: Refactored handlers to use custom hooks
  const handleSaveVersion = useCallback(async () => {
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

    const success = await saveVersion(newVersion);
    if (success) {
      setIsCurrentResultSaved(true);
    } else {
      setError('Failed to save to history. Please try again.');
    }
  }, [result, currentTopic, currentSize, currentRatio, currentStyle, currentPalette, currentFilters, currentFeedback, saveVersion, setIsCurrentResultSaved, setError]);

  const handleDeleteVersion = useCallback(async (id: string) => {
    await deleteVersion(id);
  }, [deleteVersion]);

  const handleClearHistory = useCallback(async () => {
    if (window.confirm('Are you sure you want to delete all history? This cannot be undone.')) {
      await clearHistory();
    }
  }, [clearHistory]);

  const handleLoadVersion = useCallback((version: SavedVersion) => {
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
  }, [setResult, setCurrentTopic, setCurrentSize, setCurrentRatio, setCurrentStyle, setCurrentPalette, setCurrentFilters, setCurrentFeedback, setIsCurrentResultSaved, setFormInitialValues, setProcessingStep]);

  const handleFeedback = useCallback((rating: number, comment: string) => {
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
  }, [isCurrentResultSaved, result, setCurrentFeedback]);

  const handleApplyTemplate = useCallback((template: TemplateConfig) => {
    // Apply template to form
    setFormInitialValues({
      style: template.style,
      palette: template.palette,
      size: template.size,
      aspectRatio: template.aspectRatio
    });
    closeTemplateManager();
  }, [setFormInitialValues, closeTemplateManager]);

  const handleSwitchMode = useCallback((mode: 'single' | 'batch') => {
    setActiveMode(mode);
    if (mode === 'batch') {
      openBatchManager();
    }
  }, [openBatchManager]);

  // Batch queue processing handler
  const handleStartBatchQueue = useCallback(async (queue: BatchQueue) => {
    if (!queue || !isQueueActive(queue)) return;

    // Verify API key is ready before starting batch processing
    if (!isApiKeyReady) {
      console.error('Batch processing: API key not ready');
      const firstItem = getNextPendingItem(queue);
      if (firstItem) {
        await updateQueueItem(queue.id, firstItem.id, {
          status: BatchStatus.Failed,
          completedAt: Date.now(),
          error: 'API key not configured. Please select an API key first.'
        });
      }
      return;
    }

    let currentQueue = queue;
    let nextItem = getNextPendingItem(currentQueue);

    while (nextItem) {
      try {
        // Mark item as processing
        await updateQueueItem(queue.id, nextItem.id, {
          status: BatchStatus.Processing,
          startedAt: Date.now()
        });

        // Step 1: Analyze topic
        const analysis = await analyzeTopic(
          nextItem.topic,
          nextItem.style,
          nextItem.palette,
          nextItem.filters
        );

        // Step 2: Generate image
        const imageUrl = await generateInfographicImage(
          analysis.visualPlan,
          nextItem.size,
          nextItem.aspectRatio
        );

        // Mark item as complete with result
        const updatedQueue = await updateQueueItem(queue.id, nextItem.id, {
          status: BatchStatus.Complete,
          completedAt: Date.now(),
          result: { imageUrl, analysis }
        });

        if (updatedQueue) {
          currentQueue = updatedQueue;
        }
      } catch (err) {
        // Mark item as failed with detailed error
        let errorMessage = 'Unknown error';
        if (err instanceof Error) {
          errorMessage = err.message;
          // Log full error for debugging
          console.error('Batch processing error:', err.name, err.message, err.stack);
        }

        const updatedQueue = await updateQueueItem(queue.id, nextItem.id, {
          status: BatchStatus.Failed,
          completedAt: Date.now(),
          error: errorMessage
        });

        if (updatedQueue) {
          currentQueue = updatedQueue;
        }

        // Stop on error if configured
        if (queue.config?.stopOnError) {
          break;
        }
      }

      // Delay between items to avoid rate limiting
      const delay = queue.config?.delayBetweenItems ?? DELAY_BETWEEN_ITEMS;
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Get next pending item
      nextItem = getNextPendingItem(currentQueue);
    }
  }, [isApiKeyReady]);

  // Handle keyboard shortcut to trigger new generation
  const handleKeyboardGenerate = useCallback(() => {
    // Trigger form submission if not processing
    if (processingStep === 'idle' || processingStep === 'complete') {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  }, [processingStep]);

  // Close any open modals
  const handleEscape = useCallback(() => {
    closeAllModals();
  }, [closeAllModals]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onGenerate: handleKeyboardGenerate,
    onSave: result && !isCurrentResultSaved ? () => { void handleSaveVersion(); } : undefined,
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
      toggleHistory();
      announce(showHistory ? 'History closed' : 'History opened');
    },
    onToggleTemplates: () => {
      toggleTemplateManager();
      announce(showTemplateManager ? 'Templates closed' : 'Templates opened');
    },
    onToggleBatch: () => {
      toggleBatchManager();
      announce(showBatchManager ? 'Batch manager closed' : 'Batch manager opened');
    },
    onShowHelp: () => {
      openKeyboardShortcuts();
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
              Generate Infographics - Wikipedia &amp; GitHub w/ Gemini 3 Pro
            </p>
          </div>
          
          <nav className="flex gap-3 flex-wrap justify-center md:justify-end items-center" aria-label="Main navigation">
            <button
              onClick={openTemplateManager}
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
              onClick={openHistory}
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
              onClick={openKeyboardShortcuts}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              aria-label={t('nav.keyboardShortcuts', 'Keyboard shortcuts')}
              title={t('nav.keyboardShortcutsHint', 'Press ? for keyboard shortcuts')}
            >
              <HelpCircle className="w-5 h-5 text-slate-400" aria-hidden="true" />
            </button>
            <button
              onClick={openAbout}
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
          {isLoadingVersions ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400">{t('loadingData', 'Loading application data...')}</p>
              </div>
            </div>
          ) : isApiKeyReady ? (
            <>
              <InfographicForm
                onSubmit={(req) => { void handleGenerate(req); }}
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
                onSave={() => { void handleSaveVersion(); }}
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

      {/* Overlays - wrapped in Suspense and ErrorBoundary for lazy loading */}
      <ErrorBoundary
        fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-md border border-slate-700">
              <p className="text-white mb-4">Failed to load Version History</p>
              <button
                onClick={closeHistory}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        }
      >
        <Suspense fallback={null}>
          <VersionHistory
            isOpen={showHistory}
            onClose={closeHistory}
            versions={savedVersions}
            onLoadVersion={handleLoadVersion}
            onDeleteVersion={(id) => { void handleDeleteVersion(id); }}
            onClearHistory={() => { void handleClearHistory(); }}
          />
        </Suspense>
      </ErrorBoundary>

      <AboutModal
        isOpen={showAbout}
        onClose={closeAbout}
      />

      <ErrorBoundary
        fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-md border border-slate-700">
              <p className="text-white mb-4">Failed to load Batch Manager</p>
              <button
                onClick={closeBatchManager}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        }
      >
        <Suspense fallback={null}>
          <BatchManager
            isOpen={showBatchManager}
            onClose={() => {
              closeBatchManager();
              setActiveMode('single');
            }}
            onStartQueue={handleStartBatchQueue}
          />
        </Suspense>
      </ErrorBoundary>

      <TemplateBrowser
        isOpen={showTemplateManager}
        onClose={closeTemplateManager}
        onApplyTemplate={handleApplyTemplate}
      />

      <KeyboardShortcutsModal
        isOpen={showKeyboardShortcuts}
        onClose={closeKeyboardShortcuts}
      />
    </div>
  );
}

export default App;