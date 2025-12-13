import { log } from './logger';

/**
 * Simple fallback SVG placeholder for failed image loads
 */
export const IMAGE_FALLBACK_SRC = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%230f172a" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23cbd5e1" font-family="sans-serif" font-size="16"%3EImage unavailable%3C/text%3E%3C/svg%3E';

/**
 * Inline error handler for image elements - lightweight for use in lists
 *
 * @param event - React synthetic event from img onError
 * @example
 * <img src={url} onError={handleImageLoadError} alt="..." />
 */
export function handleImageLoadError(event: React.SyntheticEvent<HTMLImageElement>): void {
  const target = event.currentTarget;

  // Prevent infinite loop if fallback also fails
  if (target.src === IMAGE_FALLBACK_SRC) {
    return;
  }

  log.error('Image load error', {
    src: target.src,
    alt: target.alt,
  });

  // Set fallback
  target.src = IMAGE_FALLBACK_SRC;
}

/**
 * Inline error handler with retry - for critical images that need retry logic
 *
 * @param event - React synthetic event from img onError
 * @param maxRetries - Maximum number of retry attempts (default: 1)
 * @example
 * <img
 *   src={url}
 *   onError={(e) => handleImageLoadErrorWithRetry(e, 2)}
 *   data-retry-count="0"
 *   alt="..."
 * />
 */
export function handleImageLoadErrorWithRetry(
  event: React.SyntheticEvent<HTMLImageElement>,
  maxRetries = 1
): void {
  const target = event.currentTarget;
  const originalSrc = target.getAttribute('data-original-src') || target.src;
  const retryCount = parseInt(target.getAttribute('data-retry-count') || '0', 10);

  // Prevent infinite loop if fallback also fails
  if (target.src === IMAGE_FALLBACK_SRC) {
    return;
  }

  log.error('Image load error', {
    src: target.src,
    alt: target.alt,
    retry: retryCount,
  });

  // Try retry if we haven't exceeded max retries
  if (retryCount < maxRetries) {
    target.setAttribute('data-original-src', originalSrc);
    target.setAttribute('data-retry-count', String(retryCount + 1));

    // Add cache-busting parameter to retry
    const retryUrl = new URL(originalSrc, window.location.href);
    retryUrl.searchParams.set('retry', String(retryCount + 1));
    target.src = retryUrl.toString();

    log.debug(`Retrying image load (attempt ${retryCount + 1}/${maxRetries})`);
  } else {
    // Max retries exceeded, use fallback
    target.src = IMAGE_FALLBACK_SRC;
  }
}
