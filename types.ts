/**
 * Available image resolution sizes for generated infographics.
 *
 * Higher resolutions produce larger, more detailed images but
 * consume more storage space and generation time.
 *
 * @remarks
 * - 1K: 1024px (fastest, smallest file size)
 * - 2K: 2048px (balanced quality/size)
 * - 4K: 4096px (highest quality, largest file size)
 */
export enum ImageSize {
  /** 1024px resolution - Fast generation, smaller files */
  Resolution_1K = '1K',
  /** 2048px resolution - Balanced quality and size */
  Resolution_2K = '2K',
  /** 4096px resolution - Maximum quality, larger files */
  Resolution_4K = '4K',
}

/**
 * Available aspect ratios for generated infographics.
 *
 * Choose based on intended use case:
 * - Square: Social media posts, profile images
 * - Landscape: Presentations, web banners
 * - Portrait: Mobile displays, print materials
 */
export enum AspectRatio {
  /** 1:1 - Perfect for social media posts */
  Square = '1:1',
  /** 16:9 - Widescreen, ideal for presentations */
  Landscape = '16:9',
  /** 9:16 - Tall format, ideal for mobile/stories */
  Portrait = '9:16',
  /** 4:3 - Traditional landscape format */
  StandardLandscape = '4:3',
  /** 3:4 - Traditional portrait format */
  StandardPortrait = '3:4',
}

/**
 * Visual styles for infographic generation.
 *
 * Each style defines the overall aesthetic, including:
 * - Layout patterns and visual hierarchy
 * - Illustration and icon styles
 * - Typography choices
 * - Visual effects and treatments
 *
 * @remarks 22 unique styles available, from professional to artistic
 */
export enum InfographicStyle {
  /** Clean lines, whitespace, contemporary feel */
  Modern = 'Modern Minimalist',
  /** High-tech, neon accents, digital aesthetic */
  Futuristic = 'Futuristic / Sci-Fi',
  /** Technical drawings, grid layouts, precision */
  Engineering = 'Engineering Blueprint',
  /** Nostalgic, aged textures, classic typography */
  Vintage = 'Vintage / Retro',
  /** Clean, authoritative, business-appropriate */
  Corporate = 'Corporate Professional',
  /** Artistic data visualization, creative layouts */
  Abstract = 'Abstract Data Art',
  /** Sketch-like, informal, approachable */
  HandDrawn = 'Hand Drawn Sketch',
  /** 3D perspective, depth, dimensional elements */
  Isometric = 'Isometric 3D',
  /** Neon colors, glitch effects, digital noise */
  Cyberpunk = 'Cyberpunk / Glitch',
  /** Soft colors, organic shapes, artistic */
  Watercolor = 'Watercolor / Artistic',
  /** Bold colors, halftone dots, comic style */
  PopArt = 'Pop Art / Comic',
  /** Geometric shapes, primary colors, modernist */
  Bauhaus = 'Bauhaus / Geometric',
  /** Pastel gradients, retro-futuristic, nostalgic */
  Vaporwave = 'Vaporwave / Aesthetic',
  /** Clean vectors, subtle shadows, modern UI */
  FlatDesign = 'Flat Design 2.0',
  /** Triangulated surfaces, faceted 3D look */
  LowPoly = 'Low Poly 3D',
  /** Elegant, geometric, 1920s luxury aesthetic */
  ArtDeco = 'Art Deco / Luxury',
  /** Retro gaming, blocky graphics, nostalgic */
  PixelArt = 'Pixel Art / 8-Bit',
  /** Layered paper, shadows, craft aesthetic */
  PaperCutout = 'Paper Cutout / Craft',
  /** Educational, hand-drawn on dark background */
  Chalkboard = 'Chalkboard / Educational',
  /** Frosted glass, blur effects, translucent */
  Glassmorphism = 'Glassmorphism / Frosted',
  /** Victorian machinery, brass, gears */
  Steampunk = 'Steampunk / Industrial',
  /** Soft 3D, rounded shapes, tactile feel */
  Claymorphism = 'Claymorphism / Soft 3D',
  /** Urban art, spray paint, bold expression */
  Graffiti = 'Graffiti / Street Art'
}

