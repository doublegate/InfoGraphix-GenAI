import React from 'react';
import { Sparkles, Palette, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { StyleSuggestion, InfographicStyle, ColorPalette } from '../types';

interface StyleSuggestionsProps {
  suggestions: StyleSuggestion | null;
  isLoading: boolean;
  error: string | null;
  currentStyle?: InfographicStyle;
  currentPalette?: ColorPalette;
  onApply: (styleIndex: number, paletteIndex: number) => void;
  onRequestSuggestions: () => void;
  disabled?: boolean;
}

/**
 * Component displaying AI-powered style and palette suggestions
 *
 * Features:
 * - Three style suggestions with reasoning
 * - Three palette suggestions with confidence scores
 * - Visual indicators for currently selected options
 * - One-click application of suggestions
 * - Loading and error states
 *
 * @component
 */
export function StyleSuggestions({
  suggestions,
  isLoading,
  error,
  currentStyle,
  currentPalette,
  onApply,
  onRequestSuggestions,
  disabled = false
}: StyleSuggestionsProps) {
  const [selectedStyleIndex, setSelectedStyleIndex] = React.useState<number | null>(null);
  const [selectedPaletteIndex, setSelectedPaletteIndex] = React.useState<number | null>(null);

  // Reset selection when suggestions change
  React.useEffect(() => {
    setSelectedStyleIndex(null);
    setSelectedPaletteIndex(null);
  }, [suggestions]);

  const handleApply = () => {
    if (selectedStyleIndex !== null && selectedPaletteIndex !== null) {
      onApply(selectedStyleIndex, selectedPaletteIndex);
    }
  };

  const canApply = selectedStyleIndex !== null && selectedPaletteIndex !== null && !disabled;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 shadow-sm border border-purple-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Design Suggestions</h3>
        </div>
        <button
          onClick={onRequestSuggestions}
          disabled={isLoading || disabled}
          className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </span>
          ) : (
            'Get Suggestions'
          )}
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-600" />
          <p className="text-gray-600">Analyzing your topic with AI...</p>
          <p className="text-sm text-gray-500 mt-1">This may take a moment</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Failed to get suggestions</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Suggestions Content */}
      {suggestions && !isLoading && (
        <div className="space-y-6">
          {/* Analysis Summary */}
          {suggestions.analysis && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed">{suggestions.analysis}</p>
            </div>
          )}

          {/* Style Suggestions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-semibold text-gray-900">Recommended Styles</h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {suggestions.styles.map((item, index) => {
                const isSelected = selectedStyleIndex === index;
                const isCurrent = currentStyle === item.style;

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedStyleIndex(index)}
                    disabled={disabled}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{item.style}</span>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{item.reasoning}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Palette Suggestions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-semibold text-gray-900">Recommended Color Palettes</h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {suggestions.palettes.map((item, index) => {
                const isSelected = selectedPaletteIndex === index;
                const isCurrent = currentPalette === item.palette;
                const confidenceColor = item.confidence >= 0.8 ? 'text-green-600' : item.confidence >= 0.6 ? 'text-yellow-600' : 'text-gray-600';

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedPaletteIndex(index)}
                    disabled={disabled}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{item.palette}</span>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              Current
                            </span>
                          )}
                          <span className={`text-xs font-medium ${confidenceColor}`}>
                            {Math.round(item.confidence * 100)}% match
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{item.reasoning}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Apply Button */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {selectedStyleIndex !== null && selectedPaletteIndex !== null
                ? 'Ready to apply your selections'
                : 'Select one style and one palette to apply'}
            </p>
            <button
              onClick={handleApply}
              disabled={!canApply}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
            >
              Apply Selections
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!suggestions && !isLoading && !error && (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-300" />
          <p className="text-gray-600 mb-1">No suggestions yet</p>
          <p className="text-sm text-gray-500">Click "Get Suggestions" to receive AI-powered design recommendations</p>
        </div>
      )}
    </div>
  );
}
