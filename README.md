# InfoGraphix AI

> Transform any topic into stunning, AI-generated infographics using Google Gemini

[![Version](https://img.shields.io/badge/version-1.5.0-blue.svg)](CHANGELOG.md)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-3_Pro-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Overview

InfoGraphix AI is a powerful web application that generates high-quality infographic images from topics, URLs, or GitHub repositories. Powered by Google's Gemini AI, it combines sophisticated AI analysis with extensive customization options and productivity features.

**Core Pipeline:**
1. **Analysis Phase** - Gemini 3 Pro with thinking mode deeply researches your topic using Google Search grounding
2. **Generation Phase** - Nano Banana Pro creates stunning visual infographics in up to 4K resolution

**Productivity Features:**
- Batch process up to 50 topics in a single queue
- Save and reuse custom style templates
- Export in multiple formats (PNG, PDF, SVG, ZIP)
- Advanced version history with search and filtering

**Latest Updates (v1.5.0):**
- Keyboard shortcuts system with 10 power user shortcuts (Ctrl+Enter, Ctrl+S, Shift+?, etc.)
- WCAG 2.1 AA accessibility compliance with screen reader support and ARIA labels
- Internationalization (i18n) with English and Spanish language support
- High contrast mode with system preference detection and manual toggle
- Screen reader announcements for all processing states and actions

---

## Features

### AI-Powered Generation

- **Deep Topic Analysis** - Leverages Gemini 3 Pro with 32K thinking budget for comprehensive research
- **Google Search Grounding** - Retrieves up-to-date information with source citations
- **Intelligent Visual Planning** - Automatically designs optimal infographic layouts

### Customization Options

- **22 Artistic Styles** - Modern, Cyberpunk, Bauhaus, Art Deco, Watercolor, Blueprint, and more
- **10 Color Palettes** - Professional, Vibrant, Earth Tones, Ocean, Sunset, Monochrome, and others
- **Multiple Resolutions** - 1K, 2K, or 4K output quality
- **Aspect Ratios** - Square (1:1), Landscape (16:9), Portrait (9:16), and standard formats

### Input Flexibility

- **Free-form Topics** - Enter any subject for AI research and visualization
- **URL Analysis** - Generate infographics from any web page or article
- **GitHub Repositories** - Visualize repository statistics and architecture
- **Custom Markdown** - Upload .md files for custom content analysis
- **GitHub Filters** - Filter by language, file extensions, or update date

### Productivity Features

- **Batch Generation** - Create up to 50 infographics in a single queue with progress tracking
- **Custom Templates** - Save and reuse your favorite style configurations
- **Enhanced Version History** - Advanced search, filters, and pagination for saved generations
- **Export Formats** - Download as PNG, PDF, SVG, or multi-resolution ZIP
- **Keyboard Shortcuts** - 10 power user shortcuts for all common actions
- **Auto-Save Drafts** - Never lose your form input
- **Feedback System** - Rate and comment on generations

### Accessibility & Internationalization

- **WCAG 2.1 AA Compliance** - Full keyboard navigation and screen reader support
- **Multi-Language Support** - English and Spanish with automatic browser detection
- **High Contrast Mode** - Enhanced visibility with system preference detection
- **Screen Reader Announcements** - ARIA live regions for processing states
- **Skip Navigation** - Jump to main content with keyboard shortcut

---

## Quick Start

### Prerequisites

- **Node.js** 18 or higher
- **Google Gemini API Key** with billing enabled ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/doublegate/InfoGraphix-GenAI.git
cd InfoGraphix-GenAI

# Install dependencies
npm install

# Configure your API key
cp .env.local.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Google AI Studio Deployment

This application is designed to run in [Google AI Studio](https://ai.google.dev/). When deployed there, API key selection is handled automatically via the `window.aistudio` interface.

---

## Usage

### Basic Generation

1. Enter a topic, URL, or GitHub repository name
2. Select your preferred artistic style
3. Choose a color palette
4. Set resolution and aspect ratio
5. Click "Generate Infographic"

### Advanced Options

**GitHub Repository Filters:**

| Filter | Description | Example |
|--------|-------------|---------|
| Language | Filter by programming language | `TypeScript`, `Python` |
| Extensions | Focus on specific file types | `.ts`, `.tsx`, `.py` |
| Updated After | Only include recent content | `2024-01-01` |

**Markdown Upload:**
Upload a `.md` file to use as the primary source material. The AI will analyze your content instead of performing web searches.

**Batch Generation:**
Create up to 50 infographics in a single queue. Enter multiple topics (one per line), configure shared settings, and let the system process them sequentially with progress tracking.

**Template Management:**
Save your favorite style configurations as reusable templates. The system includes 10 default templates, and you can create custom templates with names, descriptions, and tags.

**Export Options:**
Download generated infographics in multiple formats:
- PNG (default, lossless)
- PDF (with metadata)
- SVG (vector format)
- Multi-resolution ZIP (1K, 2K, 4K in one archive)

---

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |

See [.env.local.example](.env.local.example) for detailed configuration instructions.

### API Key Requirements

- Must be from a Google Cloud project with **billing enabled**
- Free tier: 2 requests/minute (limited)
- Paid tier: 60 requests/minute (recommended)

---

## Architecture

```
InfoGraphix-GenAI/
├── src/                         # Source code directory
│   ├── App.tsx                  # Main application orchestrator (534KB main chunk)
│   ├── index.tsx                # React entry point
│   ├── types.ts                 # TypeScript enums and interfaces
│   ├── services/
│   │   ├── geminiService.ts     # Gemini API integration
│   │   ├── batchService.ts      # Batch generation queue management
│   │   ├── templateService.ts   # Template CRUD operations (10 default templates)
│   │   └── storageService.ts    # LocalStorage abstraction
│   ├── components/
│   │   ├── AboutModal.tsx       # Application information modal
│   │   ├── ApiKeySelector.tsx   # AI Studio key management
│   │   ├── ErrorBoundary.tsx    # Error handling wrapper
│   │   ├── FeedbackForm.tsx     # User feedback collection
│   │   ├── InfographicForm.tsx  # User input form (uses React Portal for modals)
│   │   ├── InfographicResult.tsx# Generated output display (dynamic import for exports)
│   │   ├── ProcessingState.tsx  # Loading indicators
│   │   ├── RichSelect.tsx       # Custom dropdown component
│   │   ├── VersionComparison.tsx# Version comparison view
│   │   ├── VersionHistory.tsx   # Saved generations browser (lazy-loaded, 26KB)
│   │   ├── BatchGeneration/     # Batch processing components
│   │   │   ├── BatchManager.tsx # Main batch management modal (lazy-loaded, 22KB)
│   │   │   ├── BatchQueueCreator.tsx # Queue creation interface
│   │   │   ├── BatchQueueList.tsx    # List of all batch queues
│   │   │   ├── BatchQueueCard.tsx    # Individual queue display
│   │   │   └── BatchItemCard.tsx     # Batch item status card
│   │   └── TemplateManager/     # Template management components
│   │       ├── TemplateBrowser.tsx   # Template selection modal (React Portal)
│   │       ├── TemplateGrid.tsx      # Grid view of templates
│   │       ├── TemplateCard.tsx      # Individual template card
│   │       └── TemplateEditor.tsx    # Template creation/editing
│   ├── utils/
│   │   ├── exportUtils.ts       # Export format utilities (lazy-loaded, 686KB)
│   │   └── keyboardShortcuts.ts # Keyboard shortcut registry and utilities
│   ├── hooks/
│   │   ├── useKeyboardShortcuts.ts # Keyboard shortcut event handling
│   │   ├── useAnnouncer.ts      # Screen reader announcements
│   │   └── useHighContrast.ts   # High contrast mode management
│   ├── i18n/
│   │   ├── index.ts             # i18next configuration
│   │   ├── en.json              # English translations
│   │   └── es.json              # Spanish translations
│   └── styles/
│       ├── main.css             # Global styles with accessibility utilities
│       └── high-contrast.css    # High contrast mode styles
├── vite.config.ts               # Build configuration with code splitting
├── docs/                        # Technical documentation
└── to-dos/                      # Development roadmaps
```

### Technical Implementation

**Code Splitting & Lazy Loading:**
- Main application bundle: 533.72 kB (gzipped: 137.17 kB)
- Export libraries (jsPDF, JSZip): 686.49 kB (lazy-loaded on demand)
- BatchManager: 22.09 kB (lazy-loaded when accessed)
- VersionHistory: 26.10 kB (lazy-loaded when accessed)
- Dynamic imports for export utilities to reduce initial load time

**React Portal Usage:**
- TemplateBrowser modal renders via `ReactDOM.createPortal()` for proper full-screen overlay
- Escapes parent CSS constraints (relative positioning, max-width, overflow)
- Ensures consistent modal behavior from both header and form buttons

**State Management:**
- All application state in `src/App.tsx` using React hooks
- LocalStorage persistence for templates, versions, and form drafts
- Queue state management via `src/services/batchService.ts`

**Build Configuration:**
- Vite 7 with optimized chunk splitting
- 700KB chunk size warning limit for export libraries
- Proper dependency ordering for React and its dependents

### AI Pipeline

```
User Input (Topic/URL/GitHub/Markdown)
    │
    ▼
┌─────────────────────────────────────┐
│     Phase 1: Topic Analysis         │
│  ┌───────────────────────────────┐  │
│  │  Gemini 3 Pro Preview         │  │
│  │  - Thinking Mode (32K budget) │  │
│  │  - Google Search Grounding    │  │
│  │  - JSON structured output     │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│     Phase 2: Image Generation       │
│  ┌───────────────────────────────┐  │
│  │  Gemini 3 Pro Image Preview   │  │
│  │  (Nano Banana Pro)            │  │
│  │  - Visual plan execution      │  │
│  │  - 1K/2K/4K resolution        │  │
│  │  - Base64 PNG output          │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
    │
    ▼
Generated Infographic (PNG)
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [User Guide](docs/USER-GUIDE.md) | Complete step-by-step usage guide |
| [FAQ](docs/FAQ.md) | Frequently asked questions and answers |
| [Architecture](docs/ARCHITECTURE.md) | System design, data flow, state management |
| [API Reference](docs/API.md) | Gemini integration, service interfaces |
| [Components](docs/COMPONENTS.md) | React component documentation |
| [Deployment](docs/DEPLOYMENT.md) | AI Studio, Vercel, Docker deployment guides |
| [Styling](docs/STYLING.md) | TailwindCSS patterns, design system |
| [Troubleshooting](docs/TROUBLESHOOTING.md) | Common issues and solutions |

---

## Roadmap

InfoGraphix AI follows a structured development roadmap with quarterly releases through Q3 2027.

### Version Timeline

| Version | Theme | Target | Key Features |
|---------|-------|--------|--------------|
| v1.3.0 | Foundation | 2025-12-11 | Core generation, 22 styles, 10 palettes, version history |
| v1.4.0 | Productivity Enhancement | 2025-12-11 | Batch generation, custom templates, SVG/PDF export |
| v1.5.0 | Accessibility & Global Reach | 2025-12-12 (Current) | Keyboard shortcuts, i18n (EN/ES), WCAG 2.1 AA, high contrast |
| v1.6.0 | AI Intelligence & Creativity | Q3 2026 | AI suggestions, template library, animations |
| v1.7.0 | Platform & API | Q4 2026 | REST API, Python/JS SDKs, webhooks |
| v1.8.0 | Ecosystem Integrations | Q1 2027 | Google Workspace, Notion, Figma, Slack |
| v1.9.0 | Enterprise & Advanced | Q2 2027 | SSO/SAML, RBAC, admin dashboard |
| v2.0.0 | Stable Release | Q3 2027 | Performance optimization, UI/UX polish |

### Recent Updates

**v1.5.0 - Accessibility & Global Reach (2025-12-12):**
- Keyboard shortcuts system with 10 power user shortcuts (Ctrl+Enter to generate, Ctrl+S to save, Shift+? for help)
- Cross-platform keyboard support (Mac ⌘ vs Windows Ctrl detection)
- WCAG 2.1 AA accessibility compliance with comprehensive screen reader support
- Skip-to-content navigation link for keyboard users
- ARIA labels and live regions on all interactive elements
- Internationalization (i18n) with react-i18next integration
- English and Spanish language support with browser language detection
- Language selector component in navigation bar
- High contrast mode with system preference detection (prefers-contrast media query)
- Manual high contrast toggle with keyboard shortcut (Ctrl+Shift+C)
- Reduced motion support (prefers-reduced-motion media query)
- 200+ UI strings translated across all components
- New hooks: useKeyboardShortcuts, useAnnouncer, useHighContrast
- New components: KeyboardShortcutsModal, SkipLink, LanguageSelector
- Enhanced accessibility utilities in CSS (sr-only, focus-ring)

**v1.4.5 - Build Optimization & Bug Fixes (2025-12-11):**
- Fixed React Hooks violations in BatchManager, TemplateBrowser, and VersionHistory components
- Resolved "Rendered more hooks than during previous render" error
- Optimized production build with proper code splitting strategy
- Fixed TemplateBrowser modal rendering using React Portal for full-screen overlay
- Simplified Vite chunk splitting to prevent forwardRef errors
- Enhanced lazy loading: BatchManager (22KB), VersionHistory (26KB), export-libs (686KB)
- Build metrics: Main chunk 534KB, all lazy-loaded components load on demand

**v1.4.0 - Productivity Enhancement (2025-12-11):**
- Batch generation mode with queue management (up to 50 topics per batch)
- Custom template system with save/load/import/export (10 default templates)
- Enhanced version history with advanced filtering and pagination
- Export to PNG, PDF, SVG, and multi-resolution ZIP formats
- Multi-URL analysis for comparative infographics
- New components: BatchManager, TemplateBrowser, and supporting modules
- New services: batchService.ts, templateService.ts, storageService.ts
- New utilities: exportUtils.ts for format conversion

### Upcoming Features by Theme

**v1.6.0 - Intelligence (Q3 2026):**
- AI-powered style and palette suggestions
- Template library with 100+ pre-built templates
- Animation support with GIF/MP4 export
- Data visualization templates with CSV import

**v1.7.0 - Platform (Q4 2026):**
- REST API v1 with OpenAPI specification
- JavaScript/TypeScript and Python SDKs
- Webhook system with delivery tracking
- Developer portal with usage analytics

**v1.8.0 - Ecosystem (Q1 2027):**
- Google Workspace Add-on (Slides, Docs, Drive)
- Notion integration and Figma plugin
- Slack and Discord bots
- Zapier and Make automation support

**v1.9.0 - Enterprise (Q2 2027):**
- SSO/SAML 2.0 authentication
- Advanced RBAC with custom roles
- Admin dashboard with organization analytics
- Brand guidelines enforcement system

**v2.0.0 - Stable Release (Q3 2027):**
- 50% improvement in generation speed
- Comprehensive monitoring and observability
- Complete UI/UX overhaul with design system
- Multi-language documentation (5 languages)

See [FEATURE-ROADMAP.md](to-dos/FEATURE-ROADMAP.md) for complete details and [version-plans/](to-dos/version-plans/) for sprint-level breakdowns.

**Additional Resources:**
- [Technical Debt](to-dos/TECHNICAL-DEBT.md)
- [Documentation Tasks](to-dos/DOCUMENTATION-TASKS.md)
- [Integration Ideas](to-dos/INTEGRATION-IDEAS.md)

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [React](https://react.dev/) | 19.2.3 | UI framework with hooks and portals |
| [TypeScript](https://www.typescriptlang.org/) | 5.9.3 | Type safety and development tooling |
| [Vite](https://vitejs.dev/) | 7.2.7 | Build tool with optimized code splitting |
| [TailwindCSS](https://tailwindcss.com/) | 4.1.18 (build-time) | Utility-first styling framework |
| [Lucide React](https://lucide.dev/) | 0.560.0 | Icon library |
| [@google/genai](https://www.npmjs.com/package/@google/genai) | 1.30.0 | Gemini API SDK for AI integration |
| [react-i18next](https://react.i18next.com/) | 16.4.1 | React integration for i18next |
| [i18next](https://www.i18next.com/) | 25.7.2 | Internationalization framework |
| [i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector) | 8.2.0 | Browser language detection plugin |
| [jsPDF](https://www.npmjs.com/package/jspdf) | 3.0.4 | PDF generation (lazy-loaded) |
| [JSZip](https://www.npmjs.com/package/jszip) | 3.10.1 | ZIP archive creation (lazy-loaded) |

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:

- Development environment setup
- Code style guidelines
- Commit message conventions
- Pull request process
- Issue reporting

---

## Security

InfoGraphix AI uses a **client-side architecture** with intentional design choices for Google AI Studio deployment. Please review our comprehensive [Security Policy](SECURITY.md) for details on:

- **API Key Security Model** - Why client-side API keys are used (AI Studio integration)
- **Data Handling** - What data stays in your browser vs. what is sent to Google
- **Production Considerations** - How to deploy securely outside AI Studio
- **Vulnerability Reporting** - Responsible disclosure process

**Quick Security Guidelines:**
- Never commit API keys to version control
- Use `.env.local` for local development (gitignored)
- Export important infographics regularly (localStorage has quota limits)
- For public production deployments, implement a backend proxy (see SECURITY.md)

**Reporting Vulnerabilities:** See [SECURITY.md](SECURITY.md#vulnerability-reporting) for responsible disclosure process.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and release notes.

---

## Acknowledgments

- [Google Gemini](https://ai.google.dev/) - AI models powering analysis and generation
- [React Team](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tooling
- [TailwindCSS](https://tailwindcss.com/) - Styling framework
- [Lucide](https://lucide.dev/) - Icon library
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation library
- [JSZip](https://stuk.github.io/jszip/) - ZIP file creation

---

<p align="center">
  <strong>InfoGraphix AI</strong> - Transform knowledge into visual stories
  <br>
  <a href="https://github.com/doublegate/InfoGraphix-GenAI">GitHub</a> |
  <a href="docs/ARCHITECTURE.md">Docs</a> |
  <a href="to-dos/FEATURE-ROADMAP.md">Roadmap</a>
</p>
