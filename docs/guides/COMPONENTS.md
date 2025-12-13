# Component Documentation

This document provides detailed documentation for all React components in InfoGraphix AI.

## Component Hierarchy

```
App.tsx
├── ApiKeySelector
├── InfographicForm
│   └── RichSelect (x2)
├── ProcessingState
├── InfographicResult
├── VersionHistory
├── FeedbackForm
└── AboutModal
```

## App.tsx

The main application component that orchestrates all state and child components.

### State Management

```typescript
// Processing flow
const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
const [generatedImage, setGeneratedImage] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);

// Form state
const [topic, setTopic] = useState<string>('');
const [inputType, setInputType] = useState<InputType>('topic');
const [selectedStyle, setSelectedStyle] = useState<InfographicStyle>(InfographicStyle.Modern);
const [selectedPalette, setSelectedPalette] = useState<ColorPalette>(ColorPalette.Professional);
const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.Resolution_2K);
const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Landscape);

// GitHub filters
const [githubLanguage, setGithubLanguage] = useState<string>('');
const [githubExtensions, setGithubExtensions] = useState<string>('');
const [githubDateRange, setGithubDateRange] = useState<{ start: string; end: string }>();

// File upload
const [uploadedFileContent, setUploadedFileContent] = useState<string | null>(null);

// Version history
const [savedVersions, setSavedVersions] = useState<SavedVersion[]>([]);

// UI state
const [showApiKeySelector, setShowApiKeySelector] = useState<boolean>(false);
const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
const [showFeedback, setShowFeedback] = useState<boolean>(false);
```

### Key Functions

```typescript
// Main generation handler
const handleGenerate = async () => {
  setProcessingStep('analyzing');
  setError(null);

  try {
    const analysis = await analyzeTopic(topic, inputType, options);
    setAnalysisResult(analysis);

    setProcessingStep('generating');
    const image = await generateInfographicImage(analysis.visualPlan, settings);
    setGeneratedImage(image);

    setProcessingStep('complete');
  } catch (err) {
    setError(err.message);
    setProcessingStep('idle');
  }
};

// Save to version history
const handleSaveVersion = () => {
  const version: SavedVersion = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    topic,
    inputType,
    style: selectedStyle,
    palette: selectedPalette,
    size: imageSize,
    aspectRatio,
    analysisResult,
    imageDataUrl: generatedImage
  };
  setSavedVersions(prev => [version, ...prev]);
};

// Load from version history
const handleLoadVersion = (version: SavedVersion) => {
  setTopic(version.topic);
  setInputType(version.inputType);
  setSelectedStyle(version.style);
  setSelectedPalette(version.palette);
  setImageSize(version.size);
  setAspectRatio(version.aspectRatio);
  setAnalysisResult(version.analysisResult);
  setGeneratedImage(version.imageDataUrl);
  setProcessingStep('complete');
};
```

---

## ApiKeySelector

Modal component for selecting Google AI Studio API key.

### Props

```typescript
interface ApiKeySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySelected: () => void;
}
```

### Usage

```tsx
<ApiKeySelector
  isOpen={showApiKeySelector}
  onClose={() => setShowApiKeySelector(false)}
  onKeySelected={handleApiKeySelected}
/>
```

### Behavior

- Displays when API key is not configured
- Calls `window.aistudio.openSelectKey()` when button clicked
- Closes automatically when key is selected

---

## InfographicForm

Main input form for configuring and triggering infographic generation.

### Props

```typescript
interface InfographicFormProps {
  // Input state
  topic: string;
  onTopicChange: (value: string) => void;
  inputType: InputType;
  onInputTypeChange: (type: InputType) => void;

  // Style settings
  selectedStyle: InfographicStyle;
  onStyleChange: (style: InfographicStyle) => void;
  selectedPalette: ColorPalette;
  onPaletteChange: (palette: ColorPalette) => void;

  // Output settings
  imageSize: ImageSize;
  onImageSizeChange: (size: ImageSize) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;

  // GitHub filters
  githubLanguage: string;
  onGithubLanguageChange: (lang: string) => void;
  githubExtensions: string;
  onGithubExtensionsChange: (ext: string) => void;
  githubDateRange?: { start: string; end: string };
  onGithubDateRangeChange: (range: { start: string; end: string }) => void;

  // File upload
  onFileUpload: (content: string) => void;

  // Actions
  onGenerate: () => void;
  isGenerating: boolean;
}
```

### Features

- **Input Type Selector**: Toggle between topic, URL, GitHub, and file upload
- **Dynamic Form Fields**: Shows/hides fields based on input type
- **Style Previews**: RichSelect dropdowns with visual style previews
- **Validation**: Disables generate button when required fields empty
- **Auto-Save**: Saves form state to localStorage on changes

---

## RichSelect

Custom dropdown component with image/icon previews for each option.

### Props

```typescript
interface RichSelectOption {
  value: string;
  label: string;
  description?: string;
  preview?: string;  // Image URL or icon name
}

interface RichSelectProps {
  options: RichSelectOption[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
}
```

### Usage

```tsx
<RichSelect
  label="Style"
  options={styleOptions}
  value={selectedStyle}
  onChange={setSelectedStyle}
  placeholder="Select a style..."
/>
```

### Features

- Visual previews for each option
- Keyboard navigation (arrow keys, enter, escape)
- Click outside to close
- Descriptions for each option

---

## ProcessingState

Loading indicator component shown during generation phases.

### Props

```typescript
interface ProcessingStateProps {
  step: ProcessingStep;  // 'analyzing' | 'generating'
}
```

### Usage

```tsx
{processingStep !== 'idle' && processingStep !== 'complete' && (
  <ProcessingState step={processingStep} />
)}
```

### Display

| Step | Message | Animation |
|------|---------|-----------|
| `analyzing` | "Analyzing topic..." | Pulsing brain icon |
| `generating` | "Generating infographic..." | Spinning image icon |

---

## InfographicResult

Displays the generated infographic with download and save options.

### Props

```typescript
interface InfographicResultProps {
  imageDataUrl: string;
  analysisResult: AnalysisResult;
  onSave: () => void;
  onRegenerate: () => void;
  onNewGeneration: () => void;
}
```

### Features

- **Image Display**: Full-size generated infographic
- **Download Button**: Saves image as PNG file
- **Save to History**: Adds to version history
- **Analysis Details**: Collapsible section showing:
  - Title
  - Summary
  - Key points
  - Web sources (if available)
- **Action Buttons**:
  - Regenerate (same settings, new image)
  - New Generation (reset form)

### Download Implementation

```typescript
const handleDownload = () => {
  const link = document.createElement('a');
  link.href = imageDataUrl;
  link.download = `infographic-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```

---

## VersionHistory

Sidebar component displaying saved infographic generations.

### Props

```typescript
interface VersionHistoryProps {
  versions: SavedVersion[];
  onLoad: (version: SavedVersion) => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}
```

### Features

- **Collapsible Sidebar**: Toggle visibility
- **Version Cards**: Thumbnail, title, timestamp, settings
- **Actions per Version**:
  - Load: Restore to main view
  - Delete: Remove from history
- **Empty State**: Message when no versions saved

### Storage

Versions are persisted to localStorage:
```typescript
const STORAGE_KEY = 'infographix_versions';

// Save
localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));

// Load
const stored = localStorage.getItem(STORAGE_KEY);
const versions = stored ? JSON.parse(stored) : [];
```

---

## FeedbackForm

User feedback collection component.

### Props

```typescript
interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: FeedbackData) => void;
  generationId?: string;
}

interface FeedbackData {
  rating: number;        // 1-5 stars
  quality: string;       // 'poor' | 'fair' | 'good' | 'excellent'
  comments: string;
  wouldRecommend: boolean;
}
```

### Features

- **Star Rating**: 1-5 star visual rating
- **Quality Dropdown**: Subjective quality assessment
- **Comments**: Free-text feedback
- **Recommendation**: Boolean "would recommend" toggle

---

## AboutModal

Information modal about the application.

### Props

```typescript
interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

### Content

- Application name and version
- Brief description
- Technology stack
- Credits and acknowledgments
- Links to documentation and repository

---

## Styling Conventions

### TailwindCSS Classes

All components use TailwindCSS via CDN. Common patterns:

```tsx
// Container
<div className="max-w-4xl mx-auto p-4">

// Card
<div className="bg-white rounded-lg shadow-md p-6">

// Button (primary)
<button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">

// Button (secondary)
<button className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">

// Input
<input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">

// Select
<select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
```

### Icon Usage

Icons from Lucide React:

```tsx
import { Loader2, Image, Download, Save, Trash2, Settings } from 'lucide-react';

// Spinner
<Loader2 className="w-5 h-5 animate-spin" />

// Standard icon
<Download className="w-4 h-4" />

// Icon with text
<button>
  <Save className="w-4 h-4 mr-2" />
  Save
</button>
```
