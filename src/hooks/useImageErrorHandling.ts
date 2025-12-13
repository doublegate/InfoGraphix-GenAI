import React, { useState, useCallback } from 'react';
import { log } from '../utils/logger';

interface UseImageErrorHandlingOptions {
  fallbackSrc?: string;
  maxRetries?: number;
  onError?: (error: string) => void;
}

interface UseImageErrorHandlingReturn {
  imageSrc: string;
  hasError: boolean;
  handleImageError: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  resetError: () => void;
}

/**
 * Hook for handling image loading errors with retry logic and fallback placeholder
 *
 * @param src - Original image source URL
 * @param options - Configuration options
 * @returns Image error handling utilities
 *
 * @example
 * ```tsx
 * const { imageSrc, hasError, handleImageError } = useImageErrorHandling(
 *   imageUrl,
 *   { fallbackSrc: '/placeholder.png', maxRetries: 2 }
 * );
 *
 * <img src={imageSrc} onError={handleImageError} alt="..." />
 * ```
 */
export function useImageErrorHandling(
  src: string,
  options: UseImageErrorHandlingOptions = {}
): UseImageErrorHandlingReturn {
  const {
    fallbackSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%230f172a" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23cbd5e1" font-family="sans-serif" font-size="18"%3EImage unavailable%3C/text%3E%3C/svg%3E',
    maxRetries = 1,
    onError,
  } = options;

  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleImageError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const target = event.currentTarget;
      const errorMessage = `Failed to load image: ${target.src}`;

      // Log error
      log.error('Image load error', {
        src: target.src,
        alt: target.alt,
        retry: retryCount,
      });

      // Try retry if we haven't exceeded max retries
      if (retryCount < maxRetries) {
        setRetryCount((prev) => prev + 1);
        // Add cache-busting parameter to retry
        const retryUrl = new URL(src, window.location.href);
        retryUrl.searchParams.set('retry', String(retryCount + 1));
        setImageSrc(retryUrl.toString());
        log.debug(`Retrying image load (attempt ${retryCount + 1}/${maxRetries})`);
      } else {
        // Max retries exceeded, use fallback
        setHasError(true);
        setImageSrc(fallbackSrc);
        if (onError) {
          onError(errorMessage);
        }
      }
    },
    [src, retryCount, maxRetries, fallbackSrc, onError]
  );

  const resetError = useCallback(() => {
    setHasError(false);
    setRetryCount(0);
    setImageSrc(src);
  }, [src]);

  return {
    imageSrc,
    hasError,
    handleImageError,
    resetError,
  };
}
