/**
 * Template management service for custom style configurations.
 * v1.4.0 Feature: Custom Style Templates
 */

import { TemplateConfig, InfographicStyle, ColorPalette, ImageSize, AspectRatio } from '../types';

const STORAGE_KEY = 'infographix_templates';

/**
 * Load all templates from localStorage
 */
export const loadTemplates = (): TemplateConfig[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultTemplates();
    const templates = JSON.parse(stored);
    return Array.isArray(templates) ? templates : getDefaultTemplates();
  } catch (error) {
    console.error('Failed to load templates:', error);
    return getDefaultTemplates();
  }
};

/**
 * Save templates to localStorage
 */
const saveTemplates = (templates: TemplateConfig[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error('Failed to save templates:', error);
    throw new Error('Failed to save templates. Storage might be full.');
  }
};

/**
 * Create a new template
 */
export const createTemplate = (
  name: string,
  style: InfographicStyle,
  palette: ColorPalette,
  size: ImageSize,
  aspectRatio: AspectRatio,
  description?: string,
  tags?: string[]
): TemplateConfig => {
  const template: TemplateConfig = {
    id: crypto.randomUUID(),
    name,
    description,
    style,
    palette,
    size,
    aspectRatio,
    tags,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    creator: 'User'
  };

  const templates = loadTemplates();
  templates.unshift(template);
  saveTemplates(templates);

  return template;
};

/**
 * Update an existing template
 */
export const updateTemplate = (
  id: string,
  updates: Partial<Omit<TemplateConfig, 'id' | 'createdAt'>>
): TemplateConfig | null => {
  const templates = loadTemplates();
  const index = templates.findIndex(t => t.id === id);

  if (index === -1) {
    console.error(`Template with id ${id} not found`);
    return null;
  }

  templates[index] = {
    ...templates[index],
    ...updates,
    updatedAt: Date.now()
  };

  saveTemplates(templates);
  return templates[index];
};

/**
 * Delete a template
 */
export const deleteTemplate = (id: string): boolean => {
  const templates = loadTemplates();
  const filtered = templates.filter(t => t.id !== id);

  if (filtered.length === templates.length) {
    return false; // Template not found
  }

  saveTemplates(filtered);
  return true;
};

/**
 * Get a single template by ID
 */
export const getTemplate = (id: string): TemplateConfig | null => {
  const templates = loadTemplates();
  return templates.find(t => t.id === id) || null;
};

/**
 * Search templates by name, description, or tags
 */
export const searchTemplates = (query: string): TemplateConfig[] => {
  const templates = loadTemplates();
  const lowerQuery = query.toLowerCase();

  return templates.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description?.toLowerCase().includes(lowerQuery) ||
    t.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Export template as JSON file
 */
export const exportTemplate = (template: TemplateConfig): void => {
  const json = JSON.stringify(template, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${template.name.replace(/[^a-z0-9_\-]/gi, '_')}_template.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Import template from JSON file
 */
export const importTemplate = (file: File): Promise<TemplateConfig> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const imported = JSON.parse(json) as TemplateConfig;

        // Validate required fields
        if (!imported.name || !imported.style || !imported.palette) {
          throw new Error('Invalid template file: missing required fields');
        }

        // Generate new ID and timestamps
        const template: TemplateConfig = {
          ...imported,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        const templates = loadTemplates();
        templates.unshift(template);
        saveTemplates(templates);

        resolve(template);
      } catch (error) {
        reject(new Error('Failed to parse template file: ' + (error as Error).message));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read template file'));
    };

    reader.readAsText(file);
  });
};

/**
 * Template categories for organization
 */
export const TEMPLATE_CATEGORIES = [
  'Business & Professional',
  'Technology & Innovation',
  'Education & Learning',
  'Creative & Artistic',
  'Data & Analytics',
  'Social Media',
  'Marketing & Branding',
  'Science & Research',
  'Health & Wellness',
  'Entertainment & Gaming'
] as const;

export type TemplateCategory = typeof TEMPLATE_CATEGORIES[number];

