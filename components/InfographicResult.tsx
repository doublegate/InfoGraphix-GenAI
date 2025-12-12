import React, { useState } from 'react';
import { Download, Info, CheckCircle2, Link as LinkIcon, Save, Loader2 } from 'lucide-react';
import { GeneratedInfographic, Feedback } from '../types';
import FeedbackForm from './FeedbackForm';

interface InfographicResultProps {
  data: GeneratedInfographic | null;
  onSave: () => void;
  onFeedback: (rating: number, comment: string) => void;
  currentFeedback?: Feedback;
  isSaved?: boolean;
}

const InfographicResult: React.FC<InfographicResultProps> = ({ 
  data, 
  onSave, 
  onFeedback, 
  currentFeedback,
  isSaved 
}) => {
  const [isSaving, setIsSaving] = useState(false);

  if (!data) return null;

  const handleDownload = () => {
    if (!data.imageUrl) return;
    const link = document.createElement('a');
    link.href = data.imageUrl;
    link.download = `infographic-${data.analysis.title.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    // Add a small delay to ensure the UI updates to show the spinner before any potential blocking operations
    await new Promise(resolve => setTimeout(resolve, 300));
    onSave();
    setIsSaving(false);
  };

  return (
    <div 
      key={data.analysis.title}
      className="mt-12 space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-1000 fill-mode-both pb-20"
    >
      
      {/* Control Bar */}
      <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700 backdrop-blur-sm shadow-lg">
        <h2 className="text-xl font-bold text-white">Generation Result</h2>
        <button
          onClick={handleSaveClick}
          disabled={isSaved || isSaving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isSaved 
              ? 'bg-green-600/20 text-green-400 border border-green-600/50 cursor-default'
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
          } ${isSaving ? 'opacity-80 cursor-wait' : ''}`}
        >
          {isSaved ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Saved to History
            </>
          ) : isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Version
            </>
          )}
        </button>
      </div>

      {/* Main Content Area: Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Col: Analysis (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 backdrop-blur-sm h-full flex flex-col animate-in slide-in-from-left-4 fade-in duration-700 delay-150 fill-mode-backwards">
            <h2 className="text-2xl font-bold text-white mb-4 leading-tight">{data.analysis.title}</h2>
            
            <div className="prose prose-invert prose-sm mb-6">
              <p className="text-slate-300 leading-relaxed">
                {data.analysis.summary}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4" aria-hidden="true" /> Key Insights
              </h3>
              <ul className="space-y-3" role="list" aria-label="Key insights about the topic">
                {data.analysis.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Sources Section */}
            {data.analysis.webSources && data.analysis.webSources.length > 0 && (
              <nav className="space-y-3 pt-6 border-t border-slate-700/50" aria-label="Reference sources">
                 <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <LinkIcon className="w-3 h-3" aria-hidden="true" /> Sources
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.analysis.webSources.map((source, i) => (
                    <a
                      key={i}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 hover:underline truncate max-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-800 rounded"
                      title={source.title}
                      aria-label={`Source: ${source.title || 'External link'} (opens in new tab)`}
                    >
                      {source.title || 'Source'}
                    </a>
                  ))}
                </div>
              </nav>
            )}

            <div className="mt-auto pt-6 border-t border-slate-700/50">
               <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Visual Prompt Used
              </h3>
              <p className="text-xs text-slate-600 line-clamp-4 italic">
                {data.analysis.visualPlan}
              </p>
            </div>
          </div>
          
          {/* Feedback Form moved to left column bottom */}
          <div className="animate-in slide-in-from-bottom-2 fade-in duration-700 delay-300 fill-mode-backwards">
            <FeedbackForm onSubmit={onFeedback} existingFeedback={currentFeedback} />
          </div>
        </div>

        {/* Right Col: Image (3 cols) */}
        <div className="lg:col-span-3">
          <div className="relative group rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 animate-in zoom-in-95 fade-in duration-1000 delay-100 fill-mode-backwards">
             {/* Image Container */}
             <div className="relative aspect-auto min-h-[400px] flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                <img 
                  src={data.imageUrl} 
                  alt={data.analysis.title}
                  className="w-full h-auto object-contain max-h-[800px]"
                />
             </div>

             {/* Overlay Actions */}
             <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-white">
                  <p className="text-sm font-medium opacity-80">Generated with Nano Banana Pro</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownload}
                    className="p-2 bg-white text-slate-900 rounded-lg hover:bg-blue-50 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                    title="Download High-Res"
                    aria-label="Download high-resolution infographic"
                  >
                    <Download className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
             </div>
          </div>
          
          <div className="mt-4 flex justify-center animate-in fade-in duration-1000 delay-500 fill-mode-backwards">
             <p className="text-xs text-slate-500 text-center max-w-md">
               AI generated content may contain inaccuracies. Please verify important statistics.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InfographicResult;