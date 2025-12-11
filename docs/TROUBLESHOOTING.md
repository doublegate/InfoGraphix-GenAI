# Troubleshooting Guide

This document covers common issues and their solutions when working with InfoGraphix AI.

## API Issues

### "API key invalid or lacks permissions" (403)

**Symptoms:**
- Error message about permissions
- Generation fails immediately

**Causes:**
1. Invalid API key
2. API key doesn't have Gemini API access
3. Billing not enabled on Google Cloud project

**Solutions:**

1. **Verify API key:**
   ```bash
   # Test with curl
   curl -H "Content-Type: application/json" \
        -H "x-goog-api-key: YOUR_API_KEY" \
        "https://generativelanguage.googleapis.com/v1/models"
   ```

2. **Enable Gemini API:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Navigate to APIs & Services > Library
   - Search for "Generative Language API"
   - Click Enable

3. **Enable billing:**
   - Go to Billing in Google Cloud Console
   - Link a billing account to your project

### "Too many requests" (429)

**Symptoms:**
- Rate limit error
- Works sometimes, fails other times

**Causes:**
- Exceeded API quota
- Too many requests in short period

**Solutions:**

1. **Wait and retry:**
   - Free tier: 2 requests/minute
   - Wait 60 seconds between requests

2. **Upgrade to paid tier:**
   - Pay-as-you-go allows 60 requests/minute

3. **Check quota usage:**
   - Google Cloud Console > APIs & Services > Quotas

### "Service unavailable" (503)

**Symptoms:**
- Intermittent failures
- Works later without changes

**Causes:**
- Gemini API temporary outage
- High server load

**Solutions:**

1. **Retry after delay:**
   - Wait 30-60 seconds
   - Try again

2. **Check API status:**
   - [Google Cloud Status Dashboard](https://status.cloud.google.com)

## Generation Issues

### Analysis succeeds but image generation fails

**Symptoms:**
- Analysis phase completes
- Image generation phase fails or returns empty

**Causes:**
- Image model quota different from text model
- Prompt too complex for image generation
- Content policy violation

**Solutions:**

1. **Simplify the visual plan:**
   - Edit the generated prompt if accessible
   - Use simpler topics

2. **Try different settings:**
   - Lower resolution (1K instead of 4K)
   - Different style or palette

3. **Check for content issues:**
   - Avoid topics that might trigger content filters
   - Rephrase sensitive topics

### Generated image is low quality

**Symptoms:**
- Blurry or pixelated output
- Doesn't match expected style

**Causes:**
- Low resolution selected
- Style not well-suited for topic
- Prompt interpretation issues

**Solutions:**

1. **Increase resolution:**
   - Select 2K or 4K instead of 1K

2. **Try different style:**
   - Some styles work better for certain topics
   - Data-Viz for statistics
   - Corporate for business topics

3. **Regenerate:**
   - Same settings can produce different results
   - Try regenerating 2-3 times

### Generation takes too long

**Symptoms:**
- Stuck on "Analyzing" or "Generating"
- No progress for several minutes

**Causes:**
- Large thinking budget (32K tokens)
- Complex topic requiring extensive research
- Network issues

**Solutions:**

1. **Wait longer:**
   - Analysis: up to 30 seconds typical
   - Generation: up to 60 seconds typical

2. **Check network:**
   - Ensure stable internet connection
   - Try refreshing the page

3. **Simplify input:**
   - Use shorter, more focused topics
   - Avoid very broad subjects

## Storage Issues

### "localStorage quota exceeded"

**Symptoms:**
- Can't save new versions
- Error when saving

**Causes:**
- Too many saved versions with large images
- Base64 images consume significant space (~5MB limit typical)

**Solutions:**

1. **Delete old versions:**
   - Open version history
   - Delete unused versions

2. **Clear localStorage:**
   ```javascript
   // In browser console
   localStorage.removeItem('infographix_versions');
   ```

3. **Use lower resolution:**
   - 1K images are smaller than 4K
   - Save storage space

### Form data not persisting

**Symptoms:**
- Form resets on page refresh
- Draft not saved

**Causes:**
- localStorage disabled
- Private/incognito mode
- Browser storage cleared

**Solutions:**

1. **Check localStorage availability:**
   ```javascript
   // In browser console
   try {
     localStorage.setItem('test', 'test');
     localStorage.removeItem('test');
     console.log('localStorage available');
   } catch (e) {
     console.log('localStorage not available');
   }
   ```

2. **Exit private mode:**
   - Use regular browser window

3. **Check browser settings:**
   - Ensure cookies/storage not blocked for site

## UI Issues

### Blank page after loading

**Symptoms:**
- White/blank screen
- No UI elements

**Causes:**
- JavaScript error
- Failed to load dependencies
- Browser compatibility

**Solutions:**

1. **Check console:**
   - Open DevTools (F12)
   - Look for errors in Console tab

2. **Clear cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

3. **Try different browser:**
   - Chrome, Firefox, Safari, Edge all supported

### Styling broken

**Symptoms:**
- Unstyled content
- Missing layouts

**Causes:**
- TailwindCSS CDN failed to load
- Network blocking CDN

**Solutions:**

1. **Check network:**
   - Ensure cdn.tailwindcss.com is accessible

2. **Refresh page:**
   - Sometimes CDN requests timeout

3. **Check for ad blockers:**
   - Some might block CDN requests

### Dropdown not working

**Symptoms:**
- RichSelect doesn't open
- Can't select options

**Causes:**
- Z-index conflict
- Event handler issue
- Mobile touch issues

**Solutions:**

1. **Click directly on dropdown:**
   - Avoid clicking on the edge

2. **Try keyboard:**
   - Tab to focus, Enter to open
   - Arrow keys to navigate

3. **Refresh page:**
   - Clears any stuck state

## Development Issues

### `npm run dev` fails

**Symptoms:**
- Development server won't start
- Build errors

**Solutions:**

1. **Install dependencies:**
   ```bash
   rm -rf node_modules
   npm install
   ```

2. **Check Node version:**
   ```bash
   node --version  # Should be 18+
   ```

3. **Check for port conflicts:**
   ```bash
   # Kill process on port 3000
   lsof -i :3000
   kill -9 <PID>
   ```

### TypeScript errors

**Symptoms:**
- Red squiggles in editor
- Build fails with type errors

**Solutions:**

1. **Restart TypeScript server:**
   - VS Code: Cmd/Ctrl+Shift+P > "TypeScript: Restart TS Server"

2. **Check tsconfig.json:**
   - Ensure configuration is correct

3. **Update dependencies:**
   ```bash
   npm update
   ```

### Environment variables not loading

**Symptoms:**
- `process.env.API_KEY` is undefined
- Local development can't access API

**Solutions:**

1. **Check file name:**
   - Must be `.env.local` for Vite

2. **Check variable prefix:**
   - Vite requires `VITE_` prefix for client-side
   - Or use `import.meta.env` instead of `process.env`

3. **Restart dev server:**
   - Env changes require restart

## Browser Compatibility

### Minimum Requirements

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 90+ |
| Safari | 15+ |
| Edge | 90+ |

### Known Issues

| Browser | Issue | Workaround |
|---------|-------|------------|
| Safari < 15 | Fetch API issues | Upgrade Safari |
| IE 11 | Not supported | Use modern browser |
| Opera Mini | Limited JS support | Use full browser |

## Getting Help

### Before Reporting

1. Check this troubleshooting guide
2. Search existing issues on GitHub
3. Try reproducing in incognito mode
4. Gather browser console logs

### Reporting Issues

Include in your report:
- Browser and version
- Operating system
- Steps to reproduce
- Console error messages
- Screenshots if applicable

### Resources

- [GitHub Issues](https://github.com/doublegate/InfoGraphix-GenAI/issues)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google Cloud Console](https://console.cloud.google.com)
