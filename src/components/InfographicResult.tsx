import React, { useState } from 'react';
import { log } from '../utils/logger';
import { Download, Info, CheckCircle2, Link as LinkIcon, Save, Loader2 } from 'lucide-react';
import { GeneratedInfographic, Feedback, ExportFormat, ImageSize, AspectRatio } from '../types';
import FeedbackForm from './FeedbackForm';
import { useImageErrorHandling } from '../hooks/useImageErrorHandling';

interface InfographicResultProps {
  data: GeneratedInfographic | null;
  onSave: () => void;
  onFeedback: (rating: number, comment: string) => void;
  currentFeedback?: Feedback;
  isSaved?: boolean;
  currentSize?: ImageSize;
  currentRatio?: AspectRatio;
}

const InfographicResult: React.FC<InfographicResultProps> = ({
  data,
  onSave,
  onFeedback,
  currentFeedback,
  isSaved,
  currentSize = ImageSize.Resolution_2K,
  currentRatio = AspectRatio.Portrait
}) => {
  // Image error handling with retry logic
  const { imageSrc, hasError, handleImageError } = useImageErrorHandling(
    data?.imageUrl || '',
    { maxRetries: 2 }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>(ExportFormat.PNG);
  const [isExporting, setIsExporting] = useState(false);

  if (!data) return null;

  const handleDownload = async () => {
    if (!data.imageUrl) return;

    setIsExporting(true);
    try {
      const filename = `infographic-${data.analysis.title.replace(/\s+/g, '-').toLowerCase()}`;

      if (exportFormat === ExportFormat.MultiRes) {
        alert('Multi-resolution export requires re-generating the infographic at each resolution. This feature will be available in the Batch Mode.');
        setIsExporting(false);
        return;
      }

      // Dynamic import to only load export libraries when needed
      const { exportInfographic } = await import('../utils/exportUtils');

      await exportInfographic(
        exportFormat,
        data.imageUrl,
        filename,
        currentSize,
        currentRatio
      );
    } catch (error) {
      log.error('Export failed:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
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
                  src={imageSrc}
                  alt={data.analysis.title}
                  className="w-full h-auto object-contain max-h-[800px]"
                  onError={handleImageError}
                  loading="lazy"
                />
                {hasError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90">
                    <p className="text-slate-400 text-sm">Failed to load image</p>
                  </div>
                )}
             </div>

             {/* Overlay Actions */}
             <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-white">
                  <p className="text-sm font-medium opacity-80">Generated with Nano Banana Pro</p>
                </div>
                <div className="flex gap-3 items-center">
                  {/* Export Format Selector */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="export-format" className="text-xs text-white/70 font-medium">
                      Export As
                    </label>
                    <select
                      id="export-format"
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                      className="px-3 py-1.5 bg-slate-800/90 text-white text-sm rounded-lg border border-slate-600 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      disabled={isExporting}
                    >
                      <option value={ExportFormat.PNG}>PNG Image</option>
                      <option value={ExportFormat.PDF}>PDF Document</option>
                      <option value={ExportFormat.SVG}>SVG Vector</option>
                      <option value={ExportFormat.MultiRes}>Multi-Resolution</option>
                    </select>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={handleDownload}
                    disabled={isExporting}
                    className={`p-2 bg-white text-slate-900 rounded-lg hover:bg-blue-50 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 self-end ${
                      isExporting ? 'opacity-60 cursor-wait' : ''
                    }`}
                    title={`Download as ${exportFormat}`}
                    aria-label={`Download infographic as ${exportFormat}`}
                  >
                    {isExporting ? (
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Download className="w-5 h-5" aria-hidden="true" />
                    )}
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

// Memoize component to prevent unnecessary re-renders (v1.8.0 - TD-015)
export default React.memo(InfographicResult);