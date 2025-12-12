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
 * Get default templates (10 pre-configured options)
 */
export const getDefaultTemplates = (): TemplateConfig[] => {
  const now = Date.now();
  return [
    {
      id: 'default-modern-professional',
      name: 'Modern Professional',
      description: 'Clean and professional design for business presentations',
      style: InfographicStyle.Modern,
      palette: ColorPalette.BlueWhite,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Portrait,
      tags: ['professional', 'business', 'clean'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'default-tech-dark',
      name: 'Tech Dark Mode',
      description: 'High-tech aesthetic with neon accents on dark background',
      style: InfographicStyle.Cyberpunk,
      palette: ColorPalette.DarkNeon,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Landscape,
      tags: ['tech', 'dark', 'futuristic'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'default-nature-organic',
      name: 'Nature & Organic',
      description: 'Earthy tones with organic design elements',
      style: InfographicStyle.Watercolor,
      palette: ColorPalette.Forest,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Portrait,
      tags: ['nature', 'organic', 'artistic'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'default-minimal-mono',
      name: 'Minimal Monochrome',
      description: 'Timeless black and white design',
      style: InfographicStyle.Modern,
      palette: ColorPalette.Monochrome,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Square,
      tags: ['minimal', 'monochrome', 'timeless'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'default-vibrant-social',
      name: 'Vibrant Social Media',
      description: 'Eye-catching design optimized for social platforms',
      style: InfographicStyle.FlatDesign,
      palette: ColorPalette.Vibrant,
      size: ImageSize.Resolution_1K,
      aspectRatio: AspectRatio.Square,
      tags: ['social', 'vibrant', 'engaging'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'default-elegant-presentation',
      name: 'Elegant Presentation',
      description: 'Sophisticated design for high-stakes presentations',
      style: InfographicStyle.ArtDeco,
      palette: ColorPalette.Midnight,
      size: ImageSize.Resolution_4K,
      aspectRatio: AspectRatio.Landscape,
      tags: ['elegant', 'presentation', 'premium'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'default-hand-drawn',
      name: 'Hand-Drawn Casual',
      description: 'Approachable sketch-style infographic',
      style: InfographicStyle.HandDrawn,
      palette: ColorPalette.Pastel,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Portrait,
      tags: ['casual', 'sketch', 'friendly'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'default-data-viz',
      name: 'Data Visualization',
      description: 'Chart-focused design for data-heavy content',
      style: InfographicStyle.FlatDesign,
      palette: ColorPalette.BlueWhite,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.StandardLandscape,
      tags: ['data', 'charts', 'analytics'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'default-retro-vibes',
      name: 'Retro Vibes',
      description: 'Nostalgic design with vintage aesthetics',
      style: InfographicStyle.Vintage,
      palette: ColorPalette.Warm,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Portrait,
      tags: ['retro', 'vintage', 'nostalgic'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    },
    {
      id: 'default-geometric-modern',
      name: 'Geometric Modern',
      description: 'Bold geometric shapes with Bauhaus influence',
      style: InfographicStyle.Bauhaus,
      palette: ColorPalette.GrayscaleRed,
      size: ImageSize.Resolution_2K,
      aspectRatio: AspectRatio.Square,
      tags: ['geometric', 'modern', 'bauhaus'],
      createdAt: now,
      updatedAt: now,
      creator: 'InfoGraphix AI'
    }
  ];
};

/**
 * Reset templates to defaults
 */
export const resetToDefaults = (): void => {
  saveTemplates(getDefaultTemplates());
};
