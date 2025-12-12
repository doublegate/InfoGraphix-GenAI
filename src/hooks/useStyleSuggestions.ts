import { useState, useCallback } from 'react';
import { suggestStyleAndPalette } from '../services/geminiService';
import { StyleSuggestion, InfographicStyle, ColorPalette } from '../types';

interface UseStyleSuggestionsReturn {
  suggestions: StyleSuggestion | null;
  isLoading: boolean;
  error: string | null;
  getSuggestions: (topic: string, url?: string, context?: string) => Promise<void>;
  applySuggestion: (styleIndex: number, paletteIndex: number) => {
    style: InfographicStyle;
    palette: ColorPalette;
  } | null;
  clearSuggestions: () => void;
}

/**
 * Custom hook for managing AI-powered style and palette suggestions
 *
 * Provides:
 * - Fetching suggestions based on topic/URL/context
 * - Loading and error state management
 * - Applying suggestions to form state
 * - Clearing suggestions
 *
 * @returns {UseStyleSuggestionsReturn} Hook interface
 *
 * @example
 * const { suggestions, isLoading, getSuggestions, applySuggestion } = useStyleSuggestions();
 *
 * // Fetch suggestions
 * await getSuggestions('Climate Change', 'https://example.com');
 *
 * // Apply first style and first palette
 * const result = applySuggestion(0, 0);
 * if (result) {
 *   setStyle(result.style);
 *   setPalette(result.palette);
 * }
 */
export function useStyleSuggestions(): UseStyleSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<StyleSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch AI-powered style and palette suggestions
   */
  const getSuggestions = useCallback(async (
    topic: string,
    url?: string,
    context?: string
  ): Promise<void> => {
    if (!topic.trim()) {
      setError('Topic is required for suggestions');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const result = await suggestStyleAndPalette(topic);
      setSuggestions(result);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get suggestions';
      setError(errorMessage);
      setSuggestions(null);
      console.error('Style suggestion error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Apply a specific style and palette suggestion
   *
   * @param styleIndex - Index of the style suggestion (0-2)
   * @param paletteIndex - Index of the palette suggestion (0-2)
   * @returns Selected style and palette or null if invalid
   */
  const applySuggestion = useCallback((
    styleIndex: number,
    paletteIndex: number
  ): { style: InfographicStyle; palette: ColorPalette } | null => {
    if (!suggestions) {
      console.warn('No suggestions available to apply');
      return null;
    }

    if (styleIndex < 0 || styleIndex >= suggestions.suggestedStyles.length) {
      console.warn('Invalid style index:', styleIndex);
      return null;
    }

    if (paletteIndex < 0 || paletteIndex >= suggestions.suggestedPalettes.length) {
      console.warn('Invalid palette index:', paletteIndex);
      return null;
    }

    const selectedStyle = suggestions.suggestedStyles[styleIndex].style;
    const selectedPalette = suggestions.suggestedPalettes[paletteIndex].palette;

    return {
      style: selectedStyle,
      palette: selectedPalette
    };
  }, [suggestions]);

  /**
   * Clear current suggestions and reset state
   */
  const clearSuggestions = useCallback(() => {
    setSuggestions(null);
    setError(null);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    getSuggestions,
    applySuggestion,
    clearSuggestions
  };
}
