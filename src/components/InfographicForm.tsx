import React, { useState, useEffect, useCallback } from 'react';
import { log } from '../utils/logger';
import ReactDOM from 'react-dom';
import { Search, Monitor, Image as ImageIcon, FileText, Cpu, ChevronDown, ChevronUp, Filter, Palette, Paintbrush, RefreshCw, Upload, X, Sparkles, List } from 'lucide-react';
import { ImageSize, AspectRatio, GithubFilters, InfographicStyle, ColorPalette, TemplateConfig, InfographicRequest } from '../types';
import RichSelect, { RichOption } from './RichSelect';
import { TemplateBrowser } from './TemplateManager';
import { StyleSuggestions } from './StyleSuggestions';
import { PaletteGenerator } from './PaletteGenerator';
import { useStyleSuggestions } from '../hooks/useStyleSuggestions';

interface InfographicFormProps {
  onSubmit: (request: InfographicRequest) => void;
  isProcessing: boolean;
  initialValues?: Partial<InfographicRequest>;
}

const STORAGE_KEY_RECENT = 'infographix_recent_topics';
const STORAGE_KEY_DRAFT = 'infographix_form_draft';

// Define Style Previews (Simulating pre-generated assets)
// Using placeholder service to represent the static images that would be saved in the project
const STYLE_PREVIEWS: Record<InfographicStyle, React.ReactNode> = {
  [InfographicStyle.Modern]: <img src="https://placehold.co/120x80/1e293b/FFFFFF?text=Modern" alt="Modern" className="w-full h-full object-cover" />,
  [InfographicStyle.Futuristic]: <img src="https://placehold.co/120x80/0f172a/00f0ff?text=Sci-Fi" alt="Futuristic" className="w-full h-full object-cover" />,
  [InfographicStyle.Engineering]: <img src="https://placehold.co/120x80/003366/FFFFFF?text=Blueprint" alt="Engineering" className="w-full h-full object-cover" />,
  [InfographicStyle.Vintage]: <img src="https://placehold.co/120x80/f5e6d3/5c4033?text=Vintage" alt="Vintage" className="w-full h-full object-cover" />,
  [InfographicStyle.Corporate]: <img src="https://placehold.co/120x80/eef2f6/1e3a8a?text=Corp" alt="Corporate" className="w-full h-full object-cover" />,
  [InfographicStyle.Abstract]: <img src="https://placehold.co/120x80/333333/ff00cc?text=Abstract" alt="Abstract" className="w-full h-full object-cover" />,
  [InfographicStyle.HandDrawn]: <img src="https://placehold.co/120x80/ffffff/000000?text=Sketch" alt="Hand Drawn" className="w-full h-full object-cover" />,
  [InfographicStyle.Isometric]: <img src="https://placehold.co/120x80/e0e0e0/333333?text=ISO" alt="Isometric" className="w-full h-full object-cover" />,
  [InfographicStyle.Cyberpunk]: <img src="https://placehold.co/120x80/120024/00ff00?text=Cyber" alt="Cyberpunk" className="w-full h-full object-cover" />,
  [InfographicStyle.Watercolor]: <img src="https://placehold.co/120x80/ffffff/ff9999?text=Paint" alt="Watercolor" className="w-full h-full object-cover" />,
  [InfographicStyle.PopArt]: <img src="https://placehold.co/120x80/ffff00/ff0000?text=POP" alt="Pop Art" className="w-full h-full object-cover" />,
  // New Styles
  [InfographicStyle.Bauhaus]: <img src="https://placehold.co/120x80/f0e2b6/c41e3a?text=Bauhaus" alt="Bauhaus" className="w-full h-full object-cover" />,
  [InfographicStyle.Vaporwave]: <img src="https://placehold.co/120x80/ff71ce/01cdfe?text=Vapor" alt="Vaporwave" className="w-full h-full object-cover" />,
  [InfographicStyle.FlatDesign]: <img src="https://placehold.co/120x80/2ecc71/ffffff?text=Flat" alt="Flat Design" className="w-full h-full object-cover" />,
  [InfographicStyle.LowPoly]: <img src="https://placehold.co/120x80/5533ff/ff33cc?text=Poly" alt="Low Poly" className="w-full h-full object-cover" />,
  [InfographicStyle.ArtDeco]: <img src="https://placehold.co/120x80/2c3e50/d4af37?text=Deco" alt="Art Deco" className="w-full h-full object-cover" />,
  [InfographicStyle.PixelArt]: <img src="https://placehold.co/120x80/000000/00ff00?text=8-Bit" alt="Pixel Art" className="w-full h-full object-cover" />,
  [InfographicStyle.PaperCutout]: <img src="https://placehold.co/120x80/ff9999/ffffff?text=Paper" alt="Paper Cutout" className="w-full h-full object-cover" />,
  [InfographicStyle.Chalkboard]: <img src="https://placehold.co/120x80/333333/ffffff?text=Chalk" alt="Chalkboard" className="w-full h-full object-cover" />,
  [InfographicStyle.Glassmorphism]: <img src="https://placehold.co/120x80/89cff0/ffffff?text=Glass" alt="Glassmorphism" className="w-full h-full object-cover" />,
  [InfographicStyle.Steampunk]: <img src="https://placehold.co/120x80/4b3621/cd7f32?text=Steam" alt="Steampunk" className="w-full h-full object-cover" />,
  [InfographicStyle.Claymorphism]: <img src="https://placehold.co/120x80/ffaaee/ffffff?text=Clay" alt="Claymorphism" className="w-full h-full object-cover" />,
  [InfographicStyle.Graffiti]: <img src="https://placehold.co/120x80/333333/ffff00?text=Graffiti" alt="Graffiti" className="w-full h-full object-cover" />,
};