/**
 * Color palettes for infographic generation.
 *
 * Each palette defines a cohesive color scheme including:
 * - Primary and secondary colors
 * - Background tones
 * - Accent colors for highlights
 * - Text and contrast colors
 *
 * @remarks 10 carefully curated palettes for different moods and contexts
 */
export enum ColorPalette {
  /** Corporate, trustworthy, clean - ideal for business */
  BlueWhite = 'Professional Blue & White',
  /** Dark backgrounds with vibrant neon accents */
  DarkNeon = 'Dark Mode Neon',
  /** Browns, oranges, terracotta - natural and organic */
  Warm = 'Warm Earth Tones',
  /** Black, white, grays - timeless and sophisticated */
  Monochrome = 'Monochrome',
  /** Saturated, bold colors - eye-catching and energetic */
  Vibrant = 'High Contrast Vibrant',
  /** Light, soft colors - gentle and approachable */
  Pastel = 'Soft Pastels',
  /** Greens and teals - natural and calming */
  Forest = 'Forest Deep Greens',
  /** Orange to purple gradient - warm and dynamic */
  Sunset = 'Sunset Gradient',
  /** Deep blues with metallic accents - elegant and premium */
  Midnight = 'Midnight Blue & Silver',
  /** Neutral grays with red highlights - dramatic and focused */
  GrayscaleRed = 'Grayscale with Red Accents'
}

/**
 * Filters for GitHub repository analysis.
 * Applied when analyzing GitHub-related topics.
 */
export interface GithubFilters {
  /** Programming language filter (e.g., "TypeScript", "Python") */
  language?: string;
  /** File extension filter (e.g., ".tsx,.ts") */
  fileExtensions?: string;
  /** Only include files updated after this date (ISO 8601) */
  lastUpdatedAfter?: string;
}

/**
 * Request parameters for infographic generation.
 */
export interface InfographicRequest {
  /** Topic, URL, or GitHub repo name to analyze */
  topic: string;
  /** Output image resolution */
  size: ImageSize;
  /** Output image aspect ratio */
  aspectRatio: AspectRatio;
  /** Optional GitHub-specific filters */
  filters?: GithubFilters;
}

/**
 * Web source reference from grounded search results.
 * Provided by Gemini's Google Search grounding feature.
 */
export interface WebSource {
  /** Title of the source page */
  title?: string;
  /** URL of the source */
  uri?: string;
}

/**
 * Result of the topic analysis phase.
 * Produced by Gemini 3 Pro with thinking mode.
 */
export interface AnalysisResult {
  /** Generated title for the infographic */
  title: string;
  /** Concise summary of the topic (max ~100 words) */
  summary: string;
  /** Key facts, statistics, and points to visualize */
  keyPoints: string[];
  /** Detailed prompt for image generation */
  visualPlan: string;
  /** Sources used for grounded information */
  webSources?: WebSource[];
}

/**
 * Complete generated infographic with metadata.
 */
export interface GeneratedInfographic {
  /** Base64-encoded image data URL */
  imageUrl: string;
  /** Analysis results from the first phase */
  analysis: AnalysisResult;
}

/**
 * User feedback on a generated infographic.
 */
export interface Feedback {
  /** Unique identifier */
  id: string;
  /** Rating from 1-5 stars */
  rating: number;
  /** Optional text feedback */
  comment: string;
  /** When feedback was submitted (Unix timestamp) */
  timestamp: number;
}

/**
 * Saved version of a generated infographic.
 * Stored in IndexedDB for persistence across sessions.
 */
export interface SavedVersion {
  /** Unique identifier (UUID) */
  id: string;
  /** When the version was saved (Unix timestamp) */
  timestamp: number;
  /** Original topic/query used for generation */
  topic: string;
  /** Image resolution used */
  size: ImageSize;
  /** Image aspect ratio used */
  aspectRatio: AspectRatio;
  /** GitHub filters if applicable */
  filters?: GithubFilters;
  /** Visual style used for generation */
  style?: InfographicStyle;
  /** Color palette used for generation */
  palette?: ColorPalette;
  /** The generated infographic data */
  data: GeneratedInfographic;
  /** User feedback if provided */
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