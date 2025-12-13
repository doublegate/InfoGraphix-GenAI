# User Guide

Welcome to InfoGraphix AI! This comprehensive guide will help you create stunning AI-generated infographics from any topic, URL, or GitHub repository.

## Table of Contents

- [Getting Started](#getting-started)
  - [First-Time Setup](#first-time-setup)
  - [Understanding the Interface](#understanding-the-interface)
- [Input Types](#input-types)
  - [Topic-Based Generation](#topic-based-generation)
  - [URL Analysis](#url-analysis)
  - [GitHub Repository Analysis](#github-repository-analysis)
  - [Markdown File Upload](#markdown-file-upload)
- [Customization Options](#customization-options)
  - [Artistic Styles](#artistic-styles)
  - [Color Palettes](#color-palettes)
  - [Resolution and Aspect Ratio](#resolution-and-aspect-ratio)
- [Generation Process](#generation-process)
  - [Analysis Phase](#analysis-phase)
  - [Image Generation Phase](#image-generation-phase)
  - [Understanding Results](#understanding-results)
- [Managing Your Infographics](#managing-your-infographics)
  - [Downloading Images](#downloading-images)
  - [Version History](#version-history)
  - [Providing Feedback](#providing-feedback)
- [Best Practices](#best-practices)
  - [Topic Selection Tips](#topic-selection-tips)
  - [Style and Palette Matching](#style-and-palette-matching)
  - [Optimizing for Quality](#optimizing-for-quality)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### First-Time Setup

1. **API Key Configuration**

   When you first open InfoGraphix AI, you'll see an API key selection prompt:

   - **In Google AI Studio**: Click "Select API Key" to choose from your available keys
   - **Local Development**: Create a `.env.local` file with your `GEMINI_API_KEY`

   **Requirements:**
   - Google Gemini API key
   - Billing enabled on your Google Cloud project
   - Paid tier recommended (free tier has strict rate limits)

2. **Verify Setup**

   Once your API key is configured:
   - The modal will close automatically
   - You'll see the main generation interface
   - The "Generate Infographic" button will become available

### Understanding the Interface

The interface consists of four main areas:

```
┌─────────────────────────────────────────────────────┐
│ Header: InfoGraphix AI logo and navigation          │
├─────────────────────────────────────────────────────┤
│ Input Form: Topic, Style, Palette, Settings         │
├─────────────────────────────────────────────────────┤
│ Processing State: Loading indicators (when active)  │
├─────────────────────────────────────────────────────┤
│ Results Area: Generated infographic + details       │
├─────────────────────────────────────────────────────┤
│ Version History: Saved generations (sidebar)        │
└─────────────────────────────────────────────────────┘
```

**Key Elements:**
- **Input Type Tabs**: Switch between Topic, URL, GitHub, File
- **Style Dropdown**: Choose from 23 artistic styles with visual previews
- **Palette Dropdown**: Select from 10 color schemes
- **Settings Panel**: Configure resolution and aspect ratio
- **Action Buttons**: Generate, Download, Save to History

---

## Input Types

InfoGraphix AI supports four distinct input methods, each optimized for different use cases.

### Topic-Based Generation

**Best for:** General topics, concepts, historical events, technologies

**How to use:**

1. Select the "Topic" tab (default)
2. Enter your topic in the text field
3. Be specific and descriptive

**Examples:**

```
Good Topics:
✓ "Evolution of artificial intelligence from 1950 to 2025"
✓ "How solar panels generate electricity: technical breakdown"
✓ "Comparison of NoSQL databases: MongoDB, Redis, Cassandra"
✓ "The water cycle and its impact on climate"

Less Effective Topics:
✗ "AI" (too broad)
✗ "Science" (too vague)
✗ "Stuff about computers" (unclear)
```

**What happens:**
- Gemini 3 Pro analyzes your topic using Google Search for current information
- AI identifies key facts, statistics, and relationships
- Visual plan is created based on your selected style and palette

**Tips:**
- Include specific aspects you want covered (e.g., "Include timeline and key milestones")
- Mention desired visualizations (e.g., "Show process flow diagram")
- Specify scope (e.g., "Focus on 2020-2025")

### URL Analysis

**Best for:** Blog posts, articles, documentation pages, product pages

**How to use:**

1. Select the "URL" tab
2. Paste the full URL (including https://)
3. The AI will analyze the page content

**Examples:**

```
Supported URLs:
✓ https://react.dev/blog/2024/04/25/react-19
✓ https://en.wikipedia.org/wiki/Quantum_computing
✓ https://docs.python.org/3/tutorial/
✓ https://www.nasa.gov/mission/mars-2020/

Note: The page must be publicly accessible (no login required)
```

**What happens:**
- AI infers content from the URL or retrieves it via search
- Key information is extracted and analyzed
- Infographic focuses on the main concepts from the page

**Tips:**
- Use stable, permanent URLs (avoid temporary pages)
- Documentation and educational content works best
- News articles create timely, relevant infographics

### GitHub Repository Analysis

**Best for:** Open source projects, code analysis, repository documentation

**How to use:**

1. Select the "GitHub" tab
2. Enter repository URL or name (`owner/repo` format)
3. **Optional**: Add filters to focus analysis

**Examples:**

```
Repository Formats:
✓ https://github.com/facebook/react
✓ facebook/react
✓ https://github.com/microsoft/vscode
✓ microsoft/vscode
```

**GitHub Filters:**

| Filter | Purpose | Example |
|--------|---------|---------|
| **Language** | Focus on specific programming language | `TypeScript`, `Python`, `Rust` |
| **File Extensions** | Analyze only certain file types | `.ts,.tsx` or `.py,.pyi` |
| **Updated After** | Only include recently modified files | `2024-01-01` (YYYY-MM-DD) |

**Example with Filters:**

```
Repository: https://github.com/vitejs/vite
Language: TypeScript
Extensions: .ts,.tsx
Updated After: 2024-01-01

Result: Infographic focuses on TypeScript source files
        updated in 2024, showing architecture and patterns
```

**What happens:**
- AI analyzes repository structure and documentation
- Key technologies, patterns, and statistics are identified
- Visual representation shows architecture, tech stack, and metrics

**Tips:**
- Popular repositories have more context available
- Use language filters for polyglot projects
- Date filters help focus on recent changes

### Markdown File Upload

**Best for:** Custom content, prepared research, structured data, reports

**How to use:**

1. Select the "File" tab
2. Click "Choose File" or drag-and-drop
3. Upload a `.md` (Markdown) file
4. Optionally, provide a title/context in the topic field

**Supported Markdown Features:**
- Headers (`# H1`, `## H2`, etc.)
- Lists (ordered and unordered)
- **Bold** and *italic* text
- Links and images (referenced in analysis)
- Code blocks
- Tables
- Blockquotes

**Example Markdown:**

```markdown
# Product Launch Q1 2025

## Goals
- Increase user base by 40%
- Launch mobile app (iOS and Android)
- Expand to 3 new markets

## Key Metrics
- Current users: 50,000
- Target users: 70,000
- Revenue goal: $500k

## Timeline
1. January: Beta testing
2. February: Public launch
3. March: Marketing campaign
```

**What happens:**
- AI analyzes your markdown content (primary source)
- No external web searches are performed
- Infographic visualizes your specific data

**Tips:**
- Structure content clearly with headers
- Include quantifiable data (numbers, percentages)
- Use lists for key points
- Keep file under 30KB for best results

---

## Customization Options

### Artistic Styles

InfoGraphix AI offers 23 distinct visual styles. Choose based on your audience and purpose:

#### Professional Styles

**Modern Minimalist**
- Clean lines, whitespace, contemporary feel
- Best for: Business presentations, tech documentation
- Palette recommendations: Professional Blue & White, Monochrome

**Corporate Professional**
- Clean, authoritative, business-appropriate
- Best for: Annual reports, investor presentations
- Palette recommendations: Professional Blue & White, Midnight Blue & Silver

**Futuristic / Sci-Fi**
- High-tech, neon accents, digital aesthetic
- Best for: Technology topics, innovation themes
- Palette recommendations: Dark Mode Neon, High Contrast Vibrant

#### Technical Styles

**Engineering Blueprint**
- Technical drawings, grid layouts, precision
- Best for: Architecture, engineering, system design
- Palette recommendations: Dark Mode Neon, Monochrome

**Isometric 3D**
- 3D perspective, depth, dimensional elements
- Best for: Process flows, system architecture
- Palette recommendations: Professional Blue & White, High Contrast Vibrant

**Data Viz**
- Focus on charts, graphs, statistical representation
- Best for: Analytics, research, statistics
- Palette recommendations: Professional Blue & White, High Contrast Vibrant

#### Artistic Styles

**Watercolor / Artistic**
- Soft colors, organic shapes, painterly
- Best for: Creative topics, nature, arts
- Palette recommendations: Soft Pastels, Warm Earth Tones

**Hand Drawn Sketch**
- Sketch-like, informal, approachable
- Best for: Educational content, casual presentations
- Palette recommendations: Monochrome, Warm Earth Tones

**Pop Art / Comic**
- Bold colors, halftone dots, comic style
- Best for: Entertainment, pop culture, marketing
- Palette recommendations: High Contrast Vibrant, Sunset Gradient

#### Retro & Vintage

**Vintage / Retro**
- Nostalgic, aged textures, classic typography
- Best for: Historical topics, throwback content
- Palette recommendations: Warm Earth Tones, Sunset Gradient

**Bauhaus / Geometric**
- Geometric shapes, primary colors, modernist
- Best for: Design history, architecture, art
- Palette recommendations: High Contrast Vibrant, Monochrome

**Art Deco / Luxury**
- Elegant, geometric, 1920s luxury aesthetic
- Best for: Premium products, luxury brands, history
- Palette recommendations: Midnight Blue & Silver, Monochrome

#### Modern Digital

**Cyberpunk / Glitch**
- Neon colors, glitch effects, digital noise
- Best for: Cybersecurity, gaming, futuristic tech
- Palette recommendations: Dark Mode Neon, Grayscale with Red Accents

**Vaporwave / Aesthetic**
- Pastel gradients, retro-futuristic, nostalgic
- Best for: Digital culture, aesthetics, nostalgia
- Palette recommendations: Soft Pastels, Sunset Gradient

**Glassmorphism / Frosted**
- Frosted glass, blur effects, translucent layers
- Best for: Modern UI/UX, technology, apps
- Palette recommendations: Soft Pastels, Professional Blue & White

#### Specialized

**Chalkboard / Educational**
- Hand-drawn on dark background, academic
- Best for: Education, tutorials, lesson plans
- Palette recommendations: Monochrome (inverted), Forest Deep Greens

**Paper Cutout / Craft**
- Layered paper, shadows, craft aesthetic
- Best for: DIY, crafts, playful content
- Palette recommendations: Soft Pastels, High Contrast Vibrant

**Pixel Art / 8-Bit**
- Retro gaming, blocky graphics, nostalgic
- Best for: Gaming, retro tech, nostalgia
- Palette recommendations: High Contrast Vibrant, Sunset Gradient

**Graffiti / Street Art**
- Urban art, spray paint, bold expression
- Best for: Urban culture, youth topics, activism
- Palette recommendations: High Contrast Vibrant, Grayscale with Red Accents

### Color Palettes

Choose a palette that matches your style and message:

#### Professional

**Professional Blue & White**
- Colors: Deep blues, crisp whites, gray accents
- Mood: Corporate, trustworthy, clean
- Best with: Modern Minimalist, Corporate, Isometric 3D
- Use for: Business, technology, professional content

**Monochrome**
- Colors: Black, white, shades of gray
- Mood: Timeless, sophisticated, classic
- Best with: Engineering Blueprint, Bauhaus, Hand Drawn
- Use for: Technical documentation, minimalist designs

**Midnight Blue & Silver**
- Colors: Deep navy, metallic silver, dark backgrounds
- Mood: Elegant, premium, sophisticated
- Best with: Art Deco, Corporate, Glassmorphism
- Use for: Luxury products, premium services

#### Vibrant & Energetic

**High Contrast Vibrant**
- Colors: Saturated primaries, bold contrasts
- Mood: Eye-catching, energetic, modern
- Best with: Pop Art, Cyberpunk, Pixel Art
- Use for: Marketing, entertainment, youth-focused

**Dark Mode Neon**
- Colors: Dark backgrounds, neon accents (blue, pink, green)
- Mood: Tech-forward, modern, edgy
- Best with: Cyberpunk, Futuristic, Engineering Blueprint
- Use for: Technology, gaming, digital culture

**Sunset Gradient**
- Colors: Orange to purple transitions, warm tones
- Mood: Warm, dynamic, inspiring
- Best with: Vaporwave, Watercolor, Vintage
- Use for: Creative projects, lifestyle, inspiration

#### Natural & Organic

**Warm Earth Tones**
- Colors: Browns, oranges, terracotta, beige
- Mood: Natural, organic, grounded
- Best with: Vintage, Hand Drawn, Watercolor
- Use for: Nature, sustainability, organic products

**Forest Deep Greens**
- Colors: Forest green, sage, olive, natural browns
- Mood: Calming, natural, eco-friendly
- Best with: Watercolor, Hand Drawn, Modern Minimalist
- Use for: Environmental topics, wellness, nature

#### Soft & Approachable

**Soft Pastels**
- Colors: Light pink, baby blue, mint, lavender
- Mood: Gentle, approachable, friendly
- Best with: Watercolor, Paper Cutout, Vaporwave
- Use for: Healthcare, education, family-friendly

**Grayscale with Red Accents**
- Colors: Grays with strategic red highlights
- Mood: Dramatic, focused, impactful
- Best with: Graffiti, Modern Minimalist, Corporate
- Use for: Important announcements, urgent topics

### Resolution and Aspect Ratio

#### Resolution Options

| Resolution | Pixel Width | Best For | File Size | Generation Time |
|------------|-------------|----------|-----------|-----------------|
| **1K** | 1024px | Web previews, thumbnails | 150-400 KB | ~15-20 seconds |
| **2K** | 2048px | Presentations, blog posts | 600-1200 KB | ~20-30 seconds |
| **4K** | 4096px | Prints, large displays | 2-5 MB | ~30-45 seconds |

**Recommendation:** Start with 2K for general use, upgrade to 4K only when needed for print or high-resolution displays.

#### Aspect Ratio Options

| Ratio | Dimensions (2K) | Best Use Cases |
|-------|-----------------|----------------|
| **1:1 Square** | 2048 x 2048 | Instagram posts, profile images, general social media |
| **16:9 Landscape** | 2048 x 1152 | Presentations, YouTube thumbnails, wide displays |
| **9:16 Portrait** | 1152 x 2048 | Mobile screens, Instagram/TikTok stories, vertical displays |
| **4:3 Standard Landscape** | 2048 x 1536 | Traditional presentations, PDF documents |
| **3:4 Standard Portrait** | 1536 x 2048 | Print materials, posters, flyers |

**Platform-Specific Recommendations:**

```
PowerPoint/Google Slides: 16:9 Landscape, 2K or 4K
Instagram Post: 1:1 Square, 2K
Instagram Story: 9:16 Portrait, 2K
Blog Header: 16:9 Landscape, 2K
Print Poster: 3:4 Portrait, 4K
LinkedIn Post: 1:1 Square or 4:3 Landscape, 2K
```

---

## Generation Process

### Analysis Phase

**What happens:**
1. Your input (topic, URL, GitHub repo, or file) is sent to Gemini 3 Pro
2. AI uses extended thinking mode (32K token budget) for deep analysis
3. For topics/URLs, Google Search grounding provides up-to-date information
4. AI extracts key facts, statistics, and relationships
5. A detailed visual plan is created based on your style and palette

**Duration:** Typically 5-15 seconds

**What you'll see:**
- "Analyzing topic..." message with pulsing brain icon
- Progress indicator

**Behind the scenes:**
```typescript
// Analysis request
{
  model: "gemini-3-pro-preview",
  thinkingBudget: 32768,  // Deep reasoning
  tools: [{googleSearch}], // Current information
  prompt: "Analyze [topic] and create visual plan for [style] infographic with [palette] colors"
}
```

### Image Generation Phase

**What happens:**
1. Visual plan from analysis is sent to Gemini 3 Pro Image Preview
2. AI generates PNG image matching your specifications
3. Image is returned as base64-encoded data
4. Result is displayed in the interface

**Duration:** Typically 10-30 seconds (longer for 4K)

**What you'll see:**
- "Generating infographic..." message with spinning image icon
- Progress indicator

**Behind the scenes:**
```typescript
// Generation request
{
  model: "gemini-3-pro-image-preview",
  visualPlan: "[Detailed description from analysis]",
  imageConfig: {
    size: "2K",
    aspectRatio: "16:9"
  }
}
```

### Understanding Results

After generation completes, you'll see:

1. **Generated Image**
   - High-resolution PNG infographic
   - Matches your selected style and palette
   - Incorporates key points from analysis

2. **Analysis Details** (expandable)
   - **Title**: AI-generated infographic title
   - **Summary**: Brief overview of the topic
   - **Key Points**: Main facts and statistics visualized
   - **Web Sources**: Citations (when Google Search grounding is used)

3. **Action Buttons**
   - Download: Save image as PNG file
   - Save to History: Add to version history
   - Regenerate: Create new variation with same settings
   - New Generation: Start fresh with new topic

**Quality Indicators:**

```
High Quality Results:
✓ Clear, readable text
✓ Well-organized layout
✓ Accurate colors matching palette
✓ Relevant icons and visuals
✓ Consistent style throughout

May Need Regeneration:
- Cluttered layout
- Text too small to read
- Colors don't match palette well
- Missing key information
```

---

## Managing Your Infographics

### Downloading Images

**To download a generated infographic:**

1. Generate your infographic
2. Click the "Download" button below the image
3. File is saved as `infographic-[timestamp].png`

**File Details:**
- Format: PNG (lossless)
- Color depth: 24-bit RGB
- Transparency: Not supported (solid backgrounds)
- Naming: `infographic-1702311234567.png` (Unix timestamp)

**Tips:**
- Rename downloaded files for better organization
- Consider folder structure: `infographics/[topic]/[date]/`
- Keep original filenames for tracking generation time

### Version History

The version history feature lets you save and revisit previous generations.

**To save a generation:**

1. After successful generation, click "Save to History"
2. Version is stored in browser localStorage
3. "Saved" indicator appears

**What's saved:**
- Generated image (base64 encoded)
- Topic and input type
- Style and palette selections
- Resolution and aspect ratio
- GitHub filters (if applicable)
- Analysis results
- Timestamp

**To load a saved version:**

1. Click the History icon in the sidebar
2. Browse your saved versions (newest first)
3. Click a version card to load it
4. All settings and results are restored

**To delete a version:**

1. Open version history sidebar
2. Click the trash icon on a version card
3. Confirm deletion

**Storage Limitations:**

```
Browser localStorage limits:
- Typical limit: 5-10 MB per domain
- Base64 images are ~33% larger than binary
- 4K images can be 3-7 MB each

Recommendations:
- Limit saved versions to ~20-30 (depending on resolution)
- Download important infographics to your device
- Clear old versions periodically
- Use 2K instead of 4K for saved versions
```

**Clear All History:**

1. Open version history sidebar
2. Click "Clear All" button
3. Confirm the action (cannot be undone)
4. All saved versions are permanently deleted

### Providing Feedback

Help improve InfoGraphix AI by providing feedback on generated infographics.

**To submit feedback:**

1. Generate an infographic
2. Click "Rate this Generation" (if available)
3. Select star rating (1-5)
4. Choose quality assessment
5. Optionally add comments
6. Submit

**Feedback is used for:**
- Understanding what styles work best
- Improving prompt engineering
- Identifying common issues
- Prioritizing feature development

---

## Best Practices

### Topic Selection Tips

**Be Specific and Descriptive**

```
Instead of: "Climate change"
Try: "Impact of climate change on polar ice caps from 1980 to 2024"

Instead of: "Programming languages"
Try: "Comparison of TypeScript, Rust, and Go for backend development"

Instead of: "History"
Try: "Timeline of major events in the Space Race (1955-1975)"
```

**Include Context and Scope**

```
Good: "React 19 new features: Actions, use() hook, and server components"
Bad: "React stuff"

Good: "How photosynthesis works: Light-dependent and light-independent reactions"
Bad: "Plants"
```

**Mention Desired Visualizations**

```
Examples:
- "Include a process flow diagram showing..."
- "Show a timeline from X to Y with major milestones"
- "Compare A vs B in a table or chart"
- "Display statistics as a bar chart"
```

**Quantify When Possible**

```
Include numbers:
✓ "Top 5 renewable energy sources by global capacity"
✓ "Evolution of smartphone specifications: 2010, 2015, 2020, 2025"
✓ "Marketing funnel: 10,000 visitors → 1,000 leads → 100 customers"
```

### Style and Palette Matching

**Match Style to Content:**

| Content Type | Recommended Styles |
|--------------|-------------------|
| Business/Corporate | Modern Minimalist, Corporate Professional, Data Viz |
| Technology | Futuristic, Cyberpunk, Engineering Blueprint, Isometric 3D |
| Education | Chalkboard, Hand Drawn, Modern Minimalist |
| Creative/Arts | Watercolor, Pop Art, Vaporwave, Art Deco |
| Historical | Vintage, Bauhaus, Art Deco |
| Environmental | Watercolor, Hand Drawn, Modern Minimalist |
| Gaming/Digital Culture | Cyberpunk, Pixel Art, Vaporwave, Graffiti |

**Match Palette to Mood:**

| Desired Mood | Recommended Palettes |
|--------------|---------------------|
| Professional, Trustworthy | Professional Blue & White, Monochrome |
| Energetic, Modern | High Contrast Vibrant, Dark Mode Neon |
| Calm, Natural | Forest Deep Greens, Warm Earth Tones, Soft Pastels |
| Premium, Elegant | Midnight Blue & Silver, Monochrome |
| Creative, Warm | Sunset Gradient, Soft Pastels |
| Dramatic, Focused | Grayscale with Red Accents, Dark Mode Neon |

**Combination Examples:**

```
Tech Startup Pitch:
Style: Futuristic / Sci-Fi
Palette: Dark Mode Neon
Ratio: 16:9 Landscape (presentation)

Educational Science Poster:
Style: Hand Drawn Sketch
Palette: Soft Pastels
Ratio: 3:4 Portrait (print)

Environmental Report:
Style: Watercolor / Artistic
Palette: Forest Deep Greens
Ratio: 4:3 Standard Landscape (PDF)

Retro Gaming Article:
Style: Pixel Art / 8-Bit
Palette: High Contrast Vibrant
Ratio: 1:1 Square (social media)
```

### Optimizing for Quality

**Resolution Selection Strategy:**

1. **Start with 2K**
   - Good quality for most uses
   - Faster generation
   - Smaller file size

2. **Upgrade to 4K when:**
   - Printing physical materials
   - Large display screens (>32")
   - Need to zoom into details
   - Professional presentations

3. **Use 1K for:**
   - Quick previews
   - Testing style combinations
   - Web thumbnails only

**Regeneration Strategy:**

If first result isn't perfect:

```
Try These Adjustments:

1. Same topic, different style
   - Some styles work better for certain content
   - Try 2-3 styles to find the best fit

2. More specific topic
   - Add details about what to emphasize
   - Specify desired visualization types

3. Different palette
   - Some palettes render more clearly
   - High contrast palettes often more readable

4. Simplify complex topics
   - Break into multiple infographics
   - Focus on one aspect at a time
```

**Text Readability:**

```
For maximum readability:
✓ Use high-contrast palettes (Professional Blue, Monochrome)
✓ Choose clean styles (Modern Minimalist, Corporate)
✓ Prefer landscape or square ratios
✓ Use 2K or 4K resolution
✓ Avoid overly decorative styles for text-heavy content
```

---

## Troubleshooting

**Generation takes too long:**
- Normal duration: 15-45 seconds
- 4K images take longer than 1K/2K
- If over 60 seconds, check your internet connection
- Try refreshing and regenerating

**Image quality is poor:**
- Increase resolution (1K → 2K → 4K)
- Try a different style (some render more clearly)
- Use high-contrast palettes
- Simplify the topic (too much info can clutter)

**Colors don't match selected palette:**
- Regenerate (AI interpretation varies)
- Try a more distinctive palette
- Specify colors in topic (e.g., "use blue and white")

**Text is too small to read:**
- Increase resolution
- Use landscape or square ratio (more width)
- Simplify topic (fewer key points = larger text)
- Try Data Viz or Modern Minimalist styles

**API errors:**
- See [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed error solutions
- Common issues: API key, rate limits, billing

**Version history is full:**
- localStorage has ~5-10 MB limit
- Delete old versions
- Download important infographics
- Clear all history to start fresh

**For more help:**
- Check [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Review [docs/FAQ.md](FAQ.md)
- Open an issue on [GitHub](https://github.com/doublegate/InfoGraphix-GenAI/issues)

---

**Ready to create stunning infographics? [Get started now!](#getting-started)**
