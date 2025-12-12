# Frequently Asked Questions (FAQ)

Common questions and answers about InfoGraphix AI.

## Table of Contents

- [Getting Started](#getting-started)
- [API Keys and Setup](#api-keys-and-setup)
- [Rate Limits and Quotas](#rate-limits-and-quotas)
- [Generation Process](#generation-process)
- [Quality and Results](#quality-and-results)
- [Storage and History](#storage-and-history)
- [Errors and Troubleshooting](#errors-and-troubleshooting)
- [Features and Capabilities](#features-and-capabilities)
- [Technical Questions](#technical-questions)
- [Pricing and Costs](#pricing-and-costs)

---

## Getting Started

### What is InfoGraphix AI?

InfoGraphix AI is a web application that generates high-quality infographic images using Google's Gemini AI. It uses a two-phase pipeline: first analyzing your topic with Gemini 3 Pro (with extended thinking and Google Search grounding), then generating a visual infographic with Gemini 3 Pro Image Preview.

### Do I need to install anything?

No installation required. InfoGraphix AI runs entirely in your web browser. You just need:
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A Google Gemini API key
- Internet connection

### Can I use this offline?

No, InfoGraphix AI requires an internet connection to:
- Call Google Gemini APIs for analysis and generation
- Access Google Search grounding for up-to-date information
- Load external resources

However, your form drafts and version history are saved locally in the browser.

### Is my data private?

Yes, with important caveats:
- Your topics and generated infographics are sent to Google Gemini APIs (subject to Google's privacy policy)
- Version history is stored in your browser's localStorage (never sent to any server)
- No backend server collects your data
- For Google AI Studio deployments, API keys are managed by AI Studio

See Google's [Gemini API Terms](https://ai.google.dev/terms) for API data handling.

---

## API Keys and Setup

### Where do I get a Gemini API key?

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Enable billing on your Google Cloud project (required for InfoGraphix AI)

### Do I need a paid API key?

**Yes, effectively.** While Google offers a free tier, InfoGraphix AI requires:
- Extended thinking mode (32K tokens) for analysis
- Image generation capabilities
- Sufficient quota for real use

The free tier has very limited quota (2 requests/minute) and may not support all features. A paid tier key is strongly recommended.

### How do I set up my API key locally?

1. Create a file named `.env.local` in the project root
2. Add your key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```
3. Restart the development server (`npm run dev`)
4. The app will use your key from the environment

### How do I set up my API key in Google AI Studio?

When running in Google AI Studio:
1. The app automatically detects the AI Studio environment
2. Click "Select API Key" when prompted
3. Choose from your available API keys
4. The key is managed by AI Studio (no manual configuration needed)

### My API key isn't working. What should I check?

Common issues:

1. **Billing not enabled:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/billing)
   - Enable billing for your project
   - Add a payment method

2. **API not enabled:**
   - Go to [Google Cloud Console APIs](https://console.cloud.google.com/apis)
   - Enable "Generative Language API"

3. **Wrong key format:**
   - Keys start with `AI` followed by alphanumeric characters
   - Example format: `AIzaSy...` (not the actual key)

4. **Key restrictions:**
   - Check if your key has IP or domain restrictions
   - Ensure restrictions allow your deployment domain

5. **Expired or deleted key:**
   - Generate a new key if the old one was deleted
   - Keys don't expire but can be revoked

---

## Rate Limits and Quotas

### What are the rate limits?

| Tier | Requests/Minute | Tokens/Minute | Models |
|------|-----------------|---------------|--------|
| **Free** | 2 | 32,000 | Limited model access |
| **Paid** | 60 | 1,000,000 | Full model access |

InfoGraphix AI makes 2 API calls per generation (analysis + image), so:
- **Free tier:** 1 infographic per minute (very slow)
- **Paid tier:** 30 infographics per minute (practical)

### What happens if I hit the rate limit?

You'll see an error message:
```
"Rate limit exceeded. We're getting too many requests.
Please wait a moment and try again."
```

**Recovery:**
1. Wait 60 seconds before retrying
2. The app doesn't automatically retry (to avoid wasting quota)
3. Click "Generate" again after waiting

### How can I avoid rate limits?

1. **Use paid tier** (60 requests/min vs 2)
2. **Cache results:** Save generations to version history instead of regenerating
3. **Batch work:** Generate multiple infographics in sequence, not parallel
4. **Monitor usage:** Keep track of how many generations you've done recently

### How much quota does one generation use?

Approximate token usage:

**Analysis Phase (Gemini 3 Pro):**
- Thinking budget: 32,768 tokens (allocated, not always fully used)
- Input prompt: ~500-2,000 tokens (depending on topic length)
- Output: ~1,000-3,000 tokens (JSON response)
- **Total: ~35,000-40,000 tokens**

**Image Generation Phase (Gemini 3 Pro Image):**
- Input prompt: ~500-2,000 tokens (visual plan)
- Image output: Not counted in token quota
- **Total: ~500-2,000 tokens**

**Per generation: ~35,000-42,000 tokens**
**With 1M tokens/min paid tier: ~24 generations per minute theoretically**

---

## Generation Process

### How long does generation take?

Typical timings:

| Phase | Duration | What's Happening |
|-------|----------|------------------|
| Analysis | 5-15 seconds | AI analyzes topic, searches web, plans visual |
| Image Generation | 10-30 seconds | AI creates infographic image |
| **Total (1K/2K)** | **15-45 seconds** | Complete pipeline |
| **Total (4K)** | **20-60 seconds** | Higher resolution takes longer |

Factors affecting speed:
- Resolution (4K slower than 1K)
- API load (Google's server capacity)
- Topic complexity (more thinking = longer analysis)
- Internet connection speed

### Can I cancel generation in progress?

No, once started:
- The API calls cannot be cancelled mid-flight
- You'll be charged for tokens even if you leave the page
- Best practice: wait for completion or error

However, closing/refreshing the browser will stop the local processing (but API calls continue server-side).

### Why did my generation fail?

Common reasons:

1. **API Key Issues:** Invalid, expired, or insufficient permissions
2. **Rate Limiting:** Too many requests too quickly
3. **Safety Filters:** Topic triggered content safety blocks
4. **Service Unavailable:** Google's servers temporarily overloaded
5. **Network Issues:** Connection interrupted during generation
6. **Invalid Input:** Empty topic, malformed filters, etc.

See [Errors and Troubleshooting](#errors-and-troubleshooting) for solutions.

### Can I regenerate with the same settings?

Yes! After successful generation:
1. All your settings are preserved (topic, style, palette, etc.)
2. Click "Regenerate" to create a new variation
3. The AI will produce a different result (non-deterministic)

### Why are regenerations different each time?

The AI models are non-deterministic:
- Same prompt can yield different analysis
- Image generation has inherent randomness
- Google Search grounding may return different sources
- This is by design (creative variation)

---

## Quality and Results

### How can I improve infographic quality?

**Topic Selection:**
- Be specific (not "AI" but "Evolution of AI from 1950 to 2025")
- Include desired visualizations ("Show timeline with milestones")
- Mention key data points ("Compare 5 databases by speed and scalability")

**Style and Palette:**
- Match style to content (Corporate for business, Watercolor for nature)
- Use high-contrast palettes for better readability
- Test 2-3 style combinations to find the best fit

**Resolution:**
- Use 2K for general purposes
- Upgrade to 4K for prints or large displays
- 1K only for quick previews

**Regeneration:**
- First result not perfect? Try regenerating 2-3 times
- Sometimes the AI produces better results on retry

### Text is too small to read. What should I do?

Solutions:

1. **Increase resolution:** 1K → 2K → 4K
2. **Change aspect ratio:** Landscape/square ratios have more width for text
3. **Simplify topic:** Fewer key points = larger text per item
4. **Choose cleaner styles:** Modern Minimalist, Corporate, Data Viz
5. **Use high-contrast palettes:** Professional Blue & White, Monochrome
6. **Be more specific:** Ask for "large readable text" in your topic

### Colors don't match my selected palette. Why?

The AI interprets palettes creatively:
- Palette is a guideline, not strict enforcement
- Some styles override palette for aesthetic reasons
- Regeneration may yield better palette adherence

Solutions:
- Try regenerating (variation may match better)
- Choose more distinctive palettes (Dark Mode Neon vs Soft Pastels)
- Mention specific colors in topic ("use bright red and dark blue")

### Can I edit the generated infographic?

No in-app editing, but you can:
- Download the PNG and edit in image software (Photoshop, GIMP, Canva)
- Regenerate with adjusted topic/style for different results
- Use version history to compare multiple generations

For programmatic editing, see [docs/API.md](API.md) for SDK integration.

### How accurate is the information?

Accuracy depends on:

**With Google Search Grounding (Topics/URLs):**
- Generally accurate for well-documented topics
- Citations provided in "Web Sources"
- Reflects information available on the web

**Without Grounding (Markdown files):**
- Only as accurate as your provided content
- AI may infer or fill gaps (verify important facts)

**Best Practices:**
- Verify facts in generated infographics
- Check web sources for citations
- Use for visualization, not as primary fact source
- For critical information, provide markdown files with verified data

---

## Storage and History

### Where are my saved versions stored?

In your browser's localStorage:
- Location: Browser's local storage database
- Key: `infographix_versions`
- Format: JSON array of SavedVersion objects

**Important:**
- Data is local to your browser and device
- Not synced across browsers or devices
- Clearing browser data deletes saved versions
- Incognito/private mode won't persist data

### How many versions can I save?

Technical limit: Browser localStorage capacity (~5-10 MB)

Practical limits:

| Resolution | Approx File Size | Saved Versions (5 MB limit) |
|------------|------------------|----------------------------|
| 1K | 200-400 KB | ~15-25 versions |
| 2K | 600-1200 KB | ~5-10 versions |
| 4K | 2-5 MB | ~1-3 versions |

**Recommendations:**
- Limit to 10-20 saved versions
- Use 2K instead of 4K for saved versions
- Download important infographics to your device
- Periodically clear old versions

### What happens if localStorage is full?

You'll see an error:
```
"Failed to save to history. Local storage might be full
(Base64 images are large)."
```

**Solutions:**
1. Delete old versions from history
2. Click "Clear All History"
3. Download important infographics first
4. Use lower resolution (2K instead of 4K)

### Can I export my version history?

Not directly, but you can:
1. Open browser console (F12)
2. Run: `localStorage.getItem('infographix_versions')`
3. Copy the JSON data
4. Save to a file for backup

To restore:
1. Open console
2. Run: `localStorage.setItem('infographix_versions', '[paste JSON here]')`
3. Refresh the page

### My saved versions disappeared. What happened?

Common causes:
- Browser data was cleared (manually or by cleaner tool)
- Used different browser or device
- Used incognito/private mode (doesn't persist)
- Browser was reset or reinstalled

**Prevention:**
- Download important infographics to your device
- Don't rely solely on version history for important work
- Consider exporting localStorage JSON as backup

---

## Errors and Troubleshooting

### Error: "Permission denied. Please ensure you have selected a valid API Key..."

**Cause:** API key is invalid, expired, or lacks permissions

**Solutions:**
1. Verify API key is correct (check for typos)
2. Enable billing on Google Cloud project
3. Enable "Generative Language API" in Google Cloud Console
4. Generate a new API key if old one was revoked
5. Check API key restrictions (IP, domain limits)

### Error: "Rate limit exceeded. We're getting too many requests..."

**Cause:** You've exceeded the API rate limit

**Solutions:**
1. Wait 60 seconds before retrying
2. Upgrade to paid tier (60 req/min vs 2)
3. Avoid rapid successive generations
4. Check if other apps/tabs are using the same API key

### Error: "The Gemini service is currently overloaded..."

**Cause:** Google's servers are experiencing high load

**Solutions:**
1. Wait 10-30 seconds and retry
2. Try during off-peak hours
3. Check [Google Cloud Status](https://status.cloud.google.com/)
4. No action needed on your end (temporary issue)

### Error: "The request was blocked due to safety settings..."

**Cause:** Topic triggered content safety filters

**Solutions:**
1. Rephrase topic to be more neutral
2. Focus on factual, educational aspects
3. Avoid sensitive political, violent, or explicit content
4. Try a different angle or perspective

Example:
```
Blocked: "How to hack into systems"
Allowed: "Cybersecurity principles and best practices"
```

### Error: "The model could not generate a valid response..."

**Cause:** AI couldn't produce valid output for this prompt

**Solutions:**
1. Simply retry (may work on second attempt)
2. Simplify your topic
3. Try a different style/palette combination
4. Make topic more specific and descriptive

### Generation is stuck at "Analyzing..."

**Possible causes:**
- Network connection interrupted
- API timeout (rare, but possible)
- Browser tab suspended (mobile)

**Solutions:**
1. Wait 60 seconds (max timeout)
2. Check internet connection
3. Refresh page and retry
4. Ensure browser tab is active (not suspended)

### Images aren't displaying properly

**Causes:**
- Base64 data too large for browser
- Browser memory issues
- Network interruption during download

**Solutions:**
1. Try lower resolution (2K instead of 4K)
2. Close other tabs to free memory
3. Try different browser
4. Clear browser cache

---

## Features and Capabilities

### Can I batch generate multiple infographics?

Not currently. Each generation is manual:
1. Enter topic
2. Click "Generate"
3. Wait for completion
4. Repeat for next infographic

**Future feature:** Batch mode is planned (see [to-dos/FEATURE-ROADMAP.md](../to-dos/FEATURE-ROADMAP.md))

### Can I create custom styles or palettes?

Not currently. You must choose from:
- 23 pre-defined styles
- 10 pre-defined palettes

**Workaround:**
- Mention specific colors/aesthetics in your topic
- Example: "Create infographic with teal and coral colors, minimalist style"

**Future feature:** Custom templates planned for v0.2.0

### Can I export to SVG or PDF?

Not currently. Only PNG export is supported.

**Workaround:**
- Download PNG
- Convert to PDF/SVG using external tools:
  - Inkscape (PNG → SVG trace)
  - Adobe Acrobat (PNG → PDF)
  - Online converters

**Future feature:** SVG/PDF export planned for v0.2.0

### Can I collaborate with others?

Not currently. InfoGraphix AI is single-user:
- No user accounts
- No cloud sync
- No sharing features

**Workaround:**
- Download and share PNG files
- Share exported localStorage JSON (manual)

**Future feature:** Collaboration planned for future versions

### Can I use this via API?

Not currently. InfoGraphix AI is a web app only.

**Workaround:**
- Integrate Gemini SDK directly (see [docs/API.md](API.md))
- Build custom solution using the same two-phase approach

**Future feature:** REST API planned for future versions

### Does it support languages other than English?

Partially:
- **Analysis:** Gemini 3 Pro supports many languages (input topic in any language)
- **UI:** English only currently
- **Generated infographics:** Text may be in your input language

**Best results:** Use English for topics and expect English text in infographics

---

## Technical Questions

### What technologies power InfoGraphix AI?

**Frontend:**
- React 19 (UI framework)
- TypeScript 5.8 (type safety)
- Vite 6 (build tool)
- TailwindCSS v4 (styling, build-time)
- Lucide React (icons)

**AI/Backend:**
- @google/genai SDK (Gemini API client)
- Gemini 3 Pro Preview (analysis)
- Gemini 3 Pro Image Preview (generation)

**No traditional backend** - everything runs in browser.

### How does the two-phase pipeline work?

**Phase 1: Analysis (Gemini 3 Pro)**
```
Input → Deep Analysis → JSON Output
         ├─ 32K thinking budget
         ├─ Google Search grounding
         └─ Structured output: {title, summary, keyPoints, visualPlan}
```

**Phase 2: Generation (Gemini 3 Pro Image)**
```
Visual Plan → Image Generation → PNG Base64
              ├─ Style interpretation
              ├─ Palette application
              └─ Resolution/ratio rendering
```

See [docs/ARCHITECTURE.md](ARCHITECTURE.md) for detailed diagrams.

### Why does it require billing enabled?

Google's free tier has severe limitations:
- Only 2 requests/minute (InfoGraphix needs 2 per generation)
- Limited model access
- May not support extended thinking mode
- May not support image generation

Paid tier provides:
- 60 requests/minute (practical for real use)
- Full model access
- All features enabled

### Is my API key secure?

**Security measures:**
- API keys are never sent to any server except Google's
- Local development: `.env.local` is gitignored
- AI Studio: Keys managed by Google's secure system
- No backend to intercept keys

**Best practices:**
- Never commit API keys to source control
- Use environment variables
- Rotate keys periodically
- Set usage limits in Google Cloud Console

### Can I self-host this?

Yes! InfoGraphix AI is open source:

1. Clone repository
2. `npm install`
3. Create `.env.local` with your API key
4. `npm run dev` (development) or `npm run build` (production)
5. Deploy to Vercel, Netlify, or any static host

See [docs/DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### What browsers are supported?

**Fully supported:**
- Chrome/Edge 90+ (Chromium-based)
- Firefox 88+
- Safari 14+

**Requirements:**
- JavaScript enabled
- localStorage available
- Modern CSS support (for TailwindCSS)

**Not supported:**
- Internet Explorer (deprecated)
- Very old mobile browsers

---

## Pricing and Costs

### How much does InfoGraphix AI cost?

**The app itself:** Free and open source

**Google Gemini API costs:** Pay-as-you-go (see [Google Cloud Pricing](https://ai.google.dev/pricing))

Approximate cost per infographic (as of Dec 2024):
- Analysis: ~$0.01-0.02 (35K-40K tokens @ $0.000375 per 1K tokens)
- Image generation: ~$0.01-0.05 (varies by resolution)
- **Total per infographic: ~$0.02-0.07**

**Example monthly costs (100 infographics/month):**
- Light use (10/month): ~$0.20-0.70
- Moderate use (100/month): ~$2-7
- Heavy use (1000/month): ~$20-70

**Note:** Prices subject to change. Check Google's official pricing for current rates.

### Can I use the free tier?

Technically yes, but not practical:
- Limited to 2 requests/minute
- One infographic takes ~2 minutes (sequential API calls)
- Very slow for real use

Free tier is good for:
- Testing the app
- Generating 1-2 infographics occasionally
- Evaluating before committing to paid tier

### How can I reduce costs?

1. **Cache results:** Save to version history instead of regenerating
2. **Use 1K/2K:** Higher resolutions cost more
3. **Be specific:** Clear topics reduce re-generations
4. **Batch work:** Plan topics in advance, generate in one session
5. **Set budget alerts:** Use Google Cloud billing alerts

### Are there any hidden costs?

No hidden costs, but be aware:
- Google Cloud may charge for other services if you use them
- Network egress charges (rare, usually covered in free tier)
- Storage costs if you use Google Cloud Storage (not needed for InfoGraphix)

**InfoGraphix AI only uses:**
- Gemini API (token-based pricing)
- No databases, no storage services, no compute instances

---

**Can't find your answer?** Check [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md) or open an issue on [GitHub](https://github.com/doublegate/InfoGraphix-GenAI/issues).
