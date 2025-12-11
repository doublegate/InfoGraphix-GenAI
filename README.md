# InfoGraphix AI

> Transform any topic into stunning, AI-generated infographics using Google Gemini

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
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

- **22 Artistic Styles** - Modern, Cyberpunk, Bauhaus, Art Deco, Steampunk, and more
- **10 Color Palettes** - Professional Blue, Dark Neon, Warm Earth, Pastel, and others
- **Multiple Resolutions** - 1K, 2K, or 4K output quality
- **Aspect Ratios** - Portrait, Landscape, Square, and standard formats

### Input Flexibility

- **URL Analysis** - Generate infographics from any web page or article
- **GitHub Repositories** - Visualize repository statistics and architecture
- **Custom Markdown** - Upload .md files for custom content analysis
- **GitHub Filters** - Filter by language, file extensions, or update date

### User Experience

- **Version History** - Save and revisit previous generations
- **Auto-Save Drafts** - Never lose your form input
- **Recent Topics** - Quick access to previous searches
- **Feedback System** - Rate and comment on generations

---

## Demo

<!-- Add screenshots or GIF demos here -->

```
[Screenshot placeholder - Add demo images to showcase the application]
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **Google Gemini API Key** with paid tier billing enabled

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/YOUR_USERNAME/InfoGraphix-GenAI.git
   cd InfoGraphix-GenAI
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure your API key:

   ```bash
   # Create .env.local file
   echo "GEMINI_API_KEY=your_api_key_here" > .env.local
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open <http://localhost:3000> in your browser

### Google AI Studio

This application is designed to run in [Google AI Studio](https://ai.google.dev/). When deployed there, API key selection is handled automatically via the `window.aistudio` interface.

---

## Usage

### Basic Generation

1. Enter a topic, URL, or GitHub repository name
2. Select your preferred artistic style
3. Choose a color palette
4. Set resolution and orientation
5. Click "Generate Infographic"

### Advanced Options

**GitHub Filters** (for code repositories):

- **Language** - Filter by programming language (e.g., "Python", "TypeScript")
- **File Extensions** - Focus on specific file types (e.g., ".py", ".tsx")
- **Updated After** - Only include recently updated content

**Markdown Upload**:

- Upload a `.md` file to use as the primary source material
- The AI will analyze your content instead of performing web searches

---

## Configuration

### Environment Variables

| Variable         | Description                | Required |
| ---------------- | -------------------------- | -------- |
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes      |

### Vite Configuration

The API key is injected at build time via `vite.config.ts`:

```typescript
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY)
}
```

---

## Architecture

```
InfoGraphix-GenAI/
├── App.tsx                 # Main application orchestrator
├── index.tsx               # React entry point
├── types.ts                # TypeScript enums and interfaces
├── services/
│   └── geminiService.ts    # Gemini API integration
└── components/
    ├── ApiKeySelector.tsx  # AI Studio key management
    ├── InfographicForm.tsx # User input form
    ├── InfographicResult.tsx # Generated output display
    ├── ProcessingState.tsx # Loading indicators
    ├── VersionHistory.tsx  # Saved generations
    └── ...                 # Additional UI components
```

### AI Pipeline

```
User Input
    │
    ▼
┌─────────────────────────────────┐
│  Gemini 3 Pro (Analysis)        │
│  - Thinking Mode (32K budget)   │
│  - Google Search Grounding      │
│  - JSON structured output       │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│  Nano Banana Pro (Image Gen)    │
│  - Visual plan from analysis    │
│  - Configurable resolution      │
│  - Base64 output                │
└─────────────────────────────────┘
    │
    ▼
Generated Infographic
```

---

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm install`     | Install dependencies                 |
| `npm run dev`     | Start development server (port 3000) |
| `npm run build`   | Build for production                 |
| `npm run preview` | Preview production build             |

---

## Tech Stack

| Technology                                                   | Purpose                   |
| ------------------------------------------------------------ | ------------------------- |
| [React 19](https://react.dev/)                               | UI framework              |
| [TypeScript 5.8](https://www.typescriptlang.org/)            | Type safety               |
| [Vite 6](https://vitejs.dev/)                                | Build tool and dev server |
| [TailwindCSS](https://tailwindcss.com/)                      | Utility-first styling     |
| [Lucide React](https://lucide.dev/)                          | Icon library              |
| [@google/genai](https://www.npmjs.com/package/@google/genai) | Gemini API SDK            |

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:

- Development setup
- Code style guidelines
- Pull request process
- Issue reporting

---

## Security

For security concerns, please review our [Security Policy](SECURITY.md). Never commit API keys or secrets to the repository.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Google Gemini](https://ai.google.dev/) - AI models powering analysis and generation
- [React Team](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tooling
- [TailwindCSS](https://tailwindcss.com/) - Styling framework
- [Lucide](https://lucide.dev/) - Beautiful icons

---

<p align="center">
  Built with AI by the InfoGraphix Team
</p>
