# Changelog

All notable changes to InfoGraphix AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive user guide (docs/USER-GUIDE.md) with step-by-step instructions for all features
- FAQ document (docs/FAQ.md) covering 60+ common questions across 10 categories
- Mermaid diagrams in ARCHITECTURE.md for system visualization
  - High-level system architecture diagram
  - Component hierarchy diagram
  - Component interaction flow sequence diagram
  - State architecture diagram
  - Processing step state machine
  - Complete data flow diagram
- Enhanced API documentation (docs/API.md) with:
  - Real-world examples for all API functions
  - Detailed error response formats with recovery steps
  - Four sequence diagrams (generation flow, authentication, error recovery, version history)
  - Resolution and dimension reference table
- Comprehensive CONTRIBUTING.md enhancements:
  - Manual testing checklist for contributors
  - Detailed code style guidelines with examples
  - Commit message templates and examples
  - PR review process documentation
  - Testing requirements section

### Changed
- README.md updated with TailwindCSS v4 build-time reference (was incorrectly listed as CDN)
- README.md documentation section now includes User Guide and FAQ links
- CONTRIBUTING.md code style section expanded with TypeScript, React, and formatting examples

### Planned
- Batch generation mode for multiple infographics
- Custom style template creation
- Export to additional formats (SVG, PDF)
- Generation history search and filtering
- Collaborative sharing features

## [0.1.0] - 2025-12-11

### Added
- Two-phase AI pipeline for infographic generation
  - Analysis phase using Gemini 3 Pro with thinking mode (32K budget)
  - Image generation using Gemini 3 Pro Image Preview (Nano Banana Pro)
- Google Search grounding for up-to-date topic information
- 22 distinct infographic styles
  - Modern, Minimalist, Corporate, Tech, Nature, Vintage
  - Hand-Drawn, Geometric, Gradient, Flat Design, Isometric
  - Cyberpunk, Retro-Futuristic, Watercolor, Paper-Cut
  - Neon-Glow, Blueprint, Chalkboard, Magazine, Bauhaus
  - Art-Deco, Data-Viz
- 10 color palette options
  - Professional, Vibrant, Earth Tones, Ocean, Sunset
  - Monochrome, Pastel, Bold Contrast, Forest, Warm Neutrals
- Multiple resolution support (1K, 2K, 4K)
- Multiple aspect ratio options
  - Square (1:1), Landscape (16:9), Portrait (9:16)
  - Standard Landscape (4:3), Standard Portrait (3:4)
- Input methods
  - Free-form topic entry
  - URL analysis with web scraping
  - GitHub repository analysis with filters (language, extensions, date range)
  - Markdown file upload for custom content
- Version history system with localStorage persistence
- Download functionality for generated infographics
- Google AI Studio integration via `window.aistudio` interface
- Fallback to environment variable API key for local development
- Real-time processing state indicators
- Form draft auto-save to localStorage
- User feedback collection system
- About modal with project information

### Technical
- React 19 with TypeScript
- Vite 6 build system with React plugin
- TailwindCSS via CDN for styling
- Lucide React for iconography
- @google/genai SDK for Gemini API integration
- Component-based architecture with clear separation of concerns

[Unreleased]: https://github.com/doublegate/InfoGraphix-GenAI/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/doublegate/InfoGraphix-GenAI/releases/tag/v0.1.0
