# Changelog

All notable changes to InfoGraphix AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.7.0] - 2025-12-12

### Theme: Technical Debt Remediation - Sprint 1

*Code quality improvements, developer experience enhancements, and production-ready infrastructure.*

### Added
- **Logger Utility** (`src/utils/logger.ts`)
  - Environment-aware logging (DEBUG in development, INFO in production)
  - Multiple log levels: debug, info, warn, error
  - Performance timing with `log.time()` and `log.timeEnd()`
  - Grouped logging with `log.group()` and `log.groupEnd()`
  - Replaced 53 console statements across 16 files

- **Loading States**
  - Version deletion loading state in VersionHistory.tsx with spinner
  - File upload processing indicator in InfographicForm.tsx
  - Initial data load spinner in App.tsx
  - Disabled buttons during async operations
  - Visual feedback for all user-triggered async actions

- **CI/CD Pipeline** (`.github/workflows/ci.yml`)
  - ESLint code quality check job
  - TypeScript type checking job
  - Security audit job (npm audit --audit-level=moderate)
  - Production build verification
  - Bundle size analysis with warnings for files >500KB
  - Build artifact verification
  - CI status badge in README.md

- **Error Tracking Integration Documentation**
  - Comprehensive Sentry integration guide (`docs/ERROR-TRACKING.md`)
  - Error tracking service stub (`src/services/errorTrackingService.ts`)
  - ErrorBoundary.tsx updated with Sentry placeholders
  - Instructions for LogRocket, Rollbar, and Bugsnag alternatives
  - Privacy and security best practices
  - Cost optimization strategies for free tiers

### Changed
- **Callback Parameters Refactored**
  - `handleGenerate()` in App.tsx now accepts `InfographicRequest` object
  - `onSubmit()` in InfographicForm.tsx uses object parameter (7 params → 1 object)
  - Improved type safety and readability
  - Extended `InfographicRequest` interface with style, palette, fileContent fields

- **TypeScript Improvements**
  - All `any` types replaced with proper types
  - Strict mode enabled in tsconfig.json
  - Zero TypeScript errors in production build

- **ESLint Configuration**
  - Added `@typescript-eslint/no-unused-vars` rule with proper ignores
  - Configured to detect unused imports and variables
  - Added `lint:fix` script for automatic fixes

### Fixed
- Inconsistent console logging replaced with structured logger
- Missing loading states causing poor UX during async operations
- No CI/CD pipeline for automated quality checks
- Undocumented error tracking integration process

### Technical Debt Resolved
- ✅ TD-002: Enable TypeScript strict mode
- ✅ TD-004: Create logger utility
- ✅ TD-005: Document API security model in README
- ✅ TD-008: Add missing loading states
- ✅ TD-010: Refactor callback parameters to object format
- ✅ TD-011: Document error tracking integration steps
- ✅ TD-012: Set up CI/CD with GitHub Actions
- ✅ TD-013: Fix all `any` types with proper types
- ✅ TD-014: Update outdated dependencies
- ✅ TD-022: Add error boundaries for lazy components
- ✅ TD-033: Configure ESLint for unused imports detection
- ✅ TD-034: Create environment variable validation utility

### Sprint 1 Progress
- **Completed:** 12/12 tasks (100%)
- **Categories:** Foundation (3), Code Quality (5), Testing & CI (2), Documentation (2)
- **Files Modified:** 20+
- **Lines of Code Changed:** 500+
- **Build Status:** ✅ Zero errors, 3.88s build time

### Developer Experience
- Structured logging improves debugging efficiency
- Type safety reduces runtime errors
- CI/CD catches issues before merge
- Clear error tracking integration path
- Comprehensive documentation updates

### Performance
- No performance impact from logger utility (conditional compilation)
- Loading states improve perceived performance
- CI pipeline optimized with aggressive caching

### Documentation
- New: `docs/ERROR-TRACKING.md` - Error tracking integration guide
- Updated: README.md - CI badge, version bump
- Updated: SECURITY.md - Latest version reference
- Updated: TECHNICAL-DEBT.md - Sprint 1 completion