/**
 * Get default templates (50+ pre-configured options across 10 categories)
 * v1.6.0 Enhancement: Expanded template library with categorization
 */
export const getDefaultTemplates = (): TemplateConfig[] => {
  const now = Date.now();
  return [
    // === Business & Professional (8 templates) ===
    {
      id: 'biz-modern-professional',
      name: 'Modern Professional',
      description: 'Clean and professional design for business presentations',
      style: InfographicStyle.Modern,
      palette: ColorPalette.BlueWhite,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Portrait,
      tags: ['professional', 'business', 'clean', 'business'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'biz-corporate-elegant',
      name: 'Corporate Elegant',
      description: 'Trustworthy corporate design with blue and grey tones',
      style: InfographicStyle.Corporate,
      palette: ColorPalette.BlueWhite,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.StandardLandscape,
      tags: ['corporate', 'professional', 'business', 'business'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'biz-minimal-mono',
      name: 'Minimal Monochrome',
      description: 'Timeless black and white design for serious business',
      style: InfographicStyle.Modern,
      palette: ColorPalette.Monochrome,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Square,
      tags: ['minimal', 'monochrome', 'business', 'business'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'biz-elegant-presentation',
      name: 'Elegant Presentation',
      description: 'Sophisticated Art Deco design for high-stakes presentations',
      style: InfographicStyle.ArtDeco,
      palette: ColorPalette.Midnight,
      size: ImageSize.Resolution_4K,
      aspectRatio: AspectRatio.Landscape,
      tags: ['elegant', 'presentation', 'business', 'business'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'biz-executive-summary',
      name: 'Executive Summary',
      description: 'Clean layout optimized for C-suite presentations',
      style: InfographicStyle.Modern,
      palette: ColorPalette.Midnight,
      size: ImageSize.Resolution_4K,
      aspectRatio: AspectRatio.Landscape,
      tags: ['executive', 'business', 'premium', 'business'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'biz-annual-report',
      name: 'Annual Report Style',
      description: 'Professional design for financial and annual reports',
      style: InfographicStyle.Corporate,
      palette: ColorPalette.Monochrome,
      size: ImageSize.Resolution_4K,
      aspectRatio: AspectRatio.Portrait,
      tags: ['report', 'business', 'finance', 'business'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'biz-consulting-deck',
      name: 'Consulting Deck',
      description: 'Strategy consulting presentation style',
      style: InfographicStyle.Modern,
      palette: ColorPalette.BlueWhite,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.StandardLandscape,
      tags: ['consulting', 'business', 'strategy', 'business'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'biz-pitch-deck',
      name: 'Investor Pitch Deck',
      description: 'High-impact design for startup pitches and investor meetings',
      style: InfographicStyle.Modern,
      palette: ColorPalette.GrayscaleRed,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.StandardLandscape,
      tags: ['pitch', 'startup', 'business', 'business'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },

    // === Technology & Innovation (7 templates) ===
    {
      id: 'tech-cyberpunk-dark',
      name: 'Cyberpunk Dark Mode',
      description: 'High-tech aesthetic with neon accents on dark background',
      style: InfographicStyle.Cyberpunk,
      palette: ColorPalette.DarkNeon,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Landscape,
      tags: ['tech', 'dark', 'futuristic', 'technology'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'tech-futuristic-sci-fi',
      name: 'Futuristic Sci-Fi',
      description: 'Cutting-edge design with holographic elements',
      style: InfographicStyle.Futuristic,
      palette: ColorPalette.DarkNeon,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Portrait,
      tags: ['futuristic', 'sci-fi', 'tech', 'technology'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'tech-engineering-blueprint',
      name: 'Engineering Blueprint',
      description: 'Technical blueprint style with grid lines and schematics',
      style: InfographicStyle.Engineering,
      palette: ColorPalette.BlueWhite,
      size: ImageSize.Resolution_4K,
      aspectRatio: AspectRatio.Landscape,
      tags: ['engineering', 'technical', 'blueprint', 'technology'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'tech-isometric-3d',
      name: 'Isometric 3D Tech',
      description: '3D isometric perspective for tech infrastructure',
      style: InfographicStyle.Isometric,
      palette: ColorPalette.Vibrant,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Square,
      tags: ['isometric', '3d', 'tech', 'technology'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'tech-glassmorphism',
      name: 'Glassmorphism UI',
      description: 'Modern glassmorphic design for UI/UX concepts',
      style: InfographicStyle.Glassmorphism,
      palette: ColorPalette.Pastel,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Portrait,
      tags: ['glassmorphism', 'modern', 'ui', 'technology'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'tech-ai-ml',
      name: 'AI & Machine Learning',
      description: 'Neural network-inspired design for AI topics',
      style: InfographicStyle.Futuristic,
      palette: ColorPalette.Midnight,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.StandardLandscape,
      tags: ['ai', 'ml', 'neural', 'technology'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'tech-circuit-board',
      name: 'Circuit Board',
      description: 'Microelectronics-inspired design for hardware topics',
      style: InfographicStyle.Engineering,
      palette: ColorPalette.DarkNeon,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Landscape,
      tags: ['circuit', 'hardware', 'electronics', 'technology'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },

    // === Education & Learning (5 templates) ===
    {
      id: 'edu-chalkboard-classic',
      name: 'Chalkboard Classic',
      description: 'Traditional classroom chalkboard aesthetic',
      style: InfographicStyle.Chalkboard,
      palette: ColorPalette.Monochrome,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.StandardLandscape,
      tags: ['education', 'classroom', 'teaching', 'education'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'edu-hand-drawn-notes',
      name: 'Hand-Drawn Notes',
      description: 'Friendly sketch-style for approachable learning content',
      style: InfographicStyle.HandDrawn,
      palette: ColorPalette.Pastel,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Portrait,
      tags: ['sketch', 'casual', 'education', 'education'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'edu-academic-paper',
      name: 'Academic Paper',
      description: 'Scholarly design for academic and research content',
      style: InfographicStyle.Modern,
      palette: ColorPalette.BlueWhite,
      size: ImageSize.Resolution_4K,
      aspectRatio: AspectRatio.Portrait,
      tags: ['academic', 'research', 'scholarly', 'education'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'edu-playful-kids',
      name: 'Playful Kids Learning',
      description: 'Colorful and engaging design for children',
      style: InfographicStyle.PaperCutout,
      palette: ColorPalette.Vibrant,
      size: ImageSize.Resolution_1K,
      aspectRatio: AspectRatio.Square,
      tags: ['kids', 'playful', 'colorful', 'education'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'edu-tutorial-guide',
      name: 'Tutorial Guide',
      description: 'Step-by-step instructional design',
      style: InfographicStyle.FlatDesign,
      palette: ColorPalette.BlueWhite,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Portrait,
      tags: ['tutorial', 'guide', 'instructional', 'education'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },

    // === Creative & Artistic (7 templates) ===
    {
      id: 'art-watercolor-organic',
      name: 'Watercolor Organic',
      description: 'Artistic watercolor design with natural flow',
      style: InfographicStyle.Watercolor,
      palette: ColorPalette.Pastel,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Portrait,
      tags: ['watercolor', 'artistic', 'organic', 'creative'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'art-pop-art-bold',
      name: 'Pop Art Bold',
      description: 'Bold colors and thick outlines in comic book style',
      style: InfographicStyle.PopArt,
      palette: ColorPalette.Vibrant,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Square,
      tags: ['pop-art', 'bold', 'comic', 'creative'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'art-abstract-modern',
      name: 'Abstract Modern',
      description: 'Creative data visualization using fluid shapes',
      style: InfographicStyle.Abstract,
      palette: ColorPalette.Sunset,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Landscape,
      tags: ['abstract', 'modern', 'creative', 'creative'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'art-vaporwave-retro',
      name: 'Vaporwave Retro',
      description: 'Nostalgic 80s/90s aesthetic with neon colors',
      style: InfographicStyle.Vaporwave,
      palette: ColorPalette.DarkNeon,
      size: ImageSize.Resolution_1K,
      aspectRatio: AspectRatio.Square,
      tags: ['vaporwave', 'retro', '80s', 'creative'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'art-graffiti-urban',
      name: 'Graffiti Urban',
      description: 'Street art style with spray paint aesthetics',
      style: InfographicStyle.Graffiti,
      palette: ColorPalette.Vibrant,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Landscape,
      tags: ['graffiti', 'urban', 'street-art', 'creative'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'art-paper-cutout',
      name: 'Paper Cutout Craft',
      description: 'Layered paper effect with depth and texture',
      style: InfographicStyle.PaperCutout,
      palette: ColorPalette.Pastel,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Portrait,
      tags: ['paper', 'craft', 'layered', 'creative'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'art-claymorphism',
      name: 'Claymorphism 3D',
      description: 'Soft inflated 3D shapes with matte finish',
      style: InfographicStyle.Claymorphism,
      palette: ColorPalette.Pastel,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Square,
      tags: ['clay', '3d', 'soft', 'creative'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },

    // === Data & Analytics (6 templates) ===
    {
      id: 'data-viz-standard',
      name: 'Data Visualization',
      description: 'Chart-focused design for data-heavy content',
      style: InfographicStyle.FlatDesign,
      palette: ColorPalette.BlueWhite,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.StandardLandscape,
      tags: ['data', 'charts', 'analytics', 'data'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'data-dashboard-modern',
      name: 'Modern Dashboard',
      description: 'Analytics dashboard design with multiple data points',
      style: InfographicStyle.Modern,
      palette: ColorPalette.Midnight,
      size: ImageSize.Resolution_4K,
      aspectRatio: AspectRatio.Landscape,
      tags: ['dashboard', 'analytics', 'data', 'data'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'data-infographic-stats',
      name: 'Statistical Infographic',
      description: 'Numbers-focused design for statistics and metrics',
      style: InfographicStyle.FlatDesign,
      palette: ColorPalette.Vibrant,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Portrait,
      tags: ['statistics', 'metrics', 'data', 'data'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'data-comparison-chart',
      name: 'Comparison Charts',
      description: 'Side-by-side comparison optimized layout',
      style: InfographicStyle.Modern,
      palette: ColorPalette.BlueWhite,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.StandardLandscape,
      tags: ['comparison', 'charts', 'data', 'data'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'data-timeline-history',
      name: 'Timeline & History',
      description: 'Chronological data presentation design',
      style: InfographicStyle.FlatDesign,
      palette: ColorPalette.Sunset,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Landscape,
      tags: ['timeline', 'history', 'chronological', 'data'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'data-process-flow',
      name: 'Process Flow Diagram',
      description: 'Workflow and process visualization',
      style: InfographicStyle.Isometric,
      palette: ColorPalette.BlueWhite,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Landscape,
      tags: ['process', 'workflow', 'diagram', 'data'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },

    // === Social Media (5 templates) ===
    {
      id: 'social-vibrant-square',
      name: 'Vibrant Social Post',
      description: 'Eye-catching design optimized for Instagram and Twitter',
      style: InfographicStyle.FlatDesign,
      palette: ColorPalette.Vibrant,
      size: ImageSize.Resolution_1K,
      aspectRatio: AspectRatio.Square,
      tags: ['social', 'instagram', 'twitter', 'social-media'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'social-story-vertical',
      name: 'Story Format Vertical',
      description: 'Optimized for Instagram/Facebook Stories',
      style: InfographicStyle.FlatDesign,
      palette: ColorPalette.Sunset,
      size: ImageSize.Resolution_1K,
      aspectRatio: AspectRatio.Portrait,
      tags: ['story', 'vertical', 'instagram', 'social-media'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'social-pinterest-tall',
      name: 'Pinterest Tall Pin',
      description: 'Vertical design optimized for Pinterest',
      style: InfographicStyle.Modern,
      palette: ColorPalette.Pastel,
      size: ImageSize.Resolution_1K,
      aspectRatio: AspectRatio.StandardPortrait,
      tags: ['pinterest', 'pin', 'vertical', 'social-media'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'social-linkedin-professional',
      name: 'LinkedIn Professional',
      description: 'Professional social design for LinkedIn posts',
      style: InfographicStyle.Modern,
      palette: ColorPalette.BlueWhite,
      size: ImageSize.Resolution_1K,
      aspectRatio: AspectRatio.Landscape,
      tags: ['linkedin', 'professional', 'business', 'social-media'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'social-engagement-boost',
      name: 'Engagement Booster',
      description: 'High-contrast design to maximize social engagement',
      style: InfographicStyle.PopArt,
      palette: ColorPalette.GrayscaleRed,
      size: ImageSize.Resolution_1K,
      aspectRatio: AspectRatio.Square,
      tags: ['engagement', 'viral', 'attention', 'social-media'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },

    // === Marketing & Branding (5 templates) ===
    {
      id: 'market-brand-modern',
      name: 'Modern Brand Identity',
      description: 'Clean branding design for modern companies',
      style: InfographicStyle.Modern,
      palette: ColorPalette.BlueWhite,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Square,
      tags: ['branding', 'modern', 'identity', 'marketing'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'market-product-launch',
      name: 'Product Launch',
      description: 'High-impact design for product announcements',
      style: InfographicStyle.FlatDesign,
      palette: ColorPalette.Vibrant,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Landscape,
      tags: ['product', 'launch', 'announcement', 'marketing'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'market-campaign-creative',
      name: 'Creative Campaign',
      description: 'Bold creative design for marketing campaigns',
      style: InfographicStyle.PopArt,
      palette: ColorPalette.Vibrant,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Portrait,
      tags: ['campaign', 'creative', 'bold', 'marketing'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'market-event-promo',
      name: 'Event Promotion',
      description: 'Eye-catching design for event marketing',
      style: InfographicStyle.Vaporwave,
      palette: ColorPalette.DarkNeon,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Landscape,
      tags: ['event', 'promotion', 'marketing', 'marketing'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'market-testimonial',
      name: 'Customer Testimonial',
      description: 'Trust-building design for customer quotes',
      style: InfographicStyle.Modern,
      palette: ColorPalette.Pastel,
      size: ImageSize.Resolution_1K,
      aspectRatio: AspectRatio.Square,
      tags: ['testimonial', 'trust', 'customer', 'marketing'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },

    // === Science & Research (4 templates) ===
    {
      id: 'sci-research-paper',
      name: 'Research Paper',
      description: 'Academic and scientific research visualization',
      style: InfographicStyle.Modern,
      palette: ColorPalette.BlueWhite,
      size: ImageSize.Resolution_4K,
      aspectRatio: AspectRatio.Portrait,
      tags: ['research', 'science', 'academic', 'science'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'sci-medical-health',
      name: 'Medical & Healthcare',
      description: 'Clean medical and healthcare information design',
      style: InfographicStyle.Modern,
      palette: ColorPalette.Pastel,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Portrait,
      tags: ['medical', 'health', 'healthcare', 'science'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'sci-biology-nature',
      name: 'Biology & Nature',
      description: 'Organic design for biology and environmental topics',
      style: InfographicStyle.Watercolor,
      palette: ColorPalette.Forest,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Portrait,
      tags: ['biology', 'nature', 'environment', 'science'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'sci-chemistry-lab',
      name: 'Chemistry Lab',
      description: 'Scientific laboratory aesthetic for chemistry',
      style: InfographicStyle.Engineering,
      palette: ColorPalette.BlueWhite,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Landscape,
      tags: ['chemistry', 'lab', 'science', 'science'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },

    // === Health & Wellness (3 templates) ===
    {
      id: 'health-wellness-calm',
      name: 'Wellness & Calm',
      description: 'Soothing design for health and wellness content',
      style: InfographicStyle.Watercolor,
      palette: ColorPalette.Pastel,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Portrait,
      tags: ['wellness', 'calm', 'health', 'health'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'health-fitness-energy',
      name: 'Fitness & Energy',
      description: 'Dynamic design for fitness and exercise content',
      style: InfographicStyle.FlatDesign,
      palette: ColorPalette.Vibrant,
      size: ImageSize.Resolution_1K,
      aspectRatio: AspectRatio.Square,
      tags: ['fitness', 'energy', 'exercise', 'health'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'health-nutrition-guide',
      name: 'Nutrition Guide',
      description: 'Fresh design for nutrition and food content',
      style: InfographicStyle.FlatDesign,
      palette: ColorPalette.Forest,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Portrait,
      tags: ['nutrition', 'food', 'health', 'health'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },

    // === Entertainment & Gaming (5 templates) ===
    {
      id: 'game-pixel-retro',
      name: 'Pixel Art Retro Gaming',
      description: '8-bit retro gaming aesthetic',
      style: InfographicStyle.PixelArt,
      palette: ColorPalette.Vibrant,
      size: ImageSize.Resolution_1K,
      aspectRatio: AspectRatio.Square,
      tags: ['gaming', 'retro', '8-bit', 'entertainment'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'game-fantasy-rpg',
      name: 'Fantasy RPG',
      description: 'Fantasy game-inspired design with medieval aesthetics',
      style: InfographicStyle.Vintage,
      palette: ColorPalette.Warm,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Portrait,
      tags: ['fantasy', 'rpg', 'gaming', 'entertainment'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'game-steampunk',
      name: 'Steampunk Adventure',
      description: 'Victorian industrial sci-fi aesthetic',
      style: InfographicStyle.Steampunk,
      palette: ColorPalette.Warm,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Landscape,
      tags: ['steampunk', 'adventure', 'gaming', 'entertainment'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'game-esports-competitive',
      name: 'Esports Competitive',
      description: 'High-energy design for competitive gaming',
      style: InfographicStyle.Cyberpunk,
      palette: ColorPalette.DarkNeon,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.StandardLandscape,
      tags: ['esports', 'competitive', 'gaming', 'entertainment'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'ent-movie-cinematic',
      name: 'Cinematic Movie',
      description: 'Cinematic design for film and entertainment',
      style: InfographicStyle.Modern,
      palette: ColorPalette.Midnight,
      size: ImageSize.Resolution_4K,
      aspectRatio: AspectRatio.Landscape,
      tags: ['cinematic', 'movie', 'film', 'entertainment'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    }
  ];
};

/**
 * Get templates by category
 * v1.6.0 Enhancement: Category-based filtering
 */
export const getTemplatesByCategory = (category: string): TemplateConfig[] => {
  const templates = loadTemplates();
  const categoryLower = category.toLowerCase();

  return templates.filter(t =>
    t.tags?.some(tag => tag.toLowerCase() === categoryLower)
  );
};

/**
 * Get category for a template based on its tags
 * Returns the primary category (first matching category tag)
 */
export const getTemplateCategory = (template: TemplateConfig): string => {
  const categoryTags = ['business', 'technology', 'education', 'creative', 'data', 'social-media', 'marketing', 'science', 'health', 'entertainment'];

  for (const tag of template.tags || []) {
    if (categoryTags.includes(tag.toLowerCase())) {
      // Map tag to category name
      const categoryMap: Record<string, string> = {
        'business': 'Business & Professional',
        'technology': 'Technology & Innovation',
        'education': 'Education & Learning',
        'creative': 'Creative & Artistic',
        'data': 'Data & Analytics',
        'social-media': 'Social Media',
        'marketing': 'Marketing & Branding',
        'science': 'Science & Research',
        'health': 'Health & Wellness',
        'entertainment': 'Entertainment & Gaming'
      };
      return categoryMap[tag.toLowerCase()] || 'Other';
    }
  }

  return 'Other';
};

/**
 * Get template count by category
 */
export const getTemplateCounts = (): Record<string, number> => {
  const templates = loadTemplates();
  const counts: Record<string, number> = {};

  TEMPLATE_CATEGORIES.forEach(category => {
    counts[category] = 0;
  });
  counts['Other'] = 0;

  templates.forEach(template => {
    const category = getTemplateCategory(template);
    counts[category] = (counts[category] || 0) + 1;
  });

  return counts;
};

/**
 * Reset templates to defaults
 */
export const resetToDefaults = (): void => {
  saveTemplates(getDefaultTemplates());
};
