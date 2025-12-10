import React, { useState, useEffect } from 'react';
import { Layers, Github, Globe, History as HistoryIcon, Info } from 'lucide-react';
import ApiKeySelector from './components/ApiKeySelector';
import InfographicForm from './components/InfographicForm';
import ProcessingState from './components/ProcessingState';
import InfographicResult from './components/InfographicResult';
import VersionHistory from './components/VersionHistory';
import AboutModal from './components/AboutModal';
import { analyzeTopic, generateInfographicImage } from './services/geminiService';
import { AspectRatio, GeneratedInfographic, ImageSize, GithubFilters, SavedVersion, Feedback, InfographicStyle, ColorPalette } from './types';

function App() {
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
  const [isCurrentResultSaved, setIsCurrentResultSaved] = useState(false);
  
  // Feedback for current session view
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | undefined>(undefined);

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

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-blue-500/30 font-sans">
      <ApiKeySelector onReady={() => setIsApiKeyReady(true)} />
      
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
          
          <div className="flex gap-3">
             <button 
              onClick={() => setShowAbout(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all text-slate-300 shadow-sm hover:text-white"
            >
              <Info className="w-5 h-5" />
              About
            </button>
            <button 
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all text-slate-300 shadow-sm hover:text-white"
            >
              <HistoryIcon className="w-5 h-5" />
              History {savedVersions.length > 0 && <span className="bg-blue-600 text-white text-xs px-1.5 rounded-full">{savedVersions.length}</span>}
            </button>
          </div>
        </header>

        {/* Main Interface */}
        <main className="flex-grow">
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

      {/* Overlays */}
      <VersionHistory 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        versions={savedVersions}
        onLoadVersion={handleLoadVersion}
        onDeleteVersion={handleDeleteVersion}
        onClearHistory={handleClearHistory}
      />
      
      <AboutModal 
        isOpen={showAbout} 
        onClose={() => setShowAbout(false)} 
      />
    </div>
  );
}

export default App;