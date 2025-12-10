import React, { useState } from 'react';
import { History, Clock, ArrowRight, Trash2, Calendar, Palette, Paintbrush, ArrowLeftRight, CheckSquare, Square, Search, X, ArrowDownAZ, ArrowUpAZ, CalendarClock, CalendarArrowDown } from 'lucide-react';
import { SavedVersion } from '../types';
import VersionComparison from './VersionComparison';

interface VersionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  versions: SavedVersion[];
  onLoadVersion: (version: SavedVersion) => void;
  onDeleteVersion: (id: string) => void;
  onClearHistory: () => void;
}

type SortOrder = 'newest' | 'oldest' | 'az' | 'za';

const VersionHistory: React.FC<VersionHistoryProps> = ({ 
  isOpen, 
  onClose, 
  versions, 
  onLoadVersion, 
  onDeleteVersion,
  onClearHistory
}) => {
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  if (!isOpen) return null;

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      if (selectedIds.length < 2) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const handleCompare = () => {
    if (selectedIds.length === 2) {
      setShowComparison(true);
    }
  };

  const filteredVersions = versions
    .filter(v => 
      v.topic.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.data.analysis.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOrder) {
        case 'newest': return b.timestamp - a.timestamp;
        case 'oldest': return a.timestamp - b.timestamp;
        case 'az': return a.topic.localeCompare(b.topic);
        case 'za': return b.topic.localeCompare(a.topic);
        default: return 0;
      }
    });

  const v1 = versions.find(v => v.id === selectedIds[0]);
  const v2 = versions.find(v => v.id === selectedIds[1]);

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
          onClick={onClose}
        ></div>

        {/* Drawer */}
        <div className="relative w-full max-w-md bg-slate-900 h-full shadow-2xl border-l border-slate-700 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-6 border-b border-slate-700 flex flex-col bg-slate-900/50 gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" />
                Version History
              </h2>
              <div className="flex gap-2">
                 {versions.length > 0 && (
                  <button 
                    onClick={onClearHistory}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-900/20"
                    title="Clear All History"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                 )}
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Toolbar: Search & Sort */}
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-slate-800 border border-slate-700 text-sm text-white rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              </div>
              
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="appearance-none bg-slate-800 border border-slate-700 text-sm text-white rounded-lg pl-3 pr-8 py-2 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer w-full"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="az">A-Z</option>
                  <option value="za">Z-A</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                   {sortOrder === 'newest' && <CalendarClock className="w-4 h-4" />}
                   {sortOrder === 'oldest' && <CalendarArrowDown className="w-4 h-4" />}
                   {sortOrder === 'az' && <ArrowDownAZ className="w-4 h-4" />}
                   {sortOrder === 'za' && <ArrowUpAZ className="w-4 h-4" />}
                </div>
              </div>
            </div>
            
            {/* Action Bar */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsCompareMode(!isCompareMode);
                  setSelectedIds([]);
                }}
                disabled={versions.length < 2}
                className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-lg transition-all border ${
                  isCompareMode 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : versions.length < 2
                      ? 'bg-slate-800/50 border-slate-700 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                {isCompareMode ? 'Cancel Compare' : 'Compare Versions'}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 custom-scrollbar">
            {filteredVersions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 animate-in fade-in duration-500">
                <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>{searchQuery ? 'No matching versions found.' : 'No saved versions yet.'}</p>
                {!searchQuery && <p className="text-xs mt-1">Generate an infographic and save it to see it here.</p>}
              </div>
            ) : (
              filteredVersions.map((version, index) => {
                const isSelected = selectedIds.includes(version.id);
                const isDisabled = isCompareMode && !isSelected && selectedIds.length >= 2;

                return (
                  <div 
                    key={version.id} 
                    onClick={() => isCompareMode && !isDisabled && toggleSelection(version.id)}
                    className={`
                      relative rounded-xl overflow-hidden transition-all border animate-in slide-in-from-right-8 fade-in duration-500 fill-mode-both
                      ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/20 bg-slate-800/80' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <div className="p-4">
                      {/* Selection Indicator */}
                      {isCompareMode && (
                        <div className="absolute top-4 right-4 z-10">
                          {isSelected ? (
                             <CheckSquare className="w-5 h-5 text-blue-500 fill-blue-500/10" />
                          ) : (
                             <Square className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-2 pr-8">
                        <h3 className="font-semibold text-white line-clamp-1" title={version.data.analysis.title}>
                          {version.data.analysis.title}
                        </h3>
                        {!isCompareMode && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm("Delete this version?")) {
                                onDeleteVersion(version.id);
                              }
                            }}
                            className="text-slate-500 hover:text-red-400 transition-opacity absolute top-4 right-4"
                            title="Delete Version"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(version.timestamp).toLocaleDateString()}
                        </span>
                        <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                          {version.size}
                        </span>
                        <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                          {version.aspectRatio}
                        </span>
                      </div>

                      {/* Metadata: Style & Palette */}
                      {(version.style || version.palette) && (
                        <div className="mb-3 flex flex-col gap-1 text-xs text-slate-500">
                          {version.style && (
                            <div className="flex items-center gap-2">
                              <Paintbrush className="w-3 h-3 text-slate-400" />
                              <span className="text-slate-300 truncate">{version.style}</span>
                            </div>
                          )}
                          {version.palette && (
                            <div className="flex items-center gap-2">
                              <Palette className="w-3 h-3 text-slate-400" />
                              <span className="text-slate-300 truncate">{version.palette}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {version.filters && (
                        <div className="mb-3 text-xs text-slate-500 bg-slate-900/50 p-2 rounded">
                            <span className="font-medium block mb-1">Filters:</span>
                            {version.filters.language && <span className="mr-2">Lang: {version.filters.language}</span>}
                            {version.filters.fileExtensions && <span>Ext: {version.filters.fileExtensions}</span>}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-slate-900 rounded-lg overflow-hidden shrink-0 border border-slate-700">
                          <img src={version.data.imageUrl} alt="thumbnail" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                            <p className="text-xs text-slate-500 line-clamp-2 mb-2">{version.data.analysis.summary}</p>
                            {!isCompareMode && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onLoadVersion(version);
                                  onClose();
                                }}
                                className="text-xs bg-blue-600 hover:bg-blue-500 text-white py-1.5 px-3 rounded-lg self-start flex items-center gap-1 transition-colors"
                              >
                                Load Version <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Compare FAB */}
          {isCompareMode && (
            <div className="absolute bottom-6 left-6 right-6 z-20 animate-in slide-in-from-bottom-5 fade-in duration-300">
              <button
                onClick={handleCompare}
                disabled={selectedIds.length !== 2}
                className={`w-full py-3 px-4 rounded-xl shadow-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  selectedIds.length === 2 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-[1.02]' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <ArrowLeftRight className="w-5 h-5" />
                Compare ({selectedIds.length}/2)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Modal */}
      {showComparison && v1 && v2 && (
        <VersionComparison 
          v1={v1} 
          v2={v2} 
          onClose={() => setShowComparison(false)} 
        />
      )}
    </>
  );
};

export default VersionHistory;