import React, { useState, useRef } from 'react';
import { Upload, Palette, Loader2, AlertCircle, CheckCircle, Trash2, Save } from 'lucide-react';
import { extractColorsFromImage, generateColorSchemes, isColorAccessible, getAccessibleTextColor, rgbToHex } from '../services/colorExtractionService';
import { ColorScheme } from '../types';

interface PaletteGeneratorProps {
  onPaletteGenerated?: (colors: string[]) => void;
  disabled?: boolean;
}

/**
 * Component for generating custom color palettes from uploaded images
 *
 * Features:
 * - Image upload with drag-and-drop support
 * - Color extraction using Vibrant.js
 * - Multiple color scheme generation (complementary, triadic, analogous, etc.)
 * - WCAG accessibility checking
 * - Custom palette saving to localStorage
 * - Visual color preview with hex codes
 *
 * @component
 */
export function PaletteGenerator({ onPaletteGenerated, disabled = false }: PaletteGeneratorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [colorSchemes, setColorSchemes] = useState<ColorScheme[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<ColorScheme | null>(null);
  const [paletteName, setPaletteName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  /**
   * Handle file upload and color extraction
   */
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSaveSuccess(false);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setUploadedImage(imageDataUrl);

      // Extract colors
      const colors = await extractColorsFromImage(imageDataUrl);
      setExtractedColors(colors);

      // Generate color schemes
      if (colors.length > 0) {
        const schemes = generateColorSchemes(colors[0]); // Use dominant color as base
        setColorSchemes(schemes);
        setSelectedScheme(schemes[0]); // Select first scheme by default
      }

      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process image';
      setError(errorMessage);
      console.error('Image processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle file input change
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  /**
   * Handle drag and drop
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  /**
   * Trigger file input click
   */
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  /**
   * Apply selected color scheme
   */
  const handleApplyScheme = () => {
    if (selectedScheme && onPaletteGenerated) {
      onPaletteGenerated(selectedScheme.colors);
    }
  };

  /**
   * Save custom palette to localStorage
   */
  const handleSavePalette = () => {
    if (!selectedScheme || !paletteName.trim()) {
      return;
    }

    try {
      const customPalettes = JSON.parse(localStorage.getItem('infographix_custom_palettes') || '[]');
      const newPalette = {
        name: paletteName.trim(),
        colors: selectedScheme.colors,
        createdAt: new Date().toISOString()
      };

      customPalettes.push(newPalette);
      localStorage.setItem('infographix_custom_palettes', JSON.stringify(customPalettes));

      setSaveSuccess(true);
      setPaletteName('');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save palette:', err);
      setError('Failed to save custom palette');
    }
  };

  /**
   * Clear all data
   */
  const handleClear = () => {
    setUploadedImage(null);
    setExtractedColors([]);
    setColorSchemes([]);
    setSelectedScheme(null);
    setError(null);
    setSaveSuccess(false);
    setPaletteName('');
  };

  /**
   * Render color swatch
   */
  const ColorSwatch = ({ color, size = 'md' }: { color: string; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16'
    };

    const textColor = getAccessibleTextColor(color);
    const isAccessible = isColorAccessible(color, '#000000');

    return (
      <div className="flex flex-col items-center gap-1">
        <div
          className={`${sizeClasses[size]} rounded-lg border-2 border-gray-300 shadow-sm relative group cursor-pointer`}
          style={{ backgroundColor: color }}
          title={color}
        >
          {isAccessible && size !== 'sm' && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <CheckCircle className="w-4 h-4" style={{ color: textColor }} />
            </div>
          )}
        </div>
        <span className="text-xs font-mono text-gray-600">{color.toUpperCase()}</span>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-6 shadow-sm border border-pink-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-pink-600" />
        <h3 className="text-lg font-semibold text-gray-900">Custom Palette Generator</h3>
      </div>

      {/* Upload Area */}
      {!uploadedImage && (
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-400 hover:bg-pink-50 transition-colors cursor-pointer"
          onClick={triggerFileInput}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled || isProcessing}
          />

          {isProcessing ? (
            <div>
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-3 text-pink-600" />
              <p className="text-gray-600 mb-1">Processing image...</p>
              <p className="text-sm text-gray-500">Extracting colors with AI</p>
            </div>
          ) : (
            <div>
              <Upload className="w-12 h-12 mx-auto mb-3 text-pink-400" />
              <p className="text-gray-600 mb-1">Drop an image here or click to upload</p>
              <p className="text-sm text-gray-500">PNG, JPEG, or other image formats (max 10MB)</p>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {uploadedImage && extractedColors.length > 0 && (
        <div className="space-y-6">
          {/* Uploaded Image Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-900">Uploaded Image</h4>
              <button
                onClick={handleClear}
                className="text-sm text-gray-600 hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
            <img
              src={uploadedImage}
              alt="Uploaded"
              className="w-full h-48 object-cover rounded-lg border border-gray-200"
            />
          </div>

          {/* Extracted Colors */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Extracted Colors</h4>
            <div className="flex flex-wrap gap-4">
              {extractedColors.map((color, index) => (
                <ColorSwatch key={index} color={color} size="lg" />
              ))}
            </div>
          </div>

          {/* Color Schemes */}
          {colorSchemes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Generated Color Schemes</h4>
              <div className="space-y-3">
                {colorSchemes.map((scheme, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedScheme(scheme)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedScheme?.type === scheme.type
                        ? 'border-pink-500 bg-pink-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900 capitalize">{scheme.type}</span>
                      {selectedScheme?.type === scheme.type && (
                        <CheckCircle className="w-5 h-5 text-pink-600" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      {scheme.colors.map((color, colorIndex) => (
                        <ColorSwatch key={colorIndex} color={color} size="md" />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Save Custom Palette */}
          {selectedScheme && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Save Custom Palette</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={paletteName}
                  onChange={(e) => setPaletteName(e.target.value)}
                  placeholder="Enter palette name..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  disabled={disabled}
                />
                <button
                  onClick={handleSavePalette}
                  disabled={!paletteName.trim() || disabled}
                  className="px-4 py-2 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
              {saveSuccess && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Palette saved successfully!
                </div>
              )}
            </div>
          )}

          {/* Apply Button */}
          {selectedScheme && onPaletteGenerated && (
            <button
              onClick={handleApplyScheme}
              disabled={disabled}
              className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Color Scheme
            </button>
          )}
        </div>
      )}
    </div>
  );
}
