/**
 * Color Extraction Service
 * v1.9.0 - TD-020: Extracted magic numbers to constants
 *
 * Provides color extraction from images, color theory algorithms,
 * and WCAG contrast ratio checking - all client-side.
 */

import { Vibrant } from 'node-vibrant/browser';
import {
  MAX_COLORS,
  WCAG_AA,
  WCAG_AAA,
  LUMINANCE_THRESHOLD,
  COLOR_THEORY,
  DEFAULT_SCHEME_COUNT,
} from '../constants/colors';
import { STORAGE_KEYS } from '../constants/storage';
import { safeLocalStorageGet, safeLocalStorageSet } from '../utils/storageHelpers';

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
 * Extract dominant colors from an image file using Vibrant.js.
 * Analyzes the image to identify vibrant, muted, light, and dark color variations.
 * Returns colors in priority order based on visual significance.
 *
 * @param file - Image file (JPEG, PNG, GIF, WebP, etc.)
 * @param maxColors - Maximum number of colors to extract (default: 6, max: 6)
 * @returns Promise resolving to array of extracted colors with hex, RGB, population, and category
 * @throws {Error} If the image file cannot be read
 * @throws {Error} If no colors could be extracted from the image
 *
 * @example
 * ```typescript
 * const fileInput = document.querySelector<HTMLInputElement>('#image-upload');
 * const file = fileInput.files[0];
 *
 * try {
 *   const colors = await extractColorsFromImage(file, 5);
 *   console.log(colors);
 *   // [
 *   //   { hex: "#3B5998", rgb: [59, 89, 152], population: 12450, category: "Vibrant" },
 *   //   { hex: "#8B9DC3", rgb: [139, 157, 195], population: 8320, category: "LightVibrant" },
 *   //   ...
 *   // ]
 * } catch (error) {
 *   console.error('Failed to extract colors:', error);
 * }
 * ```
 */
export async function extractColorsFromImage(
  file: File,
  maxColors: number = MAX_COLORS
): Promise<ExtractedColor[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const imageUrl = e.target?.result as string;
        const vibrant = new Vibrant(imageUrl);
        const palette = await vibrant.getPalette();

        const colors: ExtractedColor[] = [];

        // Swatch type for node-vibrant
        interface VibrantSwatch {
          getHex(): string;
          getRgb(): number[];
          getPopulation(): number;
        }

        // Extract colors in priority order
        const swatches: Array<{ key: string; swatch: VibrantSwatch | null }> = [
          { key: 'Vibrant', swatch: palette.Vibrant as VibrantSwatch | null },
          { key: 'DarkVibrant', swatch: palette.DarkVibrant as VibrantSwatch | null },
          { key: 'LightVibrant', swatch: palette.LightVibrant as VibrantSwatch | null },
          { key: 'Muted', swatch: palette.Muted as VibrantSwatch | null },
          { key: 'DarkMuted', swatch: palette.DarkMuted as VibrantSwatch | null },
          { key: 'LightMuted', swatch: palette.LightMuted as VibrantSwatch | null },
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
 * Convert hex color to RGB.
 * Handles hex codes with or without the # prefix.
 *
 * @param hex - Hexadecimal color code (with or without #)
 * @returns RGB array [0-255, 0-255, 0-255]
 *
 * @example
 * ```typescript
 * hexToRgb("#FF5733");  // [255, 87, 51]
 * hexToRgb("FF5733");   // [255, 87, 51] - also works without #
 * hexToRgb("#000000");  // [0, 0, 0]
 * hexToRgb("#FFFFFF");  // [255, 255, 255]
 * ```
 */
export function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return [r, g, b];
}

/**
 * Convert RGB to hex color.
 * Returns uppercase hex code with # prefix.
 *
 * @param rgb - RGB array [0-255, 0-255, 0-255]
 * @returns Hexadecimal color code with # prefix (uppercase)
 *
 * @example
 * ```typescript
 * rgbToHex([255, 87, 51]);   // "#FF5733"
 * rgbToHex([0, 0, 0]);       // "#000000"
 * rgbToHex([255, 255, 255]); // "#FFFFFF"
 * ```
 */
export function rgbToHex(rgb: [number, number, number]): string {
  const [r, g, b] = rgb;
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

/**
 * Convert RGB to HSL (Hue, Saturation, Lightness).
 * Useful for color theory calculations and generating color schemes.
 *
 * @param rgb - RGB array [0-255, 0-255, 0-255]
 * @returns HSL array [hue: 0-360, saturation: 0-100, lightness: 0-100]
 *
 * @example
 * ```typescript
 * rgbToHsl([255, 87, 51]);   // [12, 100, 60] - orange hue
 * rgbToHsl([255, 0, 0]);     // [0, 100, 50] - pure red
 * rgbToHsl([128, 128, 128]); // [0, 0, 50] - neutral gray
 * ```
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
 * Convert HSL (Hue, Saturation, Lightness) to RGB.
 * Inverse operation of rgbToHsl, used in color scheme generation.
 *
 * @param hsl - HSL array [hue: 0-360, saturation: 0-100, lightness: 0-100]
 * @returns RGB array [0-255, 0-255, 0-255]
 *
 * @example
 * ```typescript
 * hslToRgb([12, 100, 60]);   // [255, 87, 51] - orange
 * hslToRgb([0, 100, 50]);    // [255, 0, 0] - pure red
 * hslToRgb([120, 100, 50]);  // [0, 255, 0] - pure green
 * hslToRgb([240, 100, 50]);  // [0, 0, 255] - pure blue
 * ```
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
 * Generate a color scheme based on color theory principles.
 * Uses HSL color space to calculate harmonious color relationships.
 *
 * @param baseColor - Base color as hex code (with or without #)
 * @param type - Type of color scheme (complementary, triadic, analogous, split-complementary, tetradic)
 * @param count - Number of colors to generate (only used for analogous scheme, default: 5)
 * @returns Array of hex color codes including the base color
 *
 * @example
 * ```typescript
 * // Complementary: opposite on color wheel (2 colors total)
 * generateColorScheme("#FF5733", "complementary");
 * // ["#FF5733", "#33DDFF"]
 *
 * // Triadic: 120° apart (3 colors total)
 * generateColorScheme("#FF5733", "triadic");
 * // ["#FF5733", "#33FF57", "#5733FF"]
 *
 * // Analogous: adjacent colors (5 colors total by default)
 * generateColorScheme("#FF5733", "analogous", 4);
 * // ["#FF5733", "#FF7A33", "#FF9D33", "#FFC033"]
 *
 * // Split-Complementary: complementary split into two (3 colors)
 * generateColorScheme("#FF5733", "split-complementary");
 * // ["#FF5733", "#33FFB8", "#33A8FF"]
 *
 * // Tetradic: rectangle on color wheel (4 colors total)
 * generateColorScheme("#FF5733", "tetradic");
 * // ["#FF5733", "#DDFF33", "#33DDFF", "#5733FF"]
 * ```
 */
export function generateColorScheme(
  baseColor: string,
  type: ColorSchemeType,
  count: number = DEFAULT_SCHEME_COUNT
): string[] {
  const rgb = hexToRgb(baseColor);
  const [h, s, l] = rgbToHsl(rgb);

  const colors: string[] = [baseColor];

  switch (type) {
    case 'complementary':
      // 180 degrees opposite
      colors.push(rgbToHex(hslToRgb([(h + COLOR_THEORY.COMPLEMENTARY) % 360, s, l])));
      break;

    case 'triadic':
      // 120 degrees apart
      colors.push(rgbToHex(hslToRgb([(h + COLOR_THEORY.TRIADIC[0]) % 360, s, l])));
      colors.push(rgbToHex(hslToRgb([(h + COLOR_THEORY.TRIADIC[1]) % 360, s, l])));
      break;

    case 'analogous':
      // Adjacent colors (30 degrees apart)
      for (let i = 1; i < count; i++) {
        const offset = i * COLOR_THEORY.ANALOGOUS_STEP;
        colors.push(rgbToHex(hslToRgb([(h + offset) % 360, s, l])));
      }
      break;

    case 'split-complementary':
      // Complementary color split into two adjacent
      colors.push(rgbToHex(hslToRgb([(h + COLOR_THEORY.SPLIT_COMPLEMENTARY[0]) % 360, s, l])));
      colors.push(rgbToHex(hslToRgb([(h + COLOR_THEORY.SPLIT_COMPLEMENTARY[1]) % 360, s, l])));
      break;

    case 'tetradic':
      // Rectangle/square (90 degrees apart)
      colors.push(rgbToHex(hslToRgb([(h + COLOR_THEORY.TETRADIC[0]) % 360, s, l])));
      colors.push(rgbToHex(hslToRgb([(h + COLOR_THEORY.TETRADIC[1]) % 360, s, l])));
      colors.push(rgbToHex(hslToRgb([(h + COLOR_THEORY.TETRADIC[2]) % 360, s, l])));
      break;
  }

  return colors;
}

/**
 * Calculate relative luminance of a color using WCAG formula.
 * Used for contrast ratio calculations and accessibility checks.
 * Based on W3C WCAG 2.0 specification.
 *
 * @param rgb - RGB array [0-255, 0-255, 0-255]
 * @returns Relative luminance value [0-1] where 0 is black and 1 is white
 *
 * @example
 * ```typescript
 * getRelativeLuminance([0, 0, 0]);       // 0.0 (black)
 * getRelativeLuminance([255, 255, 255]); // 1.0 (white)
 * getRelativeLuminance([128, 128, 128]); // ~0.215 (mid-gray)
 * ```
 */
function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Check contrast ratio between two colors for WCAG compliance.
 * Higher ratios indicate better accessibility. Minimum requirements:
 * - WCAG AA: 4.5:1 for normal text, 3:1 for large text
 * - WCAG AAA: 7:1 for normal text, 4.5:1 for large text
 *
 * @param fgColor - Foreground color (hex, with or without #)
 * @param bgColor - Background color (hex, with or without #)
 * @returns Contrast ratio (1-21) where 21 is maximum (black on white)
 *
 * @example
 * ```typescript
 * checkContrastRatio("#000000", "#FFFFFF"); // 21 (maximum contrast)
 * checkContrastRatio("#FFFFFF", "#FFFFFF"); // 1 (no contrast)
 * checkContrastRatio("#767676", "#FFFFFF"); // 4.54 (meets WCAG AA for normal text)
 * checkContrastRatio("#595959", "#FFFFFF"); // 7.0 (meets WCAG AAA for normal text)
 * ```
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
 * Check if a color combination meets WCAG AA accessibility standards.
 * WCAG AA requires:
 * - Normal text (< 18pt): contrast ratio >= 4.5:1
 * - Large text (18pt+ or 14pt+ bold): contrast ratio >= 3:1
 *
 * @param fgColor - Foreground color (hex, with or without #)
 * @param bgColor - Background color (hex, with or without #)
 * @param isLargeText - Whether the text is large (18pt+ or 14pt+ bold)
 * @returns True if the color combination meets WCAG AA standards
 *
 * @example
 * ```typescript
 * meetsWCAG_AA("#767676", "#FFFFFF");        // true (4.54:1 >= 4.5:1)
 * meetsWCAG_AA("#767676", "#FFFFFF", true);  // true (4.54:1 >= 3:1 for large text)
 * meetsWCAG_AA("#9E9E9E", "#FFFFFF");        // false (2.85:1 < 4.5:1)
 * meetsWCAG_AA("#9E9E9E", "#FFFFFF", true);  // false (2.85:1 < 3:1)
 * ```
 */
export function meetsWCAG_AA(
  fgColor: string,
  bgColor: string,
  isLargeText: boolean = false
): boolean {
  const ratio = checkContrastRatio(fgColor, bgColor);
  return isLargeText ? ratio >= WCAG_AA.LARGE : ratio >= WCAG_AA.NORMAL;
}

/**
 * Generate all 5 color schemes from a base color.
 * Convenience function that generates complementary, triadic, analogous,
 * split-complementary, and tetradic schemes in one call.
 *
 * @param baseColor - Base color in hex format (with or without #)
 * @returns Array of ColorScheme objects for all scheme types
 *
 * @example
 * ```typescript
 * const schemes = generateColorSchemes("#FF5733");
 * console.log(schemes);
 * // [
 * //   { type: "complementary", colors: ["#FF5733", "#33DDFF"] },
 * //   { type: "triadic", colors: ["#FF5733", "#33FF57", "#5733FF"] },
 * //   { type: "analogous", colors: ["#FF5733", "#FF7A33", ...] },
 * //   { type: "split-complementary", colors: ["#FF5733", "#33FFB8", "#33A8FF"] },
 * //   { type: "tetradic", colors: ["#FF5733", "#DDFF33", "#33DDFF", "#5733FF"] }
 * // ]
 * ```
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
 * Check if a color is accessible as a background with black text.
 * Quick helper to verify if a color meets WCAG AA standards for normal text with black foreground.
 *
 * @param color - Color to check as background (hex, with or without #)
 * @returns True if color meets WCAG AA with black text (#000000)
 *
 * @example
 * ```typescript
 * isColorAccessible("#FFFFFF"); // true (white background, black text)
 * isColorAccessible("#F0F0F0"); // true (light gray background)
 * isColorAccessible("#767676"); // false (medium gray, insufficient contrast)
 * isColorAccessible("#000000"); // false (black background, black text - no contrast)
 * ```
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
  return isLargeText ? ratio >= WCAG_AAA.LARGE : ratio >= WCAG_AAA.NORMAL;
}

/**
 * Generate an accessible text color (black or white) for a background.
 * Automatically chooses the text color that provides better contrast based on background luminance.
 * Uses a luminance threshold of 0.5 to determine which text color to use.
 *
 * @param bgColor - Background color (hex, with or without #)
 * @returns "#000000" (black) for light backgrounds or "#FFFFFF" (white) for dark backgrounds
 *
 * @example
 * ```typescript
 * getAccessibleTextColor("#FFFFFF"); // "#000000" (black text on white)
 * getAccessibleTextColor("#000000"); // "#FFFFFF" (white text on black)
 * getAccessibleTextColor("#FF5733"); // "#FFFFFF" (white text on orange)
 * getAccessibleTextColor("#FFE5B4"); // "#000000" (black text on peach)
 * ```
 */
export function getAccessibleTextColor(bgColor: string): string {
  const bgRgb = hexToRgb(bgColor);
  const luminance = getRelativeLuminance(bgRgb);

  // Use white text for dark backgrounds, black for light
  return luminance > LUMINANCE_THRESHOLD ? '#000000' : '#FFFFFF';
}

/**
 * Save a custom palette to localStorage.
 * If a palette with the same ID exists, it will be updated; otherwise, a new entry is created.
 *
 * @param palette - Custom palette to save (must include unique ID)
 *
 * @example
 * ```typescript
 * const palette: CustomPalette = {
 *   id: crypto.randomUUID(),
 *   name: "Ocean Blues",
 *   colors: ["#003366", "#0066CC", "#3399FF", "#66CCFF"],
 *   source: "manual",
 *   createdAt: Date.now(),
 *   description: "Cool ocean-inspired palette",
 *   tags: ["blue", "ocean", "cool"]
 * };
 * saveCustomPalette(palette);
 * ```
 */
export function saveCustomPalette(palette: CustomPalette): void {
  const palettes = getCustomPalettes();
  const existingIndex = palettes.findIndex((p) => p.id === palette.id);

  if (existingIndex >= 0) {
    palettes[existingIndex] = palette;
  } else {
    palettes.push(palette);
  }

  safeLocalStorageSet(STORAGE_KEYS.CUSTOM_PALETTES, palettes);
}

/**
 * Retrieve all custom palettes from localStorage.
 * Returns an empty array if no palettes are saved.
 *
 * @returns Array of custom palettes sorted by creation date (newest first)
 *
 * @example
 * ```typescript
 * const palettes = getCustomPalettes();
 * console.log(`You have ${palettes.length} saved palettes`);
 * palettes.forEach(palette => {
 *   console.log(`${palette.name}: ${palette.colors.join(', ')}`);
 * });
 * ```
 */
export function getCustomPalettes(): CustomPalette[] {
  return safeLocalStorageGet<CustomPalette[]>(STORAGE_KEYS.CUSTOM_PALETTES, []);
}

/**
 * Delete a custom palette from localStorage by ID.
 * If the palette doesn't exist, this operation silently succeeds.
 *
 * @param paletteId - Unique ID of the palette to delete
 *
 * @example
 * ```typescript
 * const palettes = getCustomPalettes();
 * const paletteToDelete = palettes.find(p => p.name === "Old Palette");
 * if (paletteToDelete) {
 *   deleteCustomPalette(paletteToDelete.id);
 *   console.log("Palette deleted successfully");
 * }
 * ```
 */
export function deleteCustomPalette(paletteId: string): void {
  const palettes = getCustomPalettes();
  const filtered = palettes.filter((p) => p.id !== paletteId);
  safeLocalStorageSet(STORAGE_KEYS.CUSTOM_PALETTES, filtered);
}

/**
 * Create a custom palette from extracted colors.
 * Generates a new palette with a unique ID and current timestamp.
 * Useful after extracting colors from an uploaded image.
 *
 * @param name - User-friendly name for the palette
 * @param extractedColors - Colors extracted from an image via extractColorsFromImage()
 * @param source - Source type of the palette (default: 'uploaded-image')
 * @returns CustomPalette object ready to be saved
 *
 * @example
 * ```typescript
 * const file = document.querySelector<HTMLInputElement>('#upload').files[0];
 * const colors = await extractColorsFromImage(file, 6);
 * const palette = createPaletteFromColors("Sunset Photo", colors, "uploaded-image");
 *
 * // Add custom metadata
 * palette.description = "Colors from my sunset photograph";
 * palette.tags = ["sunset", "warm", "natural"];
 *
 * // Save it
 * saveCustomPalette(palette);
 * ```
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
