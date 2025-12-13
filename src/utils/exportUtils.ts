/**
 * Export utilities for infographic format conversion.
 * v1.4.0 Feature: Export Format Options
 */

import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { AspectRatio, ImageSize, ExportFormat } from '../types';

/**
 * Convert a base64 data URL to a Blob object.
 * Used for file downloads and ZIP archive creation.
 *
 * @param dataURL - Base64-encoded data URL (e.g., "data:image/png;base64,...")
 * @returns Blob object with appropriate MIME type
 *
 * @example
 * ```typescript
 * const blob = dataURLtoBlob("data:image/png;base64,iVBORw0KG...");
 * console.log(blob.type); // "image/png"
 * ```
 */
const dataURLtoBlob = (dataURL: string): Blob => {
  const parts = dataURL.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * Convert ImageSize enum to actual pixel dimension.
 * Returns the base dimension used for calculating width/height with aspect ratios.
 *
 * @param size - ImageSize enum value (Resolution_1K, Resolution_2K, or Resolution_4K)
 * @returns Base dimension in pixels (1024, 2048, or 4096)
 *
 * @example
 * ```typescript
 * getSizeDimension(ImageSize.Resolution_2K); // 2048
 * getSizeDimension(ImageSize.Resolution_4K); // 4096
 * ```
 */
const getSizeDimension = (size: ImageSize): number => {
  switch (size) {
    case ImageSize.Resolution_1K:
      return 1024;
    case ImageSize.Resolution_2K:
      return 2048;
    case ImageSize.Resolution_4K:
      return 4096;
    default:
      return 2048;
  }
};

/**
 * Calculate actual width and height dimensions based on size and aspect ratio.
 * Maintains aspect ratio while using the size dimension as a base reference.
 *
 * @param size - ImageSize enum value
 * @param aspectRatio - AspectRatio enum value (Square, Landscape, Portrait, etc.)
 * @returns Object with width and height in pixels
 *
 * @example
 * ```typescript
 * // 2K Square image
 * calculateDimensions(ImageSize.Resolution_2K, AspectRatio.Square);
 * // Returns: { width: 2048, height: 2048 }
 *
 * // 2K Landscape (16:9) image
 * calculateDimensions(ImageSize.Resolution_2K, AspectRatio.Landscape);
 * // Returns: { width: 2048, height: 1152 }
 * ```
 */
const calculateDimensions = (size: ImageSize, aspectRatio: AspectRatio): { width: number; height: number } => {
  const dimension = getSizeDimension(size);

  switch (aspectRatio) {
    case AspectRatio.Square:
      return { width: dimension, height: dimension };
    case AspectRatio.Landscape:
      // 16:9
      return { width: dimension, height: Math.round(dimension * 9 / 16) };
    case AspectRatio.Portrait:
      // 9:16
      return { width: Math.round(dimension * 9 / 16), height: dimension };
    case AspectRatio.StandardLandscape:
      // 4:3
      return { width: dimension, height: Math.round(dimension * 3 / 4) };
    case AspectRatio.StandardPortrait:
      // 3:4
      return { width: Math.round(dimension * 3 / 4), height: dimension };
    default:
      return { width: dimension, height: dimension };
  }
};

/**
 * Export infographic as a PDF file with embedded PNG image.
 * Creates a PDF document sized exactly to match the image dimensions.
 * Includes metadata for better document organization.
 *
 * @param imageDataURL - Base64-encoded PNG data URL
 * @param filename - Base filename (without extension) for the PDF
 * @param size - ImageSize enum value for dimension calculation
 * @param aspectRatio - AspectRatio enum value for dimension calculation
 *
 * @example
 * ```typescript
 * exportAsPDF(
 *   "data:image/png;base64,iVBORw0KG...",
 *   "my-infographic",
 *   ImageSize.Resolution_2K,
 *   AspectRatio.Landscape
 * );
 * // Downloads: my-infographic.pdf
 * ```
 */
export const exportAsPDF = (
  imageDataURL: string,
  filename: string,
  size: ImageSize,
  aspectRatio: AspectRatio
): void => {
  const { width, height } = calculateDimensions(size, aspectRatio);

  // Calculate PDF dimensions in mm (at 72 DPI)
  const mmWidth = (width / 72) * 25.4;
  const mmHeight = (height / 72) * 25.4;

  // Create PDF with exact dimensions
  const pdf = new jsPDF({
    orientation: width > height ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [mmWidth, mmHeight]
  });

  // Add image to fill entire page
  pdf.addImage(imageDataURL, 'PNG', 0, 0, mmWidth, mmHeight);

  // Add metadata
  pdf.setProperties({
    title: `${filename} - InfoGraphix AI`,
    subject: 'Generated Infographic',
    creator: 'InfoGraphix AI',
    keywords: 'infographic, visualization, data'
  });

  // Download
  pdf.save(`${filename}.pdf`);
};

/**
 * Export infographic as an SVG file by wrapping PNG in SVG container.
 * Note: This creates an SVG wrapper around the raster PNG image, not a true vector conversion.
 * The image element references the original PNG data URL.
 *
 * @param imageDataURL - Base64-encoded PNG data URL
 * @param filename - Base filename (without extension) for the SVG
 * @param size - ImageSize enum value for viewBox dimensions
 * @param aspectRatio - AspectRatio enum value for viewBox dimensions
 *
 * @example
 * ```typescript
 * exportAsSVG(
 *   "data:image/png;base64,iVBORw0KG...",
 *   "my-infographic",
 *   ImageSize.Resolution_2K,
 *   AspectRatio.Square
 * );
 * // Downloads: my-infographic.svg
 * ```
 */
export const exportAsSVG = (
  imageDataURL: string,
  filename: string,
  size: ImageSize,
  aspectRatio: AspectRatio
): void => {
  const { width, height } = calculateDimensions(size, aspectRatio);

  // Create SVG with embedded PNG
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <title>${filename}</title>
  <desc>Generated by InfoGraphix AI</desc>
  <image width="${width}" height="${height}" xlink:href="${imageDataURL}"/>
</svg>`;

  // Create blob and download
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export infographic as a PNG file (direct download).
 * Creates a temporary anchor element to trigger the browser download.
 *
 * @param imageDataURL - Base64-encoded PNG data URL
 * @param filename - Base filename (without extension) for the PNG
 *
 * @example
 * ```typescript
 * exportAsPNG("data:image/png;base64,iVBORw0KG...", "my-infographic");
 * // Downloads: my-infographic.png
 * ```
 */
export const exportAsPNG = (
  imageDataURL: string,
  filename: string
): void => {
  const a = document.createElement('a');
  a.href = imageDataURL;
  a.download = `${filename}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

/**
 * Package multiple resolution versions of an infographic into a ZIP archive.
 * Includes all provided resolutions plus a README.txt with metadata.
 *
 * Note: The caller must provide pre-generated images at different resolutions.
 * This function packages existing images, it does not regenerate them.
 *
 * @param images - Array of objects containing size enum and corresponding data URL
 * @param baseFilename - Base filename for the ZIP and individual files (without extension)
 * @returns Promise that resolves when download is initiated
 *
 * @example
 * ```typescript
 * await exportMultiResolution(
 *   [
 *     { size: ImageSize.Resolution_1K, dataURL: "data:image/png;base64,..." },
 *     { size: ImageSize.Resolution_2K, dataURL: "data:image/png;base64,..." },
 *     { size: ImageSize.Resolution_4K, dataURL: "data:image/png;base64,..." }
 *   ],
 *   "infographic"
 * );
 * // Downloads: infographic_multi-res.zip
 * ```
 */
export const exportMultiResolution = async (
  images: Array<{ size: ImageSize; dataURL: string }>,
  baseFilename: string
): Promise<void> => {
  const zip = new JSZip();

  // Add each resolution to the ZIP
  for (const { size, dataURL } of images) {
    const blob = dataURLtoBlob(dataURL);
    const filename = `${baseFilename}_${size}.png`;
    zip.file(filename, blob);
  }

  // Add README
  const readme = `InfoGraphix AI - Multi-Resolution Export
Generated: ${new Date().toISOString()}

This package contains the following resolutions:
${images.map(img => `- ${img.size} (${getSizeDimension(img.size)}px)`).join('\n')}

All images are in PNG format for maximum compatibility.
`;

  zip.file('README.txt', readme);

  // Generate and download ZIP
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseFilename}_multi-res.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Main export function that routes to the appropriate format handler.
 * Sanitizes the filename and delegates to format-specific export functions.
 *
 * @param format - ExportFormat enum value (PNG, PDF, SVG, or MultiRes)
 * @param imageDataURL - Base64-encoded PNG data URL
 * @param filename - Base filename (will be sanitized, without extension)
 * @param size - ImageSize enum value (ignored for PNG format)
 * @param aspectRatio - AspectRatio enum value (ignored for PNG format)
 * @param multiResImages - Optional array of multiple resolution images (required for MultiRes format)
 * @returns Promise that resolves when export is complete
 * @throws {Error} If MultiRes format is used without providing multiResImages
 * @throws {Error} If an unsupported format is provided
 *
 * @example
 * ```typescript
 * // Export as PNG
 * await exportInfographic(
 *   ExportFormat.PNG,
 *   imageDataURL,
 *   "my infographic",
 *   ImageSize.Resolution_2K,
 *   AspectRatio.Landscape
 * );
 *
 * // Export as multi-resolution ZIP
 * await exportInfographic(
 *   ExportFormat.MultiRes,
 *   imageDataURL,
 *   "my-infographic",
 *   ImageSize.Resolution_2K,
 *   AspectRatio.Landscape,
 *   multiResImages
 * );
 * ```
 */
export const exportInfographic = async (
  format: ExportFormat,
  imageDataURL: string,
  filename: string,
  size: ImageSize,
  aspectRatio: AspectRatio,
  multiResImages?: Array<{ size: ImageSize; dataURL: string }>
): Promise<void> => {
  // Sanitize filename
  const safeFilename = filename.replace(/[^a-z0-9_-]/gi, '_');

  switch (format) {
    case ExportFormat.PNG:
      exportAsPNG(imageDataURL, safeFilename);
      break;
    case ExportFormat.PDF:
      exportAsPDF(imageDataURL, safeFilename, size, aspectRatio);
      break;
    case ExportFormat.SVG:
      exportAsSVG(imageDataURL, safeFilename, size, aspectRatio);
      break;
    case ExportFormat.MultiRes:
      if (!multiResImages || multiResImages.length === 0) {
        throw new Error('Multi-resolution export requires multiple images');
      }
      await exportMultiResolution(multiResImages, safeFilename);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

/**
 * Create a batch ZIP archive from multiple infographic images.
 * Includes all images as PNG files plus a metadata.json file with generation details.
 *
 * @param items - Array of objects containing filename and data URL for each infographic
 * @param archiveName - Name for the ZIP archive (without .zip extension)
 * @returns Promise that resolves when download is initiated
 *
 * @example
 * ```typescript
 * await exportBatchAsZip(
 *   [
 *     { filename: "infographic-1", dataURL: "data:image/png;base64,..." },
 *     { filename: "infographic-2", dataURL: "data:image/png;base64,..." },
 *     { filename: "infographic-3", dataURL: "data:image/png;base64,..." }
 *   ],
 *   "my-batch-export"
 * );
 * // Downloads: my-batch-export.zip (containing 3 PNGs + metadata.json)
 * ```
 */
export const exportBatchAsZip = async (
  items: Array<{ filename: string; dataURL: string }>,
  archiveName: string
): Promise<void> => {
  const zip = new JSZip();

  // Add each infographic to the ZIP
  for (const { filename, dataURL } of items) {
    const blob = dataURLtoBlob(dataURL);
    const safeFilename = filename.replace(/[^a-z0-9_-]/gi, '_');
    zip.file(`${safeFilename}.png`, blob);
  }

  // Add metadata
  const metadata = {
    generated: new Date().toISOString(),
    count: items.length,
    generator: 'InfoGraphix AI v2.0.2',
    format: 'PNG'
  };

  zip.file('metadata.json', JSON.stringify(metadata, null, 2));

  // Generate and download ZIP
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${archiveName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
