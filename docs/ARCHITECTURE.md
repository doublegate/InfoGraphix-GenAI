# Architecture

This document describes the technical architecture of InfoGraphix AI.

## System Overview

InfoGraphix AI is a client-side React application that interfaces with Google's Gemini AI APIs to generate infographic images. The application runs entirely in the browser with no backend server required.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser Client                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   App.tsx   │  │  Components │  │    Services             │  │
│  │   (State)   │──│   (UI)      │──│  (geminiService.ts)     │  │
│  └─────────────┘  └─────────────┘  └───────────┬─────────────┘  │
│                                                 │               │
│  ┌─────────────────────────────────────────────┴─────────────┐  │
│  │                    localStorage                           │  │
│  │  • infographix_versions (saved generations)               │  │
│  │  • infographix_form_draft (form auto-save)                │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Google Gemini AI APIs                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐  ┌──────────────────────────────┐  │
│  │  Gemini 3 Pro Preview   │  │  Gemini 3 Pro Image Preview  │  │
│  │  (gemini-3-pro-preview) │  │  (gemini-3-pro-image-preview)│  │
│  │                         │  │                              │  │
│  │  • Topic Analysis       │  │  • Image Generation          │  │
│  │  • Thinking Mode (32K)  │  │  • 1K/2K/4K Resolution       │  │
│  │  • Google Search Ground │  │  • Multiple Aspect Ratios    │  │
│  └─────────────────────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Two-Phase AI Pipeline

### Phase 1: Topic Analysis

The analysis phase uses `gemini-3-pro-preview` with extended thinking capabilities.

**Configuration:**
- Model: `gemini-3-pro-preview`
- Thinking Budget: 32,768 tokens
- Google Search Grounding: Enabled (for current information)

**Input Processing:**
1. Topic text (direct input)
2. URL content (web page analysis)
3. GitHub repository (with optional filters)
4. Markdown file content

**Output Structure:**
```typescript
interface AnalysisResult {
  title: string;           // Infographic title
  summary: string;         // Brief topic summary
  keyPoints: string[];     // Main points to visualize
  visualPlan: string;      // Detailed image generation prompt
  webSources?: WebSource[];// Grounding sources (when available)
}
```

### Phase 2: Image Generation

The generation phase uses `gemini-3-pro-image-preview` (Nano Banana Pro).

**Configuration:**
- Model: `gemini-3-pro-image-preview`
- Response MIME Type: `image/png`

**Resolution Options:**
| Size | Dimensions (Landscape 16:9) |
|------|----------------------------|
| 1K   | 1024 x 576                 |
| 2K   | 2048 x 1152                |
| 4K   | 4096 x 2304                |

**Aspect Ratios:**
| Ratio | Name | Use Case |
|-------|------|----------|
| 1:1 | Square | Social media posts |
| 16:9 | Landscape | Presentations, wide displays |
| 9:16 | Portrait | Mobile, stories |
| 4:3 | Standard Landscape | Traditional documents |
| 3:4 | Standard Portrait | Print materials |

## State Management

All application state is managed in `App.tsx` using React hooks. No external state management library is used.

### Primary State Variables

```typescript
// Generation flow
const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
const [generatedImage, setGeneratedImage] = useState<string | null>(null);

// Form state
const [topic, setTopic] = useState<string>('');
const [inputType, setInputType] = useState<InputType>('topic');
const [selectedStyle, setSelectedStyle] = useState<InfographicStyle>();
const [selectedPalette, setSelectedPalette] = useState<ColorPalette>();
const [imageSize, setImageSize] = useState<ImageSize>();
const [aspectRatio, setAspectRatio] = useState<AspectRatio>();

// Persistence
const [savedVersions, setSavedVersions] = useState<SavedVersion[]>([]);
```

### Processing Steps

```
idle → analyzing → generating → complete
  ↑                              │
  └──────────────────────────────┘
```

## Data Flow

### Generation Flow

```
1. User Input
   │
   ├─► Topic Text
   ├─► URL
   ├─► GitHub Repo URL + Filters
   └─► Markdown File Upload
           │
           ▼
2. Analysis Phase (geminiService.analyzeTopic)
   │
   ├─► Construct analysis prompt
   ├─► Call Gemini 3 Pro with thinking mode
   ├─► Parse JSON response
   └─► Extract visualPlan for next phase
           │
           ▼
3. Generation Phase (geminiService.generateInfographicImage)
   │
   ├─► Combine visualPlan + style + palette + settings
   ├─► Call Gemini 3 Pro Image Preview
   └─► Receive base64-encoded PNG
           │
           ▼
4. Display & Storage
   │
   ├─► Display in InfographicResult component
   ├─► Enable download functionality
   └─► Optionally save to version history
```

### Persistence Flow

```
Form State ──────► localStorage (infographix_form_draft)
                   │
                   ├─► Auto-save on change
                   └─► Restore on page load

Saved Versions ──► localStorage (infographix_versions)
                   │
                   ├─► Save after successful generation
                   ├─► Load history on mount
                   └─► Delete individual versions
```

## Component Architecture

```
App.tsx (Main Orchestrator)
├── ApiKeySelector.tsx
│   └── Modal for Google AI Studio API key selection
│
├── InfographicForm.tsx
│   ├── Input type selector (topic/url/github/file)
│   ├── Topic/URL input field
│   ├── GitHub filters (when applicable)
│   ├── RichSelect.tsx (style dropdown)
│   ├── RichSelect.tsx (palette dropdown)
│   ├── Resolution selector
│   └── Aspect ratio selector
│
├── ProcessingState.tsx
│   └── Loading indicators for analysis/generation phases
│
├── InfographicResult.tsx
│   ├── Generated image display
│   ├── Download button
│   ├── Save to history button
│   └── Analysis details (title, summary, key points)
│
├── VersionHistory.tsx
│   └── List of saved generations with restore/delete
│
├── FeedbackForm.tsx
│   └── User rating and feedback collection
│
└── AboutModal.tsx
    └── Application information and credits
```

## API Integration

### Google AI Studio Integration

When running in Google AI Studio:

```typescript
// Check for AI Studio environment
if (window.aistudio?.hasSelectedApiKey()) {
  // Use AI Studio's key management
} else {
  // Prompt user to select API key
  window.aistudio.openSelectKey();
}
```

### Local Development

For local development without AI Studio:

```typescript
// .env.local
GEMINI_API_KEY=your_api_key_here

// Usage
const apiKey = process.env.API_KEY;
```

### SDK Usage

```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey });

// Analysis
const analysisResponse = await ai.models.generateContent({
  model: 'gemini-3-pro-preview',
  contents: [{ role: 'user', parts: [{ text: prompt }] }],
  config: {
    thinkingConfig: { thinkingBudget: 32768 },
    tools: [{ googleSearch: {} }]
  }
});

// Image Generation
const imageResponse = await ai.models.generateContent({
  model: 'gemini-3-pro-image-preview',
  contents: [{ role: 'user', parts: [{ text: imagePrompt }] }],
  config: {
    responseMimeType: 'image/png'
  }
});
```

## Error Handling

### API Error Mapping

| HTTP Code | Error Type | User Message |
|-----------|------------|--------------|
| 403 | Permission Denied | API key invalid or lacks permissions |
| 429 | Rate Limited | Too many requests, please wait |
| 503 | Service Unavailable | Gemini API temporarily unavailable |
| Other | Generic Error | Generation failed, please try again |

### Error Recovery

- Form state auto-saves to prevent data loss on errors
- Processing can be retried without re-entering data
- Version history persists independently of generation state

## Performance Considerations

### Image Storage

Generated images are stored as base64 data URLs. This can cause localStorage quota issues with many saved versions. Consider:

- Limiting saved version count
- Implementing image compression
- Using IndexedDB for larger storage needs

### API Latency

- Analysis phase: 5-15 seconds (depends on thinking complexity)
- Generation phase: 10-30 seconds (depends on resolution)
- Total typical generation: 15-45 seconds

### Bundle Size

- React 19: ~40KB gzipped
- @google/genai SDK: ~15KB gzipped
- Lucide icons: Tree-shaken, ~2KB per icon used
- TailwindCSS: CDN-loaded, not in bundle