// Define Palette Previews using CSS Gradients (Lightweight & Accurate)
const PALETTE_PREVIEWS: Record<ColorPalette, React.ReactNode> = {
  [ColorPalette.BlueWhite]: <div className="w-full h-full bg-gradient-to-br from-blue-600 to-slate-100" />,
  [ColorPalette.DarkNeon]: <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-pink-500" />,
  [ColorPalette.Warm]: <div className="w-full h-full bg-gradient-to-br from-orange-700 via-amber-600 to-yellow-200" />,
  [ColorPalette.Monochrome]: <div className="w-full h-full bg-gradient-to-br from-black via-gray-500 to-white" />,
  [ColorPalette.Vibrant]: <div className="w-full h-full bg-gradient-to-br from-red-500 via-yellow-400 to-blue-500" />,
  [ColorPalette.Pastel]: <div className="w-full h-full bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200" />,
  [ColorPalette.Forest]: <div className="w-full h-full bg-gradient-to-br from-green-900 via-emerald-700 to-lime-200" />,
  [ColorPalette.Sunset]: <div className="w-full h-full bg-gradient-to-br from-purple-800 via-red-500 to-yellow-400" />,
  [ColorPalette.Midnight]: <div className="w-full h-full bg-gradient-to-br from-blue-950 via-slate-800 to-gray-400" />,
  [ColorPalette.GrayscaleRed]: <div className="w-full h-full bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-red-600 via-gray-900 to-black" />,
};

// Define Rich Options with Descriptions and Previews
const STYLE_OPTIONS: RichOption[] = [
  { value: InfographicStyle.Modern, label: InfographicStyle.Modern, description: "Clean lines, sans-serif typography, and ample whitespace.", preview: STYLE_PREVIEWS[InfographicStyle.Modern] },
  { value: InfographicStyle.Futuristic, label: InfographicStyle.Futuristic, description: "Neon glows, dark backgrounds, and holographic elements.", preview: STYLE_PREVIEWS[InfographicStyle.Futuristic] },
  { value: InfographicStyle.Engineering, label: InfographicStyle.Engineering, description: "Technical blueprint style with grid lines.", preview: STYLE_PREVIEWS[InfographicStyle.Engineering] },
  { value: InfographicStyle.Vintage, label: InfographicStyle.Vintage, description: "Aged paper textures, classic serif fonts.", preview: STYLE_PREVIEWS[InfographicStyle.Vintage] },
  { value: InfographicStyle.Corporate, label: InfographicStyle.Corporate, description: "Professional, trustworthy design with blue/grey tones.", preview: STYLE_PREVIEWS[InfographicStyle.Corporate] },
  { value: InfographicStyle.Abstract, label: InfographicStyle.Abstract, description: "Creative data visualization using fluid shapes.", preview: STYLE_PREVIEWS[InfographicStyle.Abstract] },
  { value: InfographicStyle.HandDrawn, label: InfographicStyle.HandDrawn, description: "Organic look simulating pencil sketches.", preview: STYLE_PREVIEWS[InfographicStyle.HandDrawn] },
  { value: InfographicStyle.Isometric, label: InfographicStyle.Isometric, description: "3D perspective with geometric block structures.", preview: STYLE_PREVIEWS[InfographicStyle.Isometric] },
  { value: InfographicStyle.Cyberpunk, label: InfographicStyle.Cyberpunk, description: "High-contrast, dystopian aesthetic with glitch effects.", preview: STYLE_PREVIEWS[InfographicStyle.Cyberpunk] },
  { value: InfographicStyle.Watercolor, label: InfographicStyle.Watercolor, description: "Soft, blended colors with an organic painted feel.", preview: STYLE_PREVIEWS[InfographicStyle.Watercolor] },
  { value: InfographicStyle.PopArt, label: InfographicStyle.PopArt, description: "Bold colors, thick outlines, and comic-book style.", preview: STYLE_PREVIEWS[InfographicStyle.PopArt] },
  // New Options
  { value: InfographicStyle.Bauhaus, label: InfographicStyle.Bauhaus, description: "Geometric shapes, primary colors, and functional minimalism.", preview: STYLE_PREVIEWS[InfographicStyle.Bauhaus] },
  { value: InfographicStyle.Vaporwave, label: InfographicStyle.Vaporwave, description: "Retro-futurist 80s/90s aesthetic with pinks and cyans.", preview: STYLE_PREVIEWS[InfographicStyle.Vaporwave] },
  { value: InfographicStyle.FlatDesign, label: InfographicStyle.FlatDesign, description: "2D illustrations with bright colors and no drop shadows.", preview: STYLE_PREVIEWS[InfographicStyle.FlatDesign] },
  { value: InfographicStyle.LowPoly, label: InfographicStyle.LowPoly, description: "3D mesh style using geometric polygons and facets.", preview: STYLE_PREVIEWS[InfographicStyle.LowPoly] },
  { value: InfographicStyle.ArtDeco, label: InfographicStyle.ArtDeco, description: "Luxury 1920s style with gold accents and geometric patterns.", preview: STYLE_PREVIEWS[InfographicStyle.ArtDeco] },
  { value: InfographicStyle.PixelArt, label: InfographicStyle.PixelArt, description: "8-bit retro gaming aesthetic with blocky visuals.", preview: STYLE_PREVIEWS[InfographicStyle.PixelArt] },
  { value: InfographicStyle.PaperCutout, label: InfographicStyle.PaperCutout, description: "Layered paper effect with depth shadows and texture.", preview: STYLE_PREVIEWS[InfographicStyle.PaperCutout] },
  { value: InfographicStyle.Chalkboard, label: InfographicStyle.Chalkboard, description: "White chalk drawings on a dark textured background.", preview: STYLE_PREVIEWS[InfographicStyle.Chalkboard] },
  { value: InfographicStyle.Glassmorphism, label: InfographicStyle.Glassmorphism, description: "Translucent frosted glass effects with floating layers.", preview: STYLE_PREVIEWS[InfographicStyle.Glassmorphism] },
  { value: InfographicStyle.Steampunk, label: InfographicStyle.Steampunk, description: "Victorian industrial sci-fi with brass, gears, and steam.", preview: STYLE_PREVIEWS[InfographicStyle.Steampunk] },
  { value: InfographicStyle.Claymorphism, label: InfographicStyle.Claymorphism, description: "Soft, inflated 3D shapes with smooth matte finishes.", preview: STYLE_PREVIEWS[InfographicStyle.Claymorphism] },
  { value: InfographicStyle.Graffiti, label: InfographicStyle.Graffiti, description: "Urban street art style with spray paint and tags.", preview: STYLE_PREVIEWS[InfographicStyle.Graffiti] },
];

const PALETTE_OPTIONS: RichOption[] = [
  { value: ColorPalette.BlueWhite, label: ColorPalette.BlueWhite, description: "Standard professional look. Trustworthy and clean.", preview: PALETTE_PREVIEWS[ColorPalette.BlueWhite] },
  { value: ColorPalette.DarkNeon, label: ColorPalette.DarkNeon, description: "High contrast neon colors on deep black/grey.", preview: PALETTE_PREVIEWS[ColorPalette.DarkNeon] },
  { value: ColorPalette.Warm, label: ColorPalette.Warm, description: "Inviting earth tones: browns, oranges, and soft yellows.", preview: PALETTE_PREVIEWS[ColorPalette.Warm] },
  { value: ColorPalette.Monochrome, label: ColorPalette.Monochrome, description: "Black, white, and greyscale. Minimalist.", preview: PALETTE_PREVIEWS[ColorPalette.Monochrome] },
  { value: ColorPalette.Vibrant, label: ColorPalette.Vibrant, description: "High saturation colors for maximum impact.", preview: PALETTE_PREVIEWS[ColorPalette.Vibrant] },
  { value: ColorPalette.Pastel, label: ColorPalette.Pastel, description: "Soft, desaturated pinks, blues, and mints.", preview: PALETTE_PREVIEWS[ColorPalette.Pastel] },
  { value: ColorPalette.Forest, label: ColorPalette.Forest, description: "Deep greens, woody browns, and nature hues.", preview: PALETTE_PREVIEWS[ColorPalette.Forest] },
  { value: ColorPalette.Sunset, label: ColorPalette.Sunset, description: "Gradient transition from purple to orange.", preview: PALETTE_PREVIEWS[ColorPalette.Sunset] },
  { value: ColorPalette.Midnight, label: ColorPalette.Midnight, description: "Deep blues, cool silvers, and moonlight whites.", preview: PALETTE_PREVIEWS[ColorPalette.Midnight] },
  { value: ColorPalette.GrayscaleRed, label: ColorPalette.GrayscaleRed, description: "Black and white base with bold red highlights.", preview: PALETTE_PREVIEWS[ColorPalette.GrayscaleRed] },
];

// eslint-disable-next-line complexity
const InfographicForm: React.FC<InfographicFormProps> = ({ onSubmit, isProcessing, initialValues }) => {
  const [topic, setTopic] = useState('');
  const [size, setSize] = useState<ImageSize>(ImageSize.Resolution_1K);
  const [ratio, setRatio] = useState<AspectRatio>(AspectRatio.Portrait);
  const [style, setStyle] = useState<InfographicStyle>(InfographicStyle.Modern);
  const [palette, setPalette] = useState<ColorPalette>(ColorPalette.BlueWhite);
  
  // File Upload State
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [language, setLanguage] = useState('');
  const [extensions, setExtensions] = useState('');
  const [date, setDate] = useState('');

  // Draft & Recent State
  const [recentTopics, setRecentTopics] = useState<string[]>([]);
  const [hasDraft, setHasDraft] = useState(false);

  // Template State
  const [showTemplateBrowser, setShowTemplateBrowser] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<TemplateConfig | null>(null);

  // Multi-URL State
  const [isMultiUrlMode, setIsMultiUrlMode] = useState(false);

  // AI Suggestions State
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [showPaletteGenerator, setShowPaletteGenerator] = useState(false);
  const { suggestions, isLoading: suggestionsLoading, error: suggestionsError, getSuggestions, applySuggestion } = useStyleSuggestions();

  // Load initial values if provided (handles Partial<InfographicRequest>)
  useEffect(() => {
    if (initialValues) {
      if (initialValues.topic !== undefined) setTopic(initialValues.topic);
      if (initialValues.size !== undefined) setSize(initialValues.size);
      if (initialValues.aspectRatio !== undefined) setRatio(initialValues.aspectRatio);
      if (initialValues.style !== undefined) setStyle(initialValues.style);
      if (initialValues.palette !== undefined) setPalette(initialValues.palette);
      if (initialValues.filters) {
        setLanguage(initialValues.filters.language || '');
        setExtensions(initialValues.filters.fileExtensions || '');
        setDate(initialValues.filters.lastUpdatedAfter || '');
        setShowFilters(true);
      }
    }
  }, [initialValues]);

  // Load Recent Topics & Check Draft on Mount
  useEffect(() => {
    try {
      const storedRecent = localStorage.getItem(STORAGE_KEY_RECENT);
      if (storedRecent) {
        setRecentTopics(JSON.parse(storedRecent));
      }

      const storedDraft = localStorage.getItem(STORAGE_KEY_DRAFT);
      if (storedDraft) {
        setHasDraft(true);
      }
    } catch (e) {
      log.error("Error accessing local storage", e);
    }
  }, []);

  // Auto-Save Draft
  useEffect(() => {
    const timer = setTimeout(() => {
      const draftState = {
        topic, size, ratio, style, palette,
        language, extensions, date
      };
      // Only save if there's actual data
      if (topic || language || extensions) {
        localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(draftState));
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [topic, size, ratio, style, palette, language, extensions, date]);

  // v1.8.0 - TD-015: Memoize event handlers
  const restoreDraft = useCallback(() => {
    try {
      const storedDraft = localStorage.getItem(STORAGE_KEY_DRAFT);
      if (storedDraft) {
        const data = JSON.parse(storedDraft);
        setTopic(data.topic || '');
        setSize(data.size || ImageSize.Resolution_1K);
        setRatio(data.ratio || AspectRatio.Portrait);
        setStyle(data.style || InfographicStyle.Modern);
        setPalette(data.palette || ColorPalette.BlueWhite);
        setLanguage(data.language || '');
        setExtensions(data.extensions || '');
        setDate(data.date || '');
        setHasDraft(false);
        if (data.language || data.extensions || data.date) setShowFilters(true);
      }
    } catch (e) {
      log.error("Failed to restore draft", e);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.md')) {
        alert('Please select a valid Markdown (.md) file.');
        return;
      }
      setIsUploadingFile(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFileContent(content);
        setFileName(file.name);
        setTopic(file.name.replace(/\.md$/i, '')); // Auto-fill topic with filename
        setIsUploadingFile(false);
      };
      reader.onerror = () => {
        alert('Error reading file. Please try again.');
        setIsUploadingFile(false);
      };
      reader.readAsText(file);
    }
  }, []);

  const clearFile = useCallback(() => {
    setFileName(null);
    setFileContent(null);
    setTopic('');
  }, []);

  const handleTemplateSelect = useCallback((template: TemplateConfig) => {
    setStyle(template.style);
    setPalette(template.palette);
    setSize(template.size);
    setRatio(template.aspectRatio);
    setActiveTemplate(template);
    setShowTemplateBrowser(false);
  }, []);

  const clearTemplate = useCallback(() => {
    setActiveTemplate(null);
  }, []);

  const handleRequestSuggestions = useCallback(async () => {
    if (topic.trim()) {
      await getSuggestions(topic, undefined, fileContent || undefined);
    }
  }, [topic, fileContent, getSuggestions]);

  const handleApplySuggestion = useCallback((styleIndex: number, paletteIndex: number) => {
    const result = applySuggestion(styleIndex, paletteIndex);
    if (result) {
      setStyle(result.style);
      setPalette(result.palette);
    }
  }, [applySuggestion]);

  const handlePaletteGenerated = useCallback((colors: string[]) => {
    // For now, we can't directly use custom colors in the ColorPalette enum
    // But we can suggest the closest match or save to localStorage for future use
    log.info('Generated palette colors:', colors);
    // This would require extending the palette system to support custom palettes
    // For v1.6.0, we save to localStorage and user can manually select closest match
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isProcessing) {
      // Save to recent topics if it's not a file (or even if it is, the name might be useful)
      if (!recentTopics.includes(topic.trim())) {
        const updated = [topic.trim(), ...recentTopics].slice(0, 10);
        setRecentTopics(updated);
        localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updated));
      }

      localStorage.removeItem(STORAGE_KEY_DRAFT);
      setHasDraft(false);

      const filters: GithubFilters | undefined = (language || extensions || date) ? {
        language: language || undefined,
        fileExtensions: extensions || undefined,
        lastUpdatedAfter: date || undefined
      } : undefined;

      // Create request object and submit
      onSubmit({
        topic,
        size,
        aspectRatio: ratio,
        style,
        palette,
        filters,
        fileContent: fileContent || undefined
      });
    }
  }, [topic, isProcessing, recentTopics, language, extensions, date, onSubmit, size, ratio, style, palette, fileContent]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-800/50 rounded-2xl border border-slate-700 p-6 backdrop-blur-md shadow-xl animate-in slide-in-from-bottom-5 duration-500 relative">
      
      {/* Restore Draft Notification */}
      {hasDraft && !topic && !fileName && (
        <div className="absolute top-0 left-0 right-0 -mt-12 flex justify-center z-10">
          <button 
            onClick={restoreDraft}
            className="bg-blue-600/90 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-full shadow-lg backdrop-blur flex items-center gap-2 transition-all animate-bounce"
          >
            <RefreshCw className="w-3 h-3" />
            Restore unsaved draft?
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Topic Input & File Upload */}
        <div>
          <div className="flex justify-between items-center mb-2 ml-1">
            <label className="text-sm font-medium text-slate-300">
              {fileName
                ? "Infographic Title"
                : isMultiUrlMode
                ? "Multiple URLs (one per line or comma-separated)"
                : "Topic, URL, or Repo"}
            </label>
            <div className="flex items-center gap-3">
              {!fileName && (
                <button
                  type="button"
                  onClick={() => setIsMultiUrlMode(!isMultiUrlMode)}
                  className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer flex items-center gap-1 transition-colors"
                  disabled={isProcessing}
                >
                  <List className="w-3 h-3" />
                  {isMultiUrlMode ? 'Single URL' : 'Multiple URLs'}
                </button>
              )}
              {!fileName && (
                <label className={`text-xs text-blue-400 hover:text-blue-300 cursor-pointer flex items-center gap-1 transition-colors ${isUploadingFile || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isUploadingFile ? (
                    <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-3 h-3" />
                  )}
                  {isUploadingFile ? 'Uploading...' : 'Upload .md file'}
                  <input
                    type="file"
                    accept=".md"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isProcessing || isUploadingFile}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="relative group">
            {isMultiUrlMode && !fileName ? (
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter URLs separated by commas or new lines:&#10;https://example.com/page1&#10;https://github.com/user/repo&#10;https://docs.python.org/3/"
                className="w-full bg-slate-900 border border-slate-700 group-hover:border-slate-600 text-white rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500 resize-none"
                disabled={isProcessing}
                rows={5}
              />
            ) : (
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={
                  fileName
                    ? "Enter a title for this infographic"
                    : "e.g., https://github.com/torvalds/linux or 'SpaceX Starship'"
                }
                className={`w-full bg-slate-900 border text-white rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500 ${
                  fileName
                    ? 'border-blue-500/50 ring-1 ring-blue-500/20'
                    : 'border-slate-700 group-hover:border-slate-600'
                }`}
                disabled={isProcessing}
                list={!fileName ? "recent-topics" : undefined}
              />
            )}

            {fileName ? (
              <FileText className="absolute left-4 top-4 text-blue-400 w-5 h-5" />
            ) : (
              <Search
                className={`absolute left-4 ${
                  isMultiUrlMode ? 'top-4' : 'top-1/2 -translate-y-1/2'
                } text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors`}
              />
            )}

            {!fileName && !isMultiUrlMode && (
              <datalist id="recent-topics">
                {recentTopics.map((rt, idx) => (
                  <option key={idx} value={rt} />
                ))}
              </datalist>
            )}
          </div>

          {/* File Active Indicator */}
          {fileName && (
            <div className="flex items-center justify-between mt-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-2">
                <div className="bg-blue-500/20 p-1.5 rounded">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                   <p className="text-sm text-blue-100 font-medium leading-none">Using local file: {fileName}</p>
                   <p className="text-xs text-blue-400/80 mt-1">Content will be used for analysis instead of web search.</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={clearFile}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Collapsible Advanced Filters */}
        <div className="border-t border-slate-700/50 pt-4">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-blue-400 transition-colors mb-4"
          >
            <Filter className="w-4 h-4" />
            Advanced Search Filters (GitHub/Code)
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Language</label>
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="e.g. Python, TypeScript"
                  className="w-full bg-slate-800 border border-slate-700 text-sm text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">File Extensions</label>
                <input
                  type="text"
                  value={extensions}
                  onChange={(e) => setExtensions(e.target.value)}
                  placeholder="e.g. .py, .tsx, .md"
                  className="w-full bg-slate-800 border border-slate-700 text-sm text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Updated After</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-sm text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
                  disabled={isProcessing}
                />
              </div>
            </div>
          )}
        </div>

        {/* AI Design Suggestions */}
        <div className="border-t border-slate-700/50 pt-4">
          <button
            type="button"
            onClick={() => setShowAiSuggestions(!showAiSuggestions)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-purple-400 transition-colors mb-4"
          >
            <Sparkles className="w-4 h-4" />
            AI Design Suggestions (Beta)
            {showAiSuggestions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAiSuggestions && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <StyleSuggestions
                suggestions={suggestions}
                isLoading={suggestionsLoading}
                error={suggestionsError}
                currentStyle={style}
                currentPalette={palette}
                onApply={handleApplySuggestion}
                onRequestSuggestions={() => { void handleRequestSuggestions(); }}
                disabled={isProcessing || !topic.trim()}
              />
            </div>
          )}
        </div>

        {/* Custom Palette Generator */}
        <div className="border-t border-slate-700/50 pt-4">
          <button
            type="button"
            onClick={() => setShowPaletteGenerator(!showPaletteGenerator)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-pink-400 transition-colors mb-4"
          >
            <Palette className="w-4 h-4" />
            Custom Palette Generator
            {showPaletteGenerator ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showPaletteGenerator && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <PaletteGenerator
                onPaletteGenerated={handlePaletteGenerated}
                disabled={isProcessing}
              />
            </div>
          )}
        </div>

        {/* Template Quick Apply */}
        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Quick Apply Template</h3>
              <p className="text-xs text-slate-400">
                {activeTemplate
                  ? `Using: ${activeTemplate.name}`
                  : 'Use a saved template or configure manually'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowTemplateBrowser(true)}
              disabled={isProcessing}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Browse Templates
            </button>
            {activeTemplate && (
              <button
                type="button"
                onClick={clearTemplate}
                disabled={isProcessing}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                title="Clear template"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Style & Palette Controls using RichSelect */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 z-30 relative">
          <div className="relative z-40">
            <RichSelect
              label="Artistic Style"
              icon={<Paintbrush className="w-4 h-4" />}
              value={style}
              options={STYLE_OPTIONS}
              onChange={(val) => setStyle(val as InfographicStyle)}
              disabled={isProcessing}
            />
          </div>

          <div className="relative z-40">
            <RichSelect
              label="Color Palette"
              icon={<Palette className="w-4 h-4" />}
              value={palette}
              options={PALETTE_OPTIONS}
              onChange={(val) => setPalette(val as ColorPalette)}
              disabled={isProcessing}
            />
          </div>
        </div>

        {/* Size & Ratio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          
          {/* Resolution Selection */}
          <div className="space-y-3">
            <span className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
              <Monitor className="w-4 h-4" /> Resolution
            </span>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(ImageSize).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  disabled={isProcessing}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all border ${
                    size === s
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Selection */}
          <div className="space-y-3">
            <span className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Orientation
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRatio(AspectRatio.Portrait)}
                disabled={isProcessing}
                className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all border flex items-center justify-center gap-2 ${
                  ratio === AspectRatio.Portrait
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="w-3 h-4 border-2 border-current rounded-sm"></div>
                Portrait
              </button>
              <button
                type="button"
                onClick={() => setRatio(AspectRatio.Landscape)}
                disabled={isProcessing}
                className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all border flex items-center justify-center gap-2 ${
                  ratio === AspectRatio.Landscape
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="w-4 h-3 border-2 border-current rounded-sm"></div>
                Landscape
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={!topic.trim() || isProcessing}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-xl ${
            !topic.trim() || isProcessing
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:scale-[1.02] active:scale-[0.98] shadow-blue-500/20'
          }`}
        >
          {isProcessing ? (
            <>
              <Cpu className="w-6 h-6 animate-pulse" />
              Processing with Gemini...
            </>
          ) : (
            <>
              <FileText className="w-6 h-6" />
              Generate Infographic
            </>
          )}
        </button>
      </form>

      {/* Template Browser Modal - Rendered via Portal to escape parent constraints */}
      {showTemplateBrowser && ReactDOM.createPortal(
        <TemplateBrowser
          isOpen={showTemplateBrowser}
          onClose={() => setShowTemplateBrowser(false)}
          mode="select"
          onApplyTemplate={handleTemplateSelect}
        />,
        document.body
      )}
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders (v1.8.0 - TD-015)
export default React.memo(InfographicForm);