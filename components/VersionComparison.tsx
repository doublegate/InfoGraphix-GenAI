import React from 'react';
import { X, ArrowLeftRight, Calendar, Palette, Paintbrush, Monitor, FileText, CheckCircle2, Filter } from 'lucide-react';
import { SavedVersion } from '../types';

interface VersionComparisonProps {
  v1: SavedVersion;
  v2: SavedVersion;
  onClose: () => void;
}

const VersionComparison: React.FC<VersionComparisonProps> = ({ v1, v2, onClose }) => {
  
  const formatDate = (ts: number) => new Date(ts).toLocaleString();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-7xl max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <ArrowLeftRight className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Compare Versions</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-lg hover:bg-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Comparison Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="min-w-[800px]"> {/* Force min width for horizontal scroll on small screens */}
            
            {/* 1. Header Row (Titles) */}
            <div className="grid grid-cols-2 border-b border-slate-700 sticky top-0 bg-slate-900/95 backdrop-blur z-10 shadow-lg">
              <div className="p-4 border-r border-slate-700">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">Version A</div>
                <h3 className="text-lg font-bold text-white line-clamp-1">{v1.data.analysis.title}</h3>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" /> {formatDate(v1.timestamp)}
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">Version B</div>
                <h3 className="text-lg font-bold text-white line-clamp-1">{v2.data.analysis.title}</h3>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" /> {formatDate(v2.timestamp)}
                </div>
              </div>
            </div>

            {/* 2. Images Row */}
            <div className="grid grid-cols-2 border-b border-slate-700">
              <div className="p-4 border-r border-slate-700 bg-slate-900">
                <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center">
                  <img src={v1.data.imageUrl} alt="Version A" className="max-w-full max-h-full object-contain" />
                </div>
              </div>
              <div className="p-4 bg-slate-900">
                 <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center">
                  <img src={v2.data.imageUrl} alt="Version B" className="max-w-full max-h-full object-contain" />
                </div>
              </div>
            </div>

            {/* 3. Metadata Comparison Table */}
            <div className="bg-slate-800/30">
               <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700/50 bg-slate-800/50">
                 Configuration
               </div>
               
               {/* Style */}
               <div className="grid grid-cols-[120px_1fr_1fr] border-b border-slate-700/50 text-sm">
                 <div className="p-3 text-slate-400 font-medium flex items-center gap-2 border-r border-slate-700/50">
                   <Paintbrush className="w-4 h-4" /> Style
                 </div>
                 <div className="p-3 text-slate-200 border-r border-slate-700/50">{v1.style || 'N/A'}</div>
                 <div className="p-3 text-slate-200">{v2.style || 'N/A'}</div>
               </div>

               {/* Palette */}
               <div className="grid grid-cols-[120px_1fr_1fr] border-b border-slate-700/50 text-sm">
                 <div className="p-3 text-slate-400 font-medium flex items-center gap-2 border-r border-slate-700/50">
                   <Palette className="w-4 h-4" /> Palette
                 </div>
                 <div className="p-3 text-slate-200 border-r border-slate-700/50">{v1.palette || 'N/A'}</div>
                 <div className="p-3 text-slate-200">{v2.palette || 'N/A'}</div>
               </div>

               {/* Size / Ratio */}
               <div className="grid grid-cols-[120px_1fr_1fr] border-b border-slate-700/50 text-sm">
                 <div className="p-3 text-slate-400 font-medium flex items-center gap-2 border-r border-slate-700/50">
                   <Monitor className="w-4 h-4" /> Size
                 </div>
                 <div className="p-3 text-slate-200 border-r border-slate-700/50">{v1.size} ({v1.aspectRatio})</div>
                 <div className="p-3 text-slate-200">{v2.size} ({v2.aspectRatio})</div>
               </div>
               
               {/* Filters */}
               {(v1.filters || v2.filters) && (
                 <div className="grid grid-cols-[120px_1fr_1fr] border-b border-slate-700/50 text-sm">
                   <div className="p-3 text-slate-400 font-medium flex items-center gap-2 border-r border-slate-700/50">
                     <Filter className="w-4 h-4" /> Filters
                   </div>
                   <div className="p-3 text-slate-200 border-r border-slate-700/50">
                     {v1.filters ? (
                       <div className="space-y-1 text-xs">
                         {v1.filters.language && <div>Lang: {v1.filters.language}</div>}
                         {v1.filters.fileExtensions && <div>Ext: {v1.filters.fileExtensions}</div>}
                         {v1.filters.lastUpdatedAfter && <div>Date: {v1.filters.lastUpdatedAfter}</div>}
                       </div>
                     ) : <span className="text-slate-600">None</span>}
                   </div>
                   <div className="p-3 text-slate-200">
                     {v2.filters ? (
                       <div className="space-y-1 text-xs">
                         {v2.filters.language && <div>Lang: {v2.filters.language}</div>}
                         {v2.filters.fileExtensions && <div>Ext: {v2.filters.fileExtensions}</div>}
                         {v2.filters.lastUpdatedAfter && <div>Date: {v2.filters.lastUpdatedAfter}</div>}
                       </div>
                     ) : <span className="text-slate-600">None</span>}
                   </div>
                 </div>
               )}
            </div>

            {/* 4. Analysis Content Comparison */}
            <div>
              <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700/50 bg-slate-800/50">
                 Analysis Breakdown
              </div>
              
              {/* Summary */}
              <div className="grid grid-cols-2 border-b border-slate-700/50">
                <div className="p-4 border-r border-slate-700/50">
                   <div className="flex items-center gap-2 text-slate-400 mb-2 font-medium text-sm">
                      <FileText className="w-4 h-4" /> Summary (A)
                   </div>
                   <p className="text-sm text-slate-300 leading-relaxed">{v1.data.analysis.summary}</p>
                </div>
                <div className="p-4">
                   <div className="flex items-center gap-2 text-slate-400 mb-2 font-medium text-sm">
                      <FileText className="w-4 h-4" /> Summary (B)
                   </div>
                   <p className="text-sm text-slate-300 leading-relaxed">{v2.data.analysis.summary}</p>
                </div>
              </div>

              {/* Key Points */}
              <div className="grid grid-cols-2">
                 <div className="p-4 border-r border-slate-700/50">
                   <div className="flex items-center gap-2 text-slate-400 mb-3 font-medium text-sm">
                      <CheckCircle2 className="w-4 h-4" /> Key Points (A)
                   </div>
                   <ul className="space-y-2">
                     {v1.data.analysis.keyPoints.map((p, i) => (
                       <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                         <span className="text-blue-500 mt-0.5">•</span> {p}
                       </li>
                     ))}
                   </ul>
                 </div>
                 <div className="p-4">
                   <div className="flex items-center gap-2 text-slate-400 mb-3 font-medium text-sm">
                      <CheckCircle2 className="w-4 h-4" /> Key Points (B)
                   </div>
                   <ul className="space-y-2">
                     {v2.data.analysis.keyPoints.map((p, i) => (
                       <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                         <span className="text-purple-500 mt-0.5">•</span> {p}
                       </li>
                     ))}
                   </ul>
                 </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default VersionComparison;