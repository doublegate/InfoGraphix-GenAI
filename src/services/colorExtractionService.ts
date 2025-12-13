/**
 * Color Extraction Service
 *
 * Provides color extraction from images, color theory algorithms,
 * and WCAG contrast ratio checking - all client-side.
 */

import { Vibrant } from 'node-vibrant/browser';

/**
 * Represents an extracted color with metadata
 */
export interface ExtractedColor {
  /** Hexadecimal color code (e.g., "#FF5733") */
  hex: string;
  /** RGB values [0-255, 0-255, 0-255] */
  rgb: [number, number, number];
  /** Population/frequency in the image */
  population: number;
  /** Color name/category (e.g., "Vibrant", "Muted") */
  category?: string;
}

/**
 * Custom user-defined color palette
 */
export interface CustomPalette {
  /** Unique identifier (UUID) */
  id: string;
  /** User-defined palette name */
  name: string;
  /** Array of hex color codes */
  colors: string[];
  /** Source of the palette */
  source: 'uploaded-image' | 'color-theory' | 'manual' | 'ai-generated';
  /** When the palette was created (Unix timestamp) */
  createdAt: number;
  /** Optional description */
  description?: string;
  /** Optional tags for categorization */
  tags?: string[];
}

/**
 * Color scheme generation type
 */
export type ColorSchemeType =
  | 'complementary'
  | 'triadic'
  | 'analogous'
  | 'split-complementary'
  | 'tetradic';

/**
 * Generated color scheme with type and colors
 */
export interface ColorScheme {
  /** Type of color scheme */
  type: ColorSchemeType;
  /** Array of hex color codes */
  colors: string[];
}

/**
 * Extract dominant colors from an image file using Vibrant.js
 *
 * @param file - Image file (JPEG, PNG, GIF, etc.)
 * @param maxColors - Maximum number of colors to extract (default: 6)
 * @returns Promise resolving to array of extracted colors
 */
export async function extractColorsFromImage(
  file: File,
  maxColors: number = 6
): Promise<ExtractedColor[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const imageUrl = e.target?.result as string;
        const vibrant = new Vibrant(imageUrl);
        const palette = await vibrant.getPalette();

        const colors: ExtractedColor[] = [];

        // Extract colors in priority order
        const swatches: Array<{ key: string; swatch: unknown }> = [
          { key: 'Vibrant', swatch: palette.Vibrant },
          { key: 'DarkVibrant', swatch: palette.DarkVibrant },
          { key: 'LightVibrant', swatch: palette.LightVibrant },
          { key: 'Muted', swatch: palette.Muted },
          { key: 'DarkMuted', swatch: palette.DarkMuted },
          { key: 'LightMuted', swatch: palette.LightMuted },
        ];

        for (const { key, swatch } of swatches) {
          if (swatch && colors.length < maxColors) {
            colors.push({
              hex: swatch.getHex(),
              rgb: swatch.getRgb() as [number, number, number],
              population: swatch.getPopulation(),
              category: key,
            });
          }
        }

        if (colors.length === 0) {
          reject(new Error('No colors could be extracted from the image'));
        } else {
          resolve(colors);
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Convert hex color to RGB
 *
 * @param hex - Hexadecimal color code (with or without #)
 * @returns RGB array [0-255, 0-255, 0-255]
 */
export function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return [r, g, b];
}

/**
 * Convert RGB to hex color
 *
 * @param rgb - RGB array [0-255, 0-255, 0-255]
 * @returns Hexadecimal color code with #
 */
export function rgbToHex(rgb: [number, number, number]): string {
  const [r, g, b] = rgb;
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

/**
 * Convert RGB to HSL
 *
 * @param rgb - RGB array [0-255, 0-255, 0-255]
 * @returns HSL array [0-360, 0-100, 0-100]
 */
export function rgbToHsl(rgb: [number, number, number]): [number, number, number] {
  const [r, g, b] = rgb.map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/**
 * Convert HSL to RGB
 *
 * @param hsl - HSL array [0-360, 0-100, 0-100]
 * @returns RGB array [0-255, 0-255, 0-255]
 */
export function hslToRgb(hsl: [number, number, number]): [number, number, number] {
  const [h, s, l] = [hsl[0] / 360, hsl[1] / 100, hsl[2] / 100];

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Generate a color scheme based on color theory
 *
 * @param baseColor - Base color as hex code
 * @param type - Type of color scheme to generate
 * @param count - Number of colors to generate (used for analogous)
 * @returns Array of hex color codes
 */
export function generateColorScheme(
  baseColor: string,
  type: ColorSchemeType,
  count: number = 5
): string[] {
  const rgb = hexToRgb(baseColor);
  const [h, s, l] = rgbToHsl(rgb);

  const colors: string[] = [baseColor];

  switch (type) {
    case 'complementary':
      // 180 degrees opposite
      colors.push(rgbToHex(hslToRgb([(h + 180) % 360, s, l])));
      break;

    case 'triadic':
      // 120 degrees apart
      colors.push(rgbToHex(hslToRgb([(h + 120) % 360, s, l])));
      colors.push(rgbToHex(hslToRgb([(h + 240) % 360, s, l])));
      break;

    case 'analogous':
      // Adjacent colors (30 degrees apart)
      for (let i = 1; i < count; i++) {
        const offset = i * 30;
        colors.push(rgbToHex(hslToRgb([(h + offset) % 360, s, l])));
      }
      break;

    case 'split-complementary':
      // Complementary color split into two adjacent
      colors.push(rgbToHex(hslToRgb([(h + 150) % 360, s, l])));
      colors.push(rgbToHex(hslToRgb([(h + 210) % 360, s, l])));
      break;

    case 'tetradic':
      // Rectangle/square (90 degrees apart)
      colors.push(rgbToHex(hslToRgb([(h + 90) % 360, s, l])));
      colors.push(rgbToHex(hslToRgb([(h + 180) % 360, s, l])));
      colors.push(rgbToHex(hslToRgb([(h + 270) % 360, s, l])));
      break;
  }

  return colors;
}

/**
 * Calculate relative luminance of a color (WCAG formula)
 *
 * @param rgb - RGB array [0-255, 0-255, 0-255]
 * @returns Relative luminance value [0-1]
 */
function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Check contrast ratio between two colors (WCAG compliance)
 *
 * @param fgColor - Foreground color (hex)
 * @param bgColor - Background color (hex)
 * @returns Contrast ratio (1-21)
 */
export function checkContrastRatio(fgColor: string, bgColor: string): number {
  const fgRgb = hexToRgb(fgColor);
  const bgRgb = hexToRgb(bgColor);

  const fgLuminance = getRelativeLuminance(fgRgb);
  const bgLuminance = getRelativeLuminance(bgRgb);

  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a color combination meets WCAG AA standards
 *
 * @param fgColor - Foreground color (hex)
 * @param bgColor - Background color (hex)
 * @param isLargeText - Whether the text is large (18pt+ or 14pt+ bold)
 * @returns True if meets WCAG AA standards
 */
export function meetsWCAG_AA(
  fgColor: string,
  bgColor: string,
  isLargeText: boolean = false
): boolean {
  const ratio = checkContrastRatio(fgColor, bgColor);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Generate all 5 color schemes from a base color
 * Helper function for UI components
 *
 * @param baseColor - Base color in hex format
 * @returns Array of ColorScheme objects for all scheme types
 */
export function generateColorSchemes(baseColor: string): ColorScheme[] {
  const schemeTypes: ColorSchemeType[] = [
    'complementary',
    'triadic',
    'analogous',
    'split-complementary',
    'tetradic'
  ];

  return schemeTypes.map(type => ({
    type,
    colors: generateColorScheme(baseColor, type)
  }));
}

/**
 * Check if a color is accessible (meets WCAG AA with black text)
 * Helper function for quick accessibility checking
 *
 * @param color - Color to check (hex)
 * @returns True if color meets WCAG AA with black text
 */
export function isColorAccessible(color: string): boolean {
  return meetsWCAG_AA(color, '#000000');
}

/**
 * Check if a color combination meets WCAG AAA standards
 *
 * @param fgColor - Foreground color (hex)
 * @param bgColor - Background color (hex)
 * @param isLargeText - Whether the text is large (18pt+ or 14pt+ bold)
 * @returns True if meets WCAG AAA standards
 */
export function meetsWCAG_AAA(
  fgColor: string,
  bgColor: string,
  isLargeText: boolean = false
): boolean {
  const ratio = checkContrastRatio(fgColor, bgColor);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Generate an accessible text color (black or white) for a background
 *
 * @param bgColor - Background color (hex)
 * @returns "#000000" or "#FFFFFF" for optimal contrast
 */
export function getAccessibleTextColor(bgColor: string): string {
  const bgRgb = hexToRgb(bgColor);
  const luminance = getRelativeLuminance(bgRgb);

  // Use white text for dark backgrounds, black for light
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Save a custom palette to localStorage
 *
 * @param palette - Custom palette to save
 */
export function saveCustomPalette(palette: CustomPalette): void {
  const palettes = getCustomPalettes();
  const existingIndex = palettes.findIndex((p) => p.id === palette.id);

  if (existingIndex >= 0) {
    palettes[existingIndex] = palette;
  } else {
    palettes.push(palette);
  }

  localStorage.setItem('infographix_custom_palettes', JSON.stringify(palettes));
}

/**
 * Retrieve all custom palettes from localStorage
 *
 * @returns Array of custom palettes
 */
export function getCustomPalettes(): CustomPalette[] {
  const stored = localStorage.getItem('infographix_custom_palettes');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Delete a custom palette from localStorage
 *
 * @param paletteId - ID of palette to delete
 */
export function deleteCustomPalette(paletteId: string): void {
  const palettes = getCustomPalettes();
  const filtered = palettes.filter((p) => p.id !== paletteId);
  localStorage.setItem('infographix_custom_palettes', JSON.stringify(filtered));
}

/**
 * Create a custom palette from extracted colors
 *
 * @param name - Palette name
 * @param extractedColors - Colors extracted from an image
 * @param source - Source of the palette
 * @returns CustomPalette object
 */
export function createPaletteFromColors(
  name: string,
  extractedColors: ExtractedColor[],
  source: CustomPalette['source'] = 'uploaded-image'
): CustomPalette {
  return {
    id: crypto.randomUUID(),
    name,
    colors: extractedColors.map((c) => c.hex),
    source,
    createdAt: Date.now(),
  };
}
