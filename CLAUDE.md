# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InfoGraphix AI is a React-based web application that generates infographic images from topics, URLs, or GitHub repositories using Google's Gemini AI APIs. Built for deployment in Google AI Studio, it uses a two-phase AI pipeline: topic analysis followed by image generation.

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Build for production
npm run preview      # Preview production build
```

## Environment Setup

Set `GEMINI_API_KEY` in `.env.local` for local development. The key requires a paid tier Google Cloud project with billing enabled.

## Architecture

### AI Pipeline (Two-Phase Generation)

1. **Analysis Phase** (`src/services/geminiService.ts:analyzeTopic`)
   - Model: `gemini-3-pro-preview` with thinking mode (32K budget)
   - Uses Google Search grounding for up-to-date information
   - Outputs: title, summary, keyPoints, visualPlan (image prompt), webSources

2. **Image Generation Phase** (`src/services/geminiService.ts:generateInfographicImage`)
   - Model: `gemini-3-pro-image-preview` (Nano Banana Pro)
   - Supports 1K/2K/4K resolution and multiple aspect ratios
   - Returns base64-encoded image data

### State Management

All state lives in `src/App.tsx` using React hooks. Key state flows:
- `processingStep`: 'idle' | 'analyzing' | 'generating' | 'complete'
- `savedVersions`: Persisted to localStorage as `infographix_versions`
- Form drafts auto-save to localStorage as `infographix_form_draft`

### Component Structure

```
src/
  App.tsx                    # Main orchestrator with all state
  index.tsx                  # React entry point
  types.ts                   # TypeScript type definitions
  components/
    ApiKeySelector.tsx       # AI Studio API key selection modal
    InfographicForm.tsx      # Input form with style/palette selectors
    InfographicResult.tsx    # Generated image display and download
    ProcessingState.tsx      # Loading indicators during generation
    VersionHistory.tsx       # Saved generations browser
    RichSelect.tsx           # Custom dropdown with previews
    FeedbackForm.tsx         # User rating/feedback
    AboutModal.tsx           # App info modal
  services/
    geminiService.ts         # Gemini API integration
  hooks/
  utils/
  styles/
```

### Type Definitions (`src/types.ts`)

Key enums control generation parameters:
- `ImageSize`: Resolution_1K, Resolution_2K, Resolution_4K
- `AspectRatio`: Square, Landscape, Portrait, StandardLandscape, StandardPortrait
- `InfographicStyle`: 22 artistic styles (Modern, Cyberpunk, Bauhaus, etc.)
- `ColorPalette`: 10 color schemes

### AI Studio Integration

The app integrates with Google AI Studio via `window.aistudio`:
- `hasSelectedApiKey()`: Check if API key is set
- `openSelectKey()`: Open key selection dialog

For local development without AI Studio, the app falls back to `process.env.API_KEY`.

## Tech Stack

- React 19 with TypeScript
- Vite 6 for bundling
- TailwindCSS (via CDN in index.html)
- Lucide React for icons
- `@google/genai` SDK for Gemini APIs

## Key Implementation Details

- Images are stored as base64 data URLs (can cause localStorage quota issues with saved versions)
- Form supports markdown file upload for custom content analysis
- GitHub filters (language, extensions, date) are passed to analysis prompts
- Error handling maps Gemini API errors (403, 429, 503) to user-friendly messages
