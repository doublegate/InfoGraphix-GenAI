# Contributing to InfoGraphix AI

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm (comes with Node.js)
- Google Gemini API key (paid tier for full functionality)
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/InfoGraphix-GenAI.git
   cd InfoGraphix-GenAI
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/doublegate/InfoGraphix-GenAI.git
   ```

---

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment file:
   ```bash
   echo "GEMINI_API_KEY=your_api_key_here" > .env.local
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000

### Project Structure

```
InfoGraphix-GenAI/
├── App.tsx                 # Main application component
├── index.tsx               # React entry point
├── types.ts                # TypeScript definitions
├── services/
│   └── geminiService.ts    # Gemini API integration
├── components/             # React components
├── docs/                   # Documentation
└── to-dos/                 # Project roadmap
```

---

## Code Style

### TypeScript

- Use TypeScript for all new code
- Define explicit types for parameters and return values
- Use interfaces for object shapes
- Avoid `any` type

### React

- Use functional components with hooks
- Keep components focused and single-purpose
- Use meaningful component names

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `InfographicForm` |
| Functions | camelCase | `handleGenerate` |
| Constants | UPPER_SNAKE_CASE | `STORAGE_KEY` |
| Types | PascalCase | `GeneratedInfographic` |

### Formatting

- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Max line length: 100 characters

---

## Pull Request Process

### Before Submitting

1. Sync with upstream:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. Ensure code follows style guidelines

3. Test your changes thoroughly

4. Update documentation if needed

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(form): add markdown file upload
fix(api): handle rate limit errors
docs(readme): update installation guide
```

### PR Requirements

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated (if applicable)
- [ ] No console errors or warnings
- [ ] PR description explains changes

---

## Reporting Issues

### Bug Reports

Include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable

### Feature Requests

Include:
- Clear description
- Use case and motivation
- Proposed implementation (optional)
- Alternatives considered

---

## Questions?

Feel free to open a GitHub Discussion or comment on related issues.

Thank you for contributing!
