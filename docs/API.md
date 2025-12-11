# API Documentation

This document covers the Gemini AI API integration and internal service interfaces.

## Gemini API Integration

### SDK Setup

```typescript
import { GoogleGenAI } from '@google/genai';

// Initialize with API key
const ai = new GoogleGenAI({ apiKey: 'YOUR_API_KEY' });
```

### Models Used

| Model | Purpose | Capabilities |
|-------|---------|--------------|
| `gemini-3-pro-preview` | Topic Analysis | Extended thinking, Google Search grounding |
| `gemini-3-pro-image-preview` | Image Generation | PNG output, multiple resolutions |

## Service Interface

### `geminiService.ts`

Location: `services/geminiService.ts`

#### `analyzeTopic()`

Analyzes a topic and generates a visual plan for the infographic.

```typescript
async function analyzeTopic(
  topic: string,
  inputType: InputType,
  options?: AnalysisOptions
): Promise<AnalysisResult>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `topic` | `string` | Topic text, URL, or GitHub repo URL |
| `inputType` | `InputType` | One of: `'topic'`, `'url'`, `'github'`, `'file'` |
| `options` | `AnalysisOptions` | Optional configuration |

**AnalysisOptions:**

```typescript
interface AnalysisOptions {
  // GitHub-specific filters
  githubFilters?: {
    language?: string;      // Filter by programming language
    extensions?: string[];  // Filter by file extensions
    dateRange?: {
      start?: Date;
      end?: Date;
    };
  };
  // File upload content
  fileContent?: string;     // Markdown file content
}
```

**Response:**

```typescript
interface AnalysisResult {
  title: string;
  summary: string;
  keyPoints: string[];
  visualPlan: string;
  webSources?: WebSource[];
}

interface WebSource {
  title: string;
  url: string;
  snippet?: string;
}
```

**Example:**

```typescript
const result = await analyzeTopic(
  'https://github.com/user/repo',
  'github',
  {
    githubFilters: {
      language: 'TypeScript',
      extensions: ['.ts', '.tsx']
    }
  }
);

console.log(result.title);      // "Repository Analysis: user/repo"
console.log(result.keyPoints);  // ["Key finding 1", "Key finding 2", ...]
console.log(result.visualPlan); // Detailed prompt for image generation
```

#### `generateInfographicImage()`

Generates an infographic image based on analysis results and style settings.

```typescript
async function generateInfographicImage(
  visualPlan: string,
  settings: GenerationSettings
): Promise<string>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `visualPlan` | `string` | Visual plan from analysis phase |
| `settings` | `GenerationSettings` | Style and output configuration |

**GenerationSettings:**

```typescript
interface GenerationSettings {
  style: InfographicStyle;
  palette: ColorPalette;
  size: ImageSize;
  aspectRatio: AspectRatio;
}
```

**Response:**

Returns a base64-encoded PNG image as a data URL string:
```
data:image/png;base64,iVBORw0KGgo...
```

**Example:**

```typescript
const imageDataUrl = await generateInfographicImage(
  analysisResult.visualPlan,
  {
    style: InfographicStyle.Modern,
    palette: ColorPalette.Professional,
    size: ImageSize.Resolution_2K,
    aspectRatio: AspectRatio.Landscape
  }
);

// Use in img element
<img src={imageDataUrl} alt="Generated Infographic" />
```

## Type Definitions

### Enums

```typescript
// types.ts

enum InputType {
  Topic = 'topic',
  URL = 'url',
  GitHub = 'github',
  File = 'file'
}

enum ImageSize {
  Resolution_1K = '1K',
  Resolution_2K = '2K',
  Resolution_4K = '4K'
}

enum AspectRatio {
  Square = '1:1',
  Landscape = '16:9',
  Portrait = '9:16',
  StandardLandscape = '4:3',
  StandardPortrait = '3:4'
}

enum InfographicStyle {
  Modern = 'modern',
  Minimalist = 'minimalist',
  Corporate = 'corporate',
  Tech = 'tech',
  Nature = 'nature',
  Vintage = 'vintage',
  HandDrawn = 'hand-drawn',
  Geometric = 'geometric',
  Gradient = 'gradient',
  FlatDesign = 'flat-design',
  Isometric = 'isometric',
  Cyberpunk = 'cyberpunk',
  RetroFuturistic = 'retro-futuristic',
  Watercolor = 'watercolor',
  PaperCut = 'paper-cut',
  NeonGlow = 'neon-glow',
  Blueprint = 'blueprint',
  Chalkboard = 'chalkboard',
  Magazine = 'magazine',
  Bauhaus = 'bauhaus',
  ArtDeco = 'art-deco',
  DataViz = 'data-viz'
}

enum ColorPalette {
  Professional = 'professional',
  Vibrant = 'vibrant',
  EarthTones = 'earth-tones',
  Ocean = 'ocean',
  Sunset = 'sunset',
  Monochrome = 'monochrome',
  Pastel = 'pastel',
  BoldContrast = 'bold-contrast',
  Forest = 'forest',
  WarmNeutrals = 'warm-neutrals'
}
```

### Interfaces

```typescript
// Saved version for history
interface SavedVersion {
  id: string;
  timestamp: number;
  topic: string;
  inputType: InputType;
  style: InfographicStyle;
  palette: ColorPalette;
  size: ImageSize;
  aspectRatio: AspectRatio;
  analysisResult: AnalysisResult;
  imageDataUrl: string;
}

// Processing state
type ProcessingStep = 'idle' | 'analyzing' | 'generating' | 'complete';
```

## Error Handling

### Error Types

```typescript
class GeminiApiError extends Error {
  constructor(
    message: string,
    public code: number,
    public type: 'permission' | 'rate_limit' | 'unavailable' | 'unknown'
  ) {
    super(message);
  }
}
```

### Error Codes

| Code | Type | Description | Recovery |
|------|------|-------------|----------|
| 403 | `permission` | Invalid API key or insufficient permissions | Check API key, ensure billing enabled |
| 429 | `rate_limit` | Too many requests | Wait and retry, implement exponential backoff |
| 503 | `unavailable` | Service temporarily unavailable | Retry after delay |
| 500 | `unknown` | Server error | Retry, contact support if persistent |

### Error Handling Example

```typescript
try {
  const result = await analyzeTopic(topic, inputType);
} catch (error) {
  if (error instanceof GeminiApiError) {
    switch (error.type) {
      case 'permission':
        // Prompt user to check API key
        break;
      case 'rate_limit':
        // Show rate limit message, suggest waiting
        break;
      case 'unavailable':
        // Show service unavailable message
        break;
      default:
        // Generic error handling
    }
  }
}
```

## Google AI Studio API

When running in Google AI Studio, the application uses the `window.aistudio` interface.

### Interface Definition

```typescript
interface AIStudioAPI {
  hasSelectedApiKey(): boolean;
  openSelectKey(): void;
}

declare global {
  interface Window {
    aistudio?: AIStudioAPI;
  }
}
```

### Usage

```typescript
// Check if running in AI Studio
const inAIStudio = typeof window.aistudio !== 'undefined';

// Check if API key is selected
if (window.aistudio?.hasSelectedApiKey()) {
  // Proceed with API calls
} else {
  // Prompt user to select key
  window.aistudio?.openSelectKey();
}
```

## Rate Limits and Quotas

### Gemini API Limits

| Tier | Requests/Minute | Tokens/Minute |
|------|-----------------|---------------|
| Free | 2 | 32,000 |
| Pay-as-you-go | 60 | 1,000,000 |

### Best Practices

1. **Implement request queuing** - Don't fire multiple requests simultaneously
2. **Cache analysis results** - Reuse analysis for regeneration with different styles
3. **Show progress indicators** - Generation takes 15-45 seconds typically
4. **Handle errors gracefully** - Provide clear user feedback on failures