---

## [1.6.0] - 2025-12-12

### Theme: AI Intelligence & Creativity

*Intelligent design assistance powered by AI, advanced color customization, and expanded template library.*

### Added
- **AI Design Suggestions (Beta)**
  - Intelligent style and palette recommendations powered by Gemini 3 Pro
  - Topic-aware analysis with Google Search grounding for up-to-date context
  - Three style suggestions with detailed reasoning
  - Three color palette suggestions with confidence scores
  - One-click application of AI recommendations
  - Collapsible UI panel integrated into InfographicForm
  - Custom hook `useStyleSuggestions` for state management

- **Custom Palette Generator**
  - Client-side color extraction from uploaded images using Vibrant.js
  - Multiple color scheme generation algorithms:
    - Complementary (opposite hue)
    - Triadic (120° spaced hues)
    - Analogous (adjacent hues)
    - Split-Complementary (base + 2 adjacent to complement)
    - Tetradic (double complementary)
  - WCAG accessibility checking (AA and AAA standards)
  - Visual color swatches with hex codes
  - Save custom palettes to localStorage
  - Drag-and-drop image upload support
  - Real-time color preview with accessibility indicators

- **Enhanced Template Library**
  - Expanded from 10 to 55 professional templates
  - Organized into 10 categories:
    - Business & Professional (8 templates)
    - Technology & Innovation (7 templates)
    - Education & Learning (5 templates)
    - Creative & Artistic (7 templates)
    - Data & Analytics (6 templates)
    - Social Media (5 templates)
    - Marketing & Branding (5 templates)
    - Science & Research (4 templates)
    - Health & Wellness (3 templates)
    - Entertainment & Gaming (5 templates)
  - Category-based filtering for easy discovery
  - Template metadata includes tags for improved search

### Added (Technical)
- **Color Extraction Service** (`services/colorExtractionService.ts`)
  - 565 lines of color theory algorithms
  - RGB/Hex/HSL color space conversions
  - Contrast ratio calculations
  - Accessible text color generation
  - Custom palette management with localStorage

- **New Components**
  - `StyleSuggestions.tsx` - AI suggestion display and application
  - `PaletteGenerator.tsx` - Image upload and color extraction UI
  - `hooks/useStyleSuggestions.ts` - Custom hook for AI suggestions

- **Dependencies**
  - `node-vibrant@3.2.1` - Client-side color extraction

### Changed
- **Template Service** (`services/templateService.ts`)
  - Added `TEMPLATE_CATEGORIES` constant (10 categories)
  - Added `getTemplatesByCategory()` - Filter templates by category
  - Added `getTemplateCategory()` - Get primary category for template
  - Added `getTemplateCounts()` - Count templates per category
  - `getDefaultTemplates()` now returns 55 templates (up from 10)

- **InfographicForm Component**
  - Integrated AI Design Suggestions panel (collapsible)
  - Integrated Custom Palette Generator panel (collapsible)
  - Improved UX with organized feature sections

- **Type Definitions** (`types.ts`)
  - Added `StyleSuggestionItem` interface
  - Added `PaletteSuggestionItem` interface
  - Added `StyleSuggestion` interface
  - Added `ColorScheme` interface
  - Added `LayoutVariant` enum (for future use)

### Technical
- All features are client-side compatible (no backend required)
- AI suggestions use Gemini 3 Pro with thinking mode (32K token budget)
- Color extraction runs entirely in browser (privacy-preserving)
- Custom palettes stored in localStorage as `infographix_custom_palettes`
- Template count increased from 10 to 55 (+450%)

### Performance
- Color extraction optimized for images up to 10MB
- AI suggestions cached in component state
- Template loading from localStorage remains fast (<10ms)

### Notes
- Animation support deferred to future release (Gemini API limitation)
- Layout variants partially implemented (types defined, UI pending)
- Data visualization templates defined in library, CSV import deferred
- Community features deferred (requires backend infrastructure)

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
