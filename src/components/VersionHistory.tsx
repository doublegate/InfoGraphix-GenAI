import React, { useState, useMemo } from 'react';
import { History, Clock, ArrowRight, Trash2, Calendar, Palette, Paintbrush, ArrowLeftRight, CheckSquare, Square, Search, X, ArrowDownAZ, ArrowUpAZ, CalendarClock, CalendarArrowDown, Filter, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { SavedVersion, ImageSize, AspectRatio, InfographicStyle, ColorPalette } from '../types';
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

interface AdvancedFilters {
  size?: ImageSize;
  aspectRatio?: AspectRatio;
  style?: InfographicStyle;
  palette?: ColorPalette;
  dateFrom?: string;
  dateTo?: string;
}

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

  // v1.4.0 Enhanced features
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [filters, setFilters] = useState<AdvancedFilters>({});
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Enhanced filtering with advanced filters
  const filteredVersions = useMemo(() => {
    let result = versions.filter(v => {
      // Text search
      const matchesSearch = searchQuery === '' ||
        v.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.data.analysis.title.toLowerCase().includes(searchQuery.toLowerCase());

      // Advanced filters
      const matchesSize = !filters.size || v.size === filters.size;
      const matchesRatio = !filters.aspectRatio || v.aspectRatio === filters.aspectRatio;
      const matchesStyle = !filters.style || v.style === filters.style;
      const matchesPalette = !filters.palette || v.palette === filters.palette;

      // Date range filters
      let matchesDateRange = true;
      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom).getTime();
        matchesDateRange = matchesDateRange && v.timestamp >= dateFrom;
      }
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo).getTime() + 86400000; // Add 1 day
        matchesDateRange = matchesDateRange && v.timestamp < dateTo;
      }

      return matchesSearch && matchesSize && matchesRatio && matchesStyle && matchesPalette && matchesDateRange;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortOrder) {
        case 'newest': return b.timestamp - a.timestamp;
        case 'oldest': return a.timestamp - b.timestamp;
        case 'az': return a.topic.localeCompare(b.topic);
        case 'za': return b.topic.localeCompare(a.topic);
        default: return 0;
      }
    });

    return result;
  }, [versions, searchQuery, filters, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredVersions.length / itemsPerPage);
  const paginatedVersions = filteredVersions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const styleCount: Record<string, number> = {};
    const paletteCount: Record<string, number> = {};
    const sizeCount: Record<string, number> = {};

    versions.forEach(v => {
      if (v.style) styleCount[v.style] = (styleCount[v.style] || 0) + 1;
      if (v.palette) paletteCount[v.palette] = (paletteCount[v.palette] || 0) + 1;
      sizeCount[v.size] = (sizeCount[v.size] || 0) + 1;
    });

    const mostUsedStyle = Object.entries(styleCount).sort((a, b) => b[1] - a[1])[0];
    const mostUsedPalette = Object.entries(paletteCount).sort((a, b) => b[1] - a[1])[0];

    return {
      total: versions.length,
      filtered: filteredVersions.length,
      mostUsedStyle: mostUsedStyle?.[0],
      mostUsedPalette: mostUsedPalette?.[0],
      sizeBreakdown: sizeCount
    };
  }, [versions, filteredVersions]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, itemsPerPage]);

  const v1 = versions.find(v => v.id === selectedIds[0]);
  const v2 = versions.find(v => v.id === selectedIds[1]);

  // Early return after all hooks
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

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex justify-end"
        role="dialog"
        aria-modal="true"
        aria-labelledby="version-history-title"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
          onClick={onClose}
          aria-hidden="true"
        ></div>

        {/* Drawer */}
        <div className="relative w-full max-w-md bg-slate-900 h-full shadow-2xl border-l border-slate-700 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-6 border-b border-slate-700 flex flex-col bg-slate-900/50 gap-4">
            <div className="flex justify-between items-center">
              <h2 id="version-history-title" className="text-xl font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" aria-hidden="true" />
                Version History
                <span className="text-sm font-normal text-slate-400">({stats.filtered}/{stats.total})</span>
              </h2>
              <div className="flex gap-2">
                {versions.length > 0 && (
                  <>
                    <button
                      onClick={() => setShowStats(!showStats)}
                      className={`p-2 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${showStats ? 'text-blue-400 bg-blue-900/20' : 'text-slate-400 hover:text-white'}`}
                      title="Show Statistics"
                      aria-label="Toggle statistics panel"
                    >
                      <BarChart3 className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={onClearHistory}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500"
                      title="Clear All History"
                      aria-label="Clear all version history"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                  aria-label="Close version history panel"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Statistics Panel */}
            {showStats && (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 space-y-2 text-sm">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Statistics
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-slate-400">Total Versions</div>
                    <div className="text-white font-semibold">{stats.total}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Filtered</div>
                    <div className="text-white font-semibold">{stats.filtered}</div>
                  </div>
                  {stats.mostUsedStyle && (
                    <div className="col-span-2">
                      <div className="text-slate-400">Most Used Style</div>
                      <div className="text-white font-semibold truncate">{stats.mostUsedStyle}</div>
                    </div>
                  )}
                  {stats.mostUsedPalette && (
                    <div className="col-span-2">
                      <div className="text-slate-400">Most Used Palette</div>
                      <div className="text-white font-semibold truncate">{stats.mostUsedPalette}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Toolbar: Search & Sort */}
            <div className="flex gap-2" role="search">
              <div className="relative flex-grow">
                <label htmlFor="version-search" className="sr-only">Search versions</label>
                <input
                  id="version-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  aria-label="Search saved versions by topic or title"
                  className="w-full bg-slate-800 border border-slate-700 text-sm text-white rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" aria-hidden="true" />
              </div>

              <div className="relative">
                <label htmlFor="version-sort" className="sr-only">Sort versions</label>
                <select
                  id="version-sort"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  aria-label="Sort versions by date or name"
                  className="appearance-none bg-slate-800 border border-slate-700 text-sm text-white rounded-lg pl-3 pr-8 py-2 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer w-full"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="az">A-Z</option>
                  <option value="za">Z-A</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" aria-hidden="true">
                   {sortOrder === 'newest' && <CalendarClock className="w-4 h-4" />}
                   {sortOrder === 'oldest' && <CalendarArrowDown className="w-4 h-4" />}
                   {sortOrder === 'az' && <ArrowDownAZ className="w-4 h-4" />}
                   {sortOrder === 'za' && <ArrowUpAZ className="w-4 h-4" />}
                </div>
              </div>

              {/* Filter Toggle Button */}
              {versions.length > 0 && (
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                    showFilters
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  {showFilters ? 'Hide Filters' : 'Advanced Filters'}
                </button>
              )}
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Advanced Filters
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Resolution</label>
                    <select
                      value={filters.size || ''}
                      onChange={(e) => setFilters({ ...filters, size: e.target.value as ImageSize || undefined })}
                      className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">All</option>
                      {Object.values(ImageSize).map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Aspect Ratio</label>
                    <select
                      value={filters.aspectRatio || ''}
                      onChange={(e) => setFilters({ ...filters, aspectRatio: e.target.value as AspectRatio || undefined })}
                      className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">All</option>
                      {Object.values(AspectRatio).map(ratio => (
                        <option key={ratio} value={ratio}>{ratio}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs text-slate-400 block mb-1">Style</label>
                    <select
                      value={filters.style || ''}
                      onChange={(e) => setFilters({ ...filters, style: e.target.value as InfographicStyle || undefined })}
                      className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">All Styles</option>
                      {Object.values(InfographicStyle).map(style => (
                        <option key={style} value={style}>{style}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs text-slate-400 block mb-1">Color Palette</label>
                    <select
                      value={filters.palette || ''}
                      onChange={(e) => setFilters({ ...filters, palette: e.target.value as ColorPalette || undefined })}
                      className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">All Palettes</option>
                      {Object.values(ColorPalette).map(palette => (
                        <option key={palette} value={palette}>{palette}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Date From</label>
                    <input
                      type="date"
                      value={filters.dateFrom || ''}
                      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Date To</label>
                    <input
                      type="date"
                      value={filters.dateTo || ''}
                      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

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

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {filteredVersions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 animate-in fade-in duration-500">
                <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>{searchQuery ? 'No matching versions found.' : 'No saved versions yet.'}</p>
                {!searchQuery && <p className="text-xs mt-1">Generate an infographic and save it to see it here.</p>}
              </div>
            ) : (
              <>
                {paginatedVersions.map((version, index) => {
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
                        <div className="absolute top-4 right-4 z-10" aria-hidden="true">
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
                            className="text-slate-500 hover:text-red-400 transition-opacity absolute top-4 right-4 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                            title="Delete Version"
                            aria-label={`Delete version: ${version.data.analysis.title}`}
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
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
                          <img src={version.data.imageUrl} alt={`Thumbnail of ${version.data.analysis.title}`} className="w-full h-full object-cover" />
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
              })}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="sticky bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 p-4 mt-4">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <div className="text-slate-400">
                        Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredVersions.length)} of {filteredVersions.length}
                      </div>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="bg-slate-800 border border-slate-700 text-xs text-white rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="10">10 per page</option>
                        <option value="25">25 per page</option>
                        <option value="50">50 per page</option>
                        <option value="100">100 per page</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="text-slate-300 text-sm min-w-[80px] text-center">
                        Page {currentPage} of {totalPages}
                      </div>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                        aria-label="Next page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
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