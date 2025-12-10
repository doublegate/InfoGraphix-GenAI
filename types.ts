export enum ImageSize {
  Resolution_1K = '1K',
  Resolution_2K = '2K',
  Resolution_4K = '4K',
}

export enum AspectRatio {
  Square = '1:1',
  Landscape = '16:9',
  Portrait = '9:16',
  StandardLandscape = '4:3',
  StandardPortrait = '3:4',
}

export enum InfographicStyle {
  Modern = 'Modern Minimalist',
  Futuristic = 'Futuristic / Sci-Fi',
  Engineering = 'Engineering Blueprint',
  Vintage = 'Vintage / Retro',
  Corporate = 'Corporate Professional',
  Abstract = 'Abstract Data Art',
  HandDrawn = 'Hand Drawn Sketch',
  Isometric = 'Isometric 3D',
  Cyberpunk = 'Cyberpunk / Glitch',
  Watercolor = 'Watercolor / Artistic',
  PopArt = 'Pop Art / Comic',
  // New Styles
  Bauhaus = 'Bauhaus / Geometric',
  Vaporwave = 'Vaporwave / Aesthetic',
  FlatDesign = 'Flat Design 2.0',
  LowPoly = 'Low Poly 3D',
  ArtDeco = 'Art Deco / Luxury',
  PixelArt = 'Pixel Art / 8-Bit',
  PaperCutout = 'Paper Cutout / Craft',
  Chalkboard = 'Chalkboard / Educational',
  Glassmorphism = 'Glassmorphism / Frosted',
  Steampunk = 'Steampunk / Industrial',
  Claymorphism = 'Claymorphism / Soft 3D',
  Graffiti = 'Graffiti / Street Art'
}

export enum ColorPalette {
  BlueWhite = 'Professional Blue & White',
  DarkNeon = 'Dark Mode Neon',
  Warm = 'Warm Earth Tones',
  Monochrome = 'Monochrome',
  Vibrant = 'High Contrast Vibrant',
  Pastel = 'Soft Pastels',
  Forest = 'Forest Deep Greens',
  Sunset = 'Sunset Gradient',
  Midnight = 'Midnight Blue & Silver',
  GrayscaleRed = 'Grayscale with Red Accents'
}

export interface GithubFilters {
  language?: string;
  fileExtensions?: string;
  lastUpdatedAfter?: string;
}

export interface InfographicRequest {
  topic: string;
  size: ImageSize;
  aspectRatio: AspectRatio;
  filters?: GithubFilters;
}

export interface WebSource {
  title?: string;
  uri?: string;
}

export interface AnalysisResult {
  title: string;
  summary: string;
  keyPoints: string[];
  visualPlan: string;
  webSources?: WebSource[];
}

export interface GeneratedInfographic {
  imageUrl: string;
  analysis: AnalysisResult;
}

export interface Feedback {
  id: string;
  rating: number;
  comment: string;
  timestamp: number;
}

export interface SavedVersion {
  id: string;
  timestamp: number;
  topic: string;
  size: ImageSize;
  aspectRatio: AspectRatio;
  filters?: GithubFilters;
  style?: InfographicStyle;
  palette?: ColorPalette;
  data: GeneratedInfographic;
  feedback?: Feedback;
}

// Global declaration for the AI Studio environment API
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}