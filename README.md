# InfoGraphix AI

> Transform any topic into stunning, AI-generated infographics using Google Gemini

[![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)](CHANGELOG.md)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-3_Pro-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Overview

InfoGraphix AI is a web application that generates high-quality infographic images from topics, URLs, or GitHub repositories. Powered by Google's Gemini AI, it uses a sophisticated two-phase pipeline:

1. **Analysis Phase** - Gemini 3 Pro with thinking mode deeply researches your topic using Google Search grounding
2. **Generation Phase** - Nano Banana Pro creates stunning visual infographics in up to 4K resolution

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

### User Experience

- **Version History** - Save and revisit previous generations
- **Auto-Save Drafts** - Never lose your form input
- **Download Support** - Save generated infographics as PNG
- **Feedback System** - Rate and comment on generations

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
├── App.tsx                      # Main application orchestrator
├── index.tsx                    # React entry point
├── types.ts                     # TypeScript enums and interfaces
├── services/
│   └── geminiService.ts         # Gemini API integration
├── components/
│   ├── AboutModal.tsx           # Application information modal
│   ├── ApiKeySelector.tsx       # AI Studio key management
│   ├── ErrorBoundary.tsx        # Error handling wrapper
│   ├── FeedbackForm.tsx         # User feedback collection
│   ├── InfographicForm.tsx      # User input form
│   ├── InfographicResult.tsx    # Generated output display
│   ├── ProcessingState.tsx      # Loading indicators
│   ├── RichSelect.tsx           # Custom dropdown component
│   ├── VersionComparison.tsx    # Version comparison view
│   └── VersionHistory.tsx       # Saved generations browser
├── docs/                        # Technical documentation
└── to-dos/                      # Development roadmaps
```

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
| v1.3.0 | Foundation | Current | Core generation, 22 styles, 10 palettes, version history |
| v1.4.0 | Productivity Enhancement | Q1 2026 | Batch generation, custom templates, SVG/PDF export |
| v1.5.0 | Collaboration & Sharing | Q2 2026 | User accounts, cloud sync, team workspaces |
| v1.6.0 | AI Intelligence & Creativity | Q3 2026 | AI suggestions, template library, animations |
| v1.7.0 | Platform & API | Q4 2026 | REST API, Python/JS SDKs, webhooks |
| v1.8.0 | Ecosystem Integrations | Q1 2027 | Google Workspace, Notion, Figma, Slack |
| v1.9.0 | Enterprise & Advanced | Q2 2027 | SSO/SAML, RBAC, admin dashboard |
| v2.0.0 | Stable Release | Q3 2027 | Performance optimization, UI/UX polish |

### Upcoming Features by Theme

**v1.4.0 - Productivity (Q1 2026):**
- Batch generation mode (up to 50 topics)
- Custom style template system
- Enhanced version history with search and filtering
- Export to SVG, PDF, and multi-resolution formats

**v1.5.0 - Collaboration (Q2 2026):**
- User accounts with OAuth2 authentication
- Cloud storage and cross-device sync
- Team workspaces with role-based permissions
- Post-generation canvas editor

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
| [React](https://react.dev/) | 19.2 | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 | Type safety |
| [Vite](https://vitejs.dev/) | 7.2 | Build tool and dev server |
| [TailwindCSS](https://tailwindcss.com/) | v4.1 (build-time) | Utility-first styling |
| [Lucide React](https://lucide.dev/) | 0.554 | Icon library |
| [@google/genai](https://www.npmjs.com/package/@google/genai) | 1.30 | Gemini API SDK |

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

For security concerns, please review our [Security Policy](SECURITY.md).

**Important:**
- Never commit API keys or secrets
- Use `.env.local` for local development (gitignored)
- Report vulnerabilities via the security policy

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

---

<p align="center">
  <strong>InfoGraphix AI</strong> - Transform knowledge into visual stories
  <br>
  <a href="https://github.com/doublegate/InfoGraphix-GenAI">GitHub</a> |
  <a href="docs/ARCHITECTURE.md">Docs</a> |
  <a href="to-dos/FEATURE-ROADMAP.md">Roadmap</a>
</p>
