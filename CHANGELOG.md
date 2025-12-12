# Changelog

All notable changes to InfoGraphix AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

## [1.5.0] - 2026-06 (Planned)

### Theme: Collaboration & Sharing

*User accounts, cloud storage, and team collaboration. See `to-dos/version-plans/v1.5.0-PLAN.md` for details.*

### Added
- User accounts with email/OAuth2 authentication
- Cloud storage with cross-device sync
- Sharing via public links and embed codes
- Team workspaces with role-based permissions
- Post-generation canvas editor
- Keyboard shortcuts for power users
- Accessibility improvements (WCAG 2.1 AA compliance)
- Internationalization support (5 languages)

### Collaboration
- Comment threads on infographics
- Activity feed for team workspaces
- Version control for collaborative edits
- Invitation system for team members

---

## [1.4.0] - 2025-12-11 (Current Release)

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

[Unreleased]: https://github.com/doublegate/InfoGraphix-GenAI/compare/v1.3.0...HEAD
[2.0.0]: https://github.com/doublegate/InfoGraphix-GenAI/releases/tag/v2.0.0
[1.9.0]: https://github.com/doublegate/InfoGraphix-GenAI/releases/tag/v1.9.0
[1.8.0]: https://github.com/doublegate/InfoGraphix-GenAI/releases/tag/v1.8.0
[1.7.0]: https://github.com/doublegate/InfoGraphix-GenAI/releases/tag/v1.7.0
[1.6.0]: https://github.com/doublegate/InfoGraphix-GenAI/releases/tag/v1.6.0
[1.5.0]: https://github.com/doublegate/InfoGraphix-GenAI/releases/tag/v1.5.0
[1.4.0]: https://github.com/doublegate/InfoGraphix-GenAI/releases/tag/v1.4.0
[1.3.0]: https://github.com/doublegate/InfoGraphix-GenAI/releases/tag/v1.3.0
