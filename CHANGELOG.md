# Changelog

All notable changes to InfoGraphix AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.4.6] - 2025-12-12

### Added
- **SECURITY.md** - Comprehensive security documentation
  - API key security model documentation (client-side design for AI Studio)
  - Client-side architecture explanation and rationale
  - Data handling and privacy information (localStorage usage)
  - Production deployment considerations and backend proxy recommendations
  - Vulnerability reporting guidelines and response timeline
  - Security best practices for users and developers

### Changed
- **README.md** - Enhanced security section with links to comprehensive documentation
- **Project Structure Documentation** - Updated version references to v1.4.6
  - package.json
  - src/metadata.json
  - src/components/AboutModal.tsx
  - src/utils/exportUtils.ts

### Technical
- Security policy aligned with client-side architecture design
- Documented intentional design choices for Google AI Studio deployment
- Added production deployment security guidelines

---

## [1.4.5] - 2025-12-12

### Fixed
- **React Hooks Violations**
  - BatchManager.tsx: Moved early return after useEffect hook
  - TemplateBrowser.tsx: Moved early return after useEffect hook
  - VersionHistory.tsx: Moved early return after useMemo/useEffect hooks
  - Root cause: Components returned early before all hooks were called, violating React Rules of Hooks

- **Production Build Runtime Errors**
  - Fixed "forwardRef of undefined" error caused by aggressive chunk splitting
  - Simplified Vite manualChunks configuration to only split export-libs
  - Let Vite handle React/icons dependencies naturally for proper load order

- **TemplateBrowser Modal Rendering**
  - Modal now renders via `ReactDOM.createPortal()` at document.body level
  - Fixed modal being trapped inside InfographicForm's CSS constraints
  - Both header and form "Browse Templates" buttons now behave identically

### Changed
- **Build Optimization**
  - Main chunk: 533.72 kB (gzip: 137.17 kB)
  - Export libs: 686.49 kB (lazy-loaded on demand)
  - BatchManager: 22.09 kB (lazy-loaded)
  - VersionHistory: 26.10 kB (lazy-loaded)
  - Increased chunk size warning limit to 700KB for export libraries

### Technical
- Added ReactDOM import to InfographicForm for portal usage
- Refined lazy loading strategy: only BatchManager and VersionHistory are lazy-loaded
- TemplateBrowser changed to static import (used by InfographicForm)
- Dynamic imports for export utilities to reduce initial load time

---

## [2.0.0] - 2027-09 (Planned)

### Theme: Stable Release

*Comprehensive performance optimization, UI/UX polish, and feature completeness. See `to-dos/version-plans/v2.0.0-PLAN.md` for details.*

### Added
- Comprehensive monitoring and observability stack
- In-app help system and knowledge base
- Visual regression testing suite
- Automated accessibility testing

### Changed
- 50% improvement in generation speed
- 70% reduction in API latency
- Complete UI/UX overhaul with design system
- Enhanced error handling with automatic recovery

### Documentation
- 50+ video tutorials
- Complete API reference documentation
- Interactive demos for key features
- Multi-language documentation (5 languages)

---

## [1.9.0] - 2027-06 (Planned)

### Theme: Enterprise & Advanced Features

*Enterprise-grade authentication, analytics, and brand management. See `to-dos/version-plans/v1.9.0-PLAN.md` for details.*

### Added
- SSO/SAML 2.0 authentication support
- Advanced RBAC with custom roles
- Admin dashboard with organization analytics
- Brand guidelines enforcement system
- Template governance with approval workflows
- Go SDK (github.com/infographix/infographix-go)
- Ruby SDK (infographix gem)
- Batch API endpoints for bulk operations

### Security
- SCIM provisioning support
- Audit logging for all administrative actions
- Permission-based access control at API level

---

## [1.8.0] - 2027-03 (Planned)

### Theme: Ecosystem Integrations

*Deep integration with productivity tools and platforms. See `to-dos/version-plans/v1.8.0-PLAN.md` for details.*

### Added
- Google Workspace Add-on (Slides, Docs, Drive)
- Notion integration with page export
- Figma plugin for designers
- Slack bot with slash commands
- Discord bot for communities
- Zapier integration with 20+ Zap templates
- Make (Integromat) integration for advanced automation

### Integrations
- OAuth2 authentication for all integrations
- Webhook support for real-time notifications
- Marketplace listings for all platforms

---

## [1.7.0] - 2026-12 (Planned)

### Theme: Platform & API

*Comprehensive REST API and developer platform. See `to-dos/version-plans/v1.7.0-PLAN.md` for details.*

### Added
- REST API v1 with OpenAPI 3.0 specification
- Webhook system with delivery tracking
- JavaScript/TypeScript SDK (@infographix/sdk)
- Python SDK (infographix on PyPI)
- API Playground for interactive testing
- Developer Portal with usage analytics
- Rate limiting and quota management

### API
- Complete API coverage for all features
- Authentication via API keys
- Comprehensive error responses
- CORS configuration for web apps

