/**
 * Constant select options for InfographicForm
 * Extracted outside component to prevent recreation on every render
 * v1.8.0 - TD-015 Performance Optimization
 */

import { InfographicStyle, ColorPalette, ImageSize, AspectRatio } from '../types';
import type { RichOption } from '../components/RichSelect';

/**
 * Style options with preview images
 * Note: Preview components should be memoized when used
 */
export const STYLE_OPTIONS: RichOption[] = [
  { value: InfographicStyle.Modern, label: 'Modern', description: 'Clean, professional design' },
  { value: InfographicStyle.Futuristic, label: 'Futuristic', description: 'Sci-fi inspired visuals' },
  { value: InfographicStyle.Engineering, label: 'Engineering', description: 'Technical blueprint style' },
  { value: InfographicStyle.Vintage, label: 'Vintage', description: 'Retro aesthetic' },
  { value: InfographicStyle.Corporate, label: 'Corporate', description: 'Business-focused' },
  { value: InfographicStyle.Abstract, label: 'Abstract', description: 'Artistic interpretation' },
  { value: InfographicStyle.HandDrawn, label: 'Hand Drawn', description: 'Sketch-like appearance' },
  { value: InfographicStyle.Isometric, label: 'Isometric', description: '3D-like perspective' },
  { value: InfographicStyle.Cyberpunk, label: 'Cyberpunk', description: 'Neon dystopian' },
  { value: InfographicStyle.Watercolor, label: 'Watercolor', description: 'Painted effect' },
  { value: InfographicStyle.PopArt, label: 'Pop Art', description: 'Bold, vibrant colors' },
  { value: InfographicStyle.FlatDesign, label: 'Flat Design', description: 'Simplified 2D style' },
  { value: InfographicStyle.Bauhaus, label: 'Bauhaus', description: 'Geometric modernism' },
  { value: InfographicStyle.Vaporwave, label: 'Vaporwave', description: 'Retro-futuristic aesthetic' },
  { value: InfographicStyle.LowPoly, label: 'Low Poly', description: 'Polygonal graphics' },
  { value: InfographicStyle.ArtDeco, label: 'Art Deco', description: 'Elegant 1920s style' },
];

/**
 * Color palette options
 */
export const PALETTE_OPTIONS: RichOption[] = [
  { value: ColorPalette.BlueWhite, label: 'Blue & White', description: 'Professional and clean' },
  { value: ColorPalette.DarkNeon, label: 'Dark Neon', description: 'Modern dark theme with neon accents' },
  { value: ColorPalette.Vibrant, label: 'Vibrant', description: 'Bold and colorful' },
  { value: ColorPalette.Pastel, label: 'Pastel', description: 'Soft and gentle' },
  { value: ColorPalette.Monochrome, label: 'Monochrome', description: 'Black and white' },
  { value: ColorPalette.Warm, label: 'Warm Earth Tones', description: 'Natural warm tones' },
  { value: ColorPalette.Midnight, label: 'Midnight Blue', description: 'Deep blues with silver' },
  { value: ColorPalette.Sunset, label: 'Sunset', description: 'Warm oranges and pinks' },
  { value: ColorPalette.Forest, label: 'Forest', description: 'Green nature theme' },
  { value: ColorPalette.GrayscaleRed, label: 'Grayscale Red', description: 'Dramatic grayscale with red' },
];

/**
 * Image size options
 */
export const SIZE_OPTIONS: RichOption[] = [
  { value: ImageSize.Resolution_1K, label: '1K (1024px)', description: 'Quick preview' },
  { value: ImageSize.Resolution_2K, label: '2K (2048px)', description: 'Standard quality' },
  { value: ImageSize.Resolution_4K, label: '4K (4096px)', description: 'High quality' },
];

/**
 * Aspect ratio options
 */
export const RATIO_OPTIONS: RichOption[] = [
  { value: AspectRatio.Square, label: '1:1 Square', description: 'Social media posts' },
  { value: AspectRatio.Portrait, label: '9:16 Portrait', description: 'Mobile, stories' },
  { value: AspectRatio.Landscape, label: '16:9 Landscape', description: 'Presentations' },
  { value: AspectRatio.StandardPortrait, label: '3:4 Standard Portrait', description: 'Print media' },
  { value: AspectRatio.StandardLandscape, label: '4:3 Standard Landscape', description: 'Photography' },
];