---

## [1.6.0] - 2026-09 (Planned)

### Theme: AI Intelligence & Creativity

*AI-powered suggestions, templates, and animation. See `to-dos/version-plans/v1.6.0-PLAN.md` for details.*

### Added
- AI-powered style and palette suggestions
- Smart palette generator from images/logos
- Comprehensive template library (100+ templates)
- Animation support with GIF/MP4 export
- Layout optimization engine
- Data visualization templates with CSV import
- Presentation mode for live presentations

### AI Features
- Topic categorization and analysis
- Automatic color palette matching
- Layout optimization suggestions
- Learning from user preferences

---

## [1.5.0] - 2025-12-12

### Theme: Accessibility & Global Reach

*Comprehensive keyboard navigation, screen reader support, internationalization, and visual accessibility features.*

### Added
- **Keyboard Shortcuts System**
  - 10 application-wide keyboard shortcuts for power users
  - Cross-platform support (Mac ⌘ vs Windows Ctrl detection)
  - Keyboard shortcuts modal (Shift+?) showing all available shortcuts
  - Shortcuts: Generate (Ctrl+Enter), Save (Ctrl+S), Download (Ctrl+D), New (Ctrl+N)
  - Navigation shortcuts: History (Ctrl+H), Templates (Ctrl+T), Batch (Ctrl+B)
  - Accessibility shortcut: High Contrast (Ctrl+Shift+C)
  - Help (Shift+?) and Escape to close modals

- **Accessibility Improvements (WCAG 2.1 AA Compliance)**
  - Skip-to-content link for keyboard navigation
  - Screen reader announcement system with ARIA live regions
  - Comprehensive ARIA labels on all interactive elements
  - Focus management for modal dialogs
  - Semantic HTML structure with proper landmarks
  - Keyboard navigation support throughout application
  - Screen reader announcements for processing states and actions

- **Internationalization (i18n)**
  - react-i18next integration with browser language detection
  - English (en) and Spanish (es) translation support
  - Language selector component in navigation bar
  - 200+ UI strings translated across all components
  - Persistent language preference in localStorage
  - Fallback to English for unsupported languages

- **High Contrast Mode**
  - System preference detection (prefers-contrast media query)
  - Manual toggle with keyboard shortcut (Ctrl+Shift+C)
  - Enhanced border visibility and focus indicators
  - Increased color contrast ratios for text and UI elements
  - Persistent preference stored in localStorage
  - Reduced motion support (prefers-reduced-motion media query)

### Changed
- App.tsx enhanced with accessibility hooks and keyboard event handling
- All components updated with translation function (t()) calls
- Navigation bar includes language selector and high contrast toggle
- Processing state changes now announced to screen readers
- Main CSS enhanced with accessibility utilities (sr-only, focus-ring)

### Technical
- Added react-i18next (v16.4.1) for internationalization
- Added i18next (v25.7.2) and i18next-browser-languagedetector (v8.2.0)
- New hooks: useKeyboardShortcuts, useAnnouncer, useHighContrast
- New components: KeyboardShortcutsModal, SkipLink, LanguageSelector
- New utilities: keyboardShortcuts.ts for shortcut registry
- New stylesheets: high-contrast.css for contrast mode
- i18n configuration with language detection and fallback

### Documentation
- Version references updated to v1.5.0 across all files
- CHANGELOG.md updated with comprehensive v1.5.0 release notes

---

## [1.4.6] - 2025-12-12

### Added
- **SECURITY.md** - Comprehensive security documentation
  - API key security model documentation (client-side design for AI Studio)
  - Client-side architecture explanation and rationale
  - Data handling and privacy information (localStorage usage)
  - Production deployment considerations and backend proxy recommendations
  - Vulnerability reporting guidelines and response timeline
  - Security best practices for users and developers

### Changed
- **README.md** - Enhanced security section with links to comprehensive documentation
- **Project Structure Documentation** - Updated version references to v1.4.6
  - package.json
  - src/metadata.json
  - src/components/AboutModal.tsx
  - src/utils/exportUtils.ts

### Technical
- Security policy aligned with client-side architecture design
- Documented intentional design choices for Google AI Studio deployment
- Added production deployment security guidelines

---

## [1.4.5] - 2025-12-12

### Fixed
- **React Hooks Violations**
  - BatchManager.tsx: Moved early return after useEffect hook
  - TemplateBrowser.tsx: Moved early return after useEffect hook
  - VersionHistory.tsx: Moved early return after useMemo/useEffect hooks
  - Root cause: Components returned early before all hooks were called, violating React Rules of Hooks

- **Production Build Runtime Errors**
  - Fixed "forwardRef of undefined" error caused by aggressive chunk splitting
  - Simplified Vite manualChunks configuration to only split export-libs
  - Let Vite handle React/icons dependencies naturally for proper load order

- **TemplateBrowser Modal Rendering**
  - Modal now renders via `ReactDOM.createPortal()` at document.body level
  - Fixed modal being trapped inside InfographicForm's CSS constraints
  - Both header and form "Browse Templates" buttons now behave identically

### Changed
- **Build Optimization**
  - Main chunk: 533.72 kB (gzip: 137.17 kB)
  - Export libs: 686.49 kB (lazy-loaded on demand)
  - BatchManager: 22.09 kB (lazy-loaded)
  - VersionHistory: 26.10 kB (lazy-loaded)
  - Increased chunk size warning limit to 700KB for export libraries

### Technical
- Added ReactDOM import to InfographicForm for portal usage
- Refined lazy loading strategy: only BatchManager and VersionHistory are lazy-loaded
- TemplateBrowser changed to static import (used by InfographicForm)
- Dynamic imports for export utilities to reduce initial load time

---

## [1.4.0] - 2025-12-11

### Theme: Productivity Enhancement

*Batch processing, templates, and enhanced workflows for power users.*

### Added
- **Batch Generation System**
  - Queue-based batch processing (up to 50 topics per batch)
  - Queue management with pause/resume/retry capabilities
  - Progress tracking with visual status indicators
  - Batch export to ZIP with all completed infographics
  - Configuration presets for queue creation
  - LocalStorage persistence for queue state

- **Custom Template System**
  - Save and reuse style configurations
  - 10 pre-built default templates
  - Template CRUD operations (create, read, update, delete)
  - Import/export templates as JSON
  - Template search and filtering by name, description, and tags
  - Template duplication for quick variations
  - Reset to defaults option

- **Enhanced Version History**
  - Advanced filtering by size, aspect ratio, style, palette
  - Date range filtering
  - Full-text search across topics
  - Pagination (10/25/50/100 items per page)
  - Statistics panel showing total generations and breakdown by parameters
  - Sorting options for better organization

- **Export Format Options**
  - PNG export (default, lossless)
  - PDF export with metadata
  - SVG export (wrapped in SVG container)
  - Multi-resolution export (1K, 2K, 4K in single ZIP)
  - Export format selector in result view

- **Enhanced Gemini Service**
  - Multi-URL analysis for comparative infographics
  - Improved GitHub repository structure analysis
  - URL detection and specialized prompts
  - Enhanced error handling and retry logic

- **New UI Components**
  - BatchManager modal for queue management
  - TemplateBrowser modal for template selection
  - BatchQueueCreator for new queue creation
  - BatchQueueList for viewing all queues
  - BatchItemCard for individual batch item status
  - TemplateEditor for creating/editing templates
  - TemplateGrid for browsing templates
  - TemplateCard for template preview

### Changed
- App.tsx now supports both single and batch generation modes
- InfographicForm updated with template quick-apply and multi-URL input
- InfographicResult enhanced with export format selection
- Navigation bar reorganized with Templates and Batch buttons

### Technical
- Added jsPDF (v3.0.4) for PDF generation
- Added JSZip (v3.10.1) for ZIP archive creation
- Added @types/jspdf for TypeScript support
- New utility module: utils/exportUtils.ts
- New service modules: services/templateService.ts, services/batchService.ts
- Extended type definitions in types.ts for batch and template features

### Documentation
- Comprehensive user guide (docs/USER-GUIDE.md) with step-by-step instructions
- FAQ document (docs/FAQ.md) covering 60+ common questions across 10 categories
- Mermaid diagrams in ARCHITECTURE.md for system visualization
- Enhanced API documentation with real-world examples and sequence diagrams
- CONTRIBUTING.md with testing checklists and code style guidelines
- README.md updated with TailwindCSS v4 build-time reference

---

## [1.3.0] - 2025-12-11

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

[Unreleased]: https://github.com/doublegate/InfoGraphix-GenAI/compare/v1.4.6...HEAD
[2.0.0]: https://github.com/doublegate/InfoGraphix-GenAI/releases/tag/v2.0.0
[1.9.0]: https://github.com/doublegate/InfoGraphix-GenAI/releases/tag/v1.9.0
[1.8.0]: https://github.com/doublegate/InfoGraphix-GenAI/releases/tag/v1.8.0
[1.7.0]: https://github.com/doublegate/InfoGraphix-GenAI/releases/tag/v1.7.0
[1.6.0]: https://github.com/doublegate/InfoGraphix-GenAI/releases/tag/v1.6.0
[1.5.0]: https://github.com/doublegate/InfoGraphix-GenAI/releases/tag/v1.5.0
[1.4.6]: https://github.com/doublegate/InfoGraphix-GenAI/releases/tag/v1.4.6
[1.4.5]: https://github.com/doublegate/InfoGraphix-GenAI/releases/tag/v1.4.5
[1.4.0]: https://github.com/doublegate/InfoGraphix-GenAI/releases/tag/v1.4.0
[1.3.0]: https://github.com/doublegate/InfoGraphix-GenAI/releases/tag/v1.3.0
