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

### TypeScript Guidelines

**Type Safety:**
```typescript
// ✓ Good: Explicit types
function analyzeTopic(
  topic: string,
  style: InfographicStyle,
  palette: ColorPalette
): Promise<AnalysisResult> {
  // ...
}

// ✗ Bad: Implicit any
function analyzeTopic(topic, style, palette) {
  // ...
}
```

**Interface Definitions:**
```typescript
// ✓ Good: Clear interface with documentation
interface GenerationSettings {
  /** Visual style for the infographic */
  style: InfographicStyle;
  /** Color palette to use */
  palette: ColorPalette;
  /** Output image resolution */
  size: ImageSize;
  /** Output image aspect ratio */
  aspectRatio: AspectRatio;
}

// ✗ Bad: No types or documentation
const settings = {
  style: 'modern',
  palette: 'blue',
  // ...
};
```

**Avoid `any` Type:**
```typescript
// ✓ Good: Use specific types
const handleError = (error: Error | GeminiApiError) => {
  console.error(error.message);
};

// ✗ Bad: Using any
const handleError = (error: any) => {
  console.error(error.message);
};

// If type is truly unknown, use `unknown` and narrow it:
const handleUnknown = (value: unknown) => {
  if (value instanceof Error) {
    console.error(value.message);
  }
};
```

### React Guidelines

**Functional Components with Hooks:**
```typescript
// ✓ Good: Functional component with TypeScript
interface InfographicFormProps {
  topic: string;
  onTopicChange: (value: string) => void;
  onGenerate: () => void;
}

export default function InfographicForm({
  topic,
  onTopicChange,
  onGenerate
}: InfographicFormProps) {
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setIsValid(topic.trim().length > 0);
  }, [topic]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onGenerate(); }}>
      {/* ... */}
    </form>
  );
}

// ✗ Bad: Class component (avoid for new code)
class InfographicForm extends React.Component {
  // ...
}
```

**Component Organization:**
```typescript
// ✓ Good: Focused, single-purpose component
function DownloadButton({ imageUrl, filename }: DownloadButtonProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button onClick={handleDownload}>
      <Download className="w-4 h-4" />
      Download
    </button>
  );
}

// ✗ Bad: Component doing too much
function ResultsPanel() {
  // Handles display, download, save, feedback, history...
  // 500+ lines of code
}
```

**State Management:**
```typescript
// ✓ Good: Descriptive state names, proper initialization
const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
const [error, setError] = useState<string | null>(null);
const [savedVersions, setSavedVersions] = useState<SavedVersion[]>([]);

// ✗ Bad: Vague names, improper types
const [step, setStep] = useState('');
const [err, setErr] = useState();
const [versions, setVersions] = useState();
```

### Naming Conventions

| Type | Convention | Example | Notes |
|------|------------|---------|-------|
| **Components** | PascalCase | `InfographicForm`, `ApiKeySelector` | Matches file name |
| **Functions** | camelCase | `handleGenerate`, `analyzeTopic` | Verb-based names |
| **Constants** | UPPER_SNAKE_CASE | `STORAGE_KEY`, `MAX_VERSIONS` | Module-level only |
| **Types/Interfaces** | PascalCase | `GeneratedInfographic`, `AnalysisResult` | Descriptive names |
| **Enums** | PascalCase (name)<br>PascalCase (values) | `enum ImageSize { Resolution_1K }` | Prefix values if needed |
| **Props Interfaces** | PascalCase + `Props` | `InfographicFormProps` | Component name + Props |
| **Event Handlers** | `handle` + `Event` | `handleClick`, `handleGenerate` | Clear action names |
| **Boolean Variables** | `is/has/should` + description | `isLoading`, `hasError`, `shouldRetry` | Question form |

### Formatting Rules

**Indentation and Spacing:**
```typescript
// ✓ Good: 2 spaces, consistent spacing
function generateInfographic(
  topic: string,
  settings: GenerationSettings
): Promise<string> {
  if (!topic) {
    throw new Error('Topic is required');
  }

  return callApi(topic, settings);
}

// ✗ Bad: Inconsistent indentation/spacing
function generateInfographic(topic:string,settings:GenerationSettings):Promise<string>{
if(!topic){throw new Error('Topic is required');}
return callApi(topic,settings);}
```

**String Quotes:**
```typescript
// ✓ Good: Single quotes for strings
const message = 'Generation complete';
const template = `Hello, ${name}!`;  // Template literals use backticks

// ✗ Bad: Double quotes (except for JSX attributes)
const message = "Generation complete";
```

**Semicolons:**
```typescript
// ✓ Good: Semicolons required
const result = await analyzeTopic(topic);
setResult(result);

// ✗ Bad: Missing semicolons
const result = await analyzeTopic(topic)
setResult(result)
```

**Line Length:**
```typescript
// ✓ Good: Break long lines at 100 characters
const result = await analyzeTopic(
  topic,
  InfographicStyle.Modern,
  ColorPalette.Professional,
  filters,
  fileContent
);

// ✗ Bad: Line exceeds 100 characters
const result = await analyzeTopic(topic, InfographicStyle.Modern, ColorPalette.Professional, filters, fileContent);
```

**Import Organization:**
```typescript
// ✓ Good: Organized imports (external → internal → types)
import React, { useState, useEffect } from 'react';
import { Download, Save } from 'lucide-react';
import { analyzeTopic } from './services/geminiService';
import { InfographicStyle, ColorPalette, ImageSize } from './types';

// ✗ Bad: Disorganized imports
import { InfographicStyle } from './types';
import React from 'react';
import { analyzeTopic } from './services/geminiService';
import { Download } from 'lucide-react';
```

---

## Testing Requirements

### Current State

InfoGraphix AI does not currently have an automated test suite. However, contributors should follow these testing practices:

### Manual Testing Checklist

Before submitting a PR, manually test the following:

**Basic Functionality:**
- [ ] App loads without console errors
- [ ] API key selection works (in AI Studio or local .env)
- [ ] Form inputs accept valid data
- [ ] All four input types work (Topic, URL, GitHub, File)

**Generation Flow:**
- [ ] Analysis phase completes successfully
- [ ] Generation phase produces valid PNG image
- [ ] Generated image displays correctly
- [ ] Processing indicators show during both phases
- [ ] Error messages display for API failures

**Features:**
- [ ] All 23 styles are selectable and work
- [ ] All 10 color palettes are selectable and work
- [ ] All resolutions (1K, 2K, 4K) work
- [ ] All aspect ratios work
- [ ] GitHub filters (language, extensions, date) apply correctly
- [ ] File upload accepts .md files and analyzes content

**State Management:**
- [ ] Version history saves to localStorage
- [ ] Version history loads on page refresh
- [ ] Saved versions can be restored
- [ ] Saved versions can be deleted
- [ ] Form drafts persist across page loads

**Cross-Browser Testing:**
- [ ] Test in Chrome/Edge (Chromium)
- [ ] Test in Firefox
- [ ] Test in Safari (if available)
- [ ] No browser-specific console errors

**Responsive Design:**
- [ ] Layout works on desktop (1920x1080)
- [ ] Layout works on tablet (768px width)
- [ ] Layout works on mobile (375px width)
- [ ] No horizontal scrolling on mobile

### Future Testing Goals

**Unit Tests (Planned):**
```typescript
// Example: Test Gemini service error handling
describe('geminiService', () => {
  it('should handle 403 permission errors', async () => {
    // Mock API to return 403
    // Expect specific error message
  });

  it('should handle 429 rate limit errors', async () => {
    // Test rate limit error mapping
  });
});
```

**Integration Tests (Planned):**
```typescript
// Example: Test full generation flow
describe('Infographic Generation', () => {
  it('should generate infographic from topic', async () => {
    // Input topic
    // Wait for analysis
    // Wait for generation
    // Verify image is valid base64 PNG
  });
});
```

**Component Tests (Planned):**
```typescript
// Example: Test form validation
describe('InfographicForm', () => {
  it('should disable generate button when topic is empty', () => {
    // Render form with empty topic
    // Verify button is disabled
  });
});
```

### Testing Your Changes

**For Feature Additions:**
1. Test the new feature in isolation
2. Test interaction with existing features
3. Test error cases and edge cases
4. Verify no regressions in existing functionality

**For Bug Fixes:**
1. Reproduce the bug before fixing
2. Verify the fix resolves the issue
3. Test related functionality for regressions
4. Document the fix in PR description

**For Performance Changes:**
1. Measure before/after performance (if applicable)
2. Test with various input sizes
3. Test with different browser/device combinations

---

## Pull Request Process

### Before Submitting

1. **Sync with upstream:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Ensure code quality:**
   - Code follows style guidelines (see [Code Style](#code-style))
   - No TypeScript errors (`npm run build`)
   - No console errors or warnings in browser
   - Formatting is consistent

3. **Test your changes:**
   - Complete manual testing checklist (see [Testing Requirements](#testing-requirements))
   - Test in multiple browsers if possible
   - Verify responsive design on different screen sizes

4. **Update documentation:**
   - Update relevant `.md` files in `docs/` if API changes
   - Update `CHANGELOG.md` under `[Unreleased]` section
   - Add JSDoc comments for new functions/interfaces
   - Update `README.md` if user-facing features change

### Branch Naming

Use descriptive branch names following these patterns:

| Type | Pattern | Example |
|------|---------|---------|
| **New Feature** | `feature/description` | `feature/batch-generation` |
| **Bug Fix** | `fix/description` | `fix/api-key-validation` |
| **Documentation** | `docs/description` | `docs/update-api-guide` |
| **Refactor** | `refactor/description` | `refactor/extract-hooks` |
| **Performance** | `perf/description` | `perf/optimize-image-encoding` |
| **Build/Tooling** | `chore/description` | `chore/update-dependencies` |

**Examples:**
```bash
# Good branch names
git checkout -b feature/custom-style-templates
git checkout -b fix/localStorage-quota-error
git checkout -b docs/add-deployment-guide

# Bad branch names (too vague)
git checkout -b updates
git checkout -b fixes
git checkout -b new-feature
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

**Format:**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature for the user
- `fix`: Bug fix for the user
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc. (not CSS)
- `refactor`: Code restructuring without feature changes
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling

**Scopes** (optional but recommended):
- `api`: Changes to Gemini API integration
- `form`: Changes to input form
- `ui`: UI/UX changes
- `storage`: localStorage/version history
- `types`: TypeScript type definitions
- `config`: Configuration files (Vite, TS, etc.)

**Examples:**

```bash
# Feature additions
feat(form): add markdown file upload support
feat(api): implement custom style templates
feat(ui): add batch generation mode

# Bug fixes
fix(api): handle 429 rate limit errors gracefully
fix(storage): prevent localStorage quota errors for 4K images
fix(ui): correct aspect ratio calculations for portrait mode

# Documentation
docs(api): add sequence diagrams for generation flow
docs(readme): update installation instructions for Node 18+
docs(contributing): add testing requirements section

# Refactoring
refactor(hooks): extract useGeneration custom hook
refactor(components): split InfographicForm into smaller components
refactor(types): consolidate related interfaces

# Performance
perf(image): optimize base64 encoding for large images
perf(analysis): reduce analysis token usage by 20%

# Chores
chore(deps): update @google/genai to v1.30
chore(build): configure Vite for production builds
```

**Commit Message Templates:**

```bash
# Feature template
feat(scope): add [feature name]

- Implement [specific functionality]
- Add [new component/function]
- Update [affected areas]

Closes #[issue-number]

# Bug fix template
fix(scope): resolve [bug description]

The issue occurred when [reproduction steps].
This was caused by [root cause].

Fixed by [solution approach].

Fixes #[issue-number]

# Breaking change template
feat(api): redesign generation API

BREAKING CHANGE: The analyzeTopic function now requires
style and palette parameters. Update all calls to include
these new required parameters.

Migration guide:
- Before: analyzeTopic(topic, filters)
- After: analyzeTopic(topic, style, palette, filters)

Closes #[issue-number]
```

### Creating a Pull Request

1. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open PR on GitHub:**
   - Go to [repository](https://github.com/doublegate/InfoGraphix-GenAI)
   - Click "New Pull Request"
   - Select your branch
   - Fill out PR template (see below)

3. **PR Title:** Use same format as commit messages
   ```
   feat(form): add markdown file upload
   fix(api): handle rate limit errors
   docs(guide): add user guide
   ```

4. **PR Description Template:**
   ```markdown
   ## Description
   Brief description of what this PR does and why.

   ## Type of Change
   - [ ] Bug fix (non-breaking change which fixes an issue)
   - [ ] New feature (non-breaking change which adds functionality)
   - [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
   - [ ] Documentation update

   ## Changes Made
   - List specific changes
   - Be as detailed as necessary
   - Include component/file names

   ## Testing
   - [ ] Manual testing completed (describe what you tested)
   - [ ] Tested in Chrome/Edge
   - [ ] Tested in Firefox
   - [ ] Tested responsive design
   - [ ] No console errors or warnings

   ## Screenshots (if applicable)
   Add screenshots for UI changes

   ## Related Issues
   Closes #[issue-number]
   Related to #[issue-number]

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated (if applicable)
   - [ ] No breaking changes (or documented in description)
   - [ ] CHANGELOG.md updated
   ```

### PR Review Process

**What to Expect:**

1. **Automated Checks (future):**
   - TypeScript compilation (`npm run build`)
   - Linting (when configured)
   - Test suite (when implemented)

2. **Manual Review:**
   - Code quality and style adherence
   - Logic correctness
   - Performance considerations
   - Documentation completeness
   - Testing thoroughness

3. **Review Timeline:**
   - Small PRs (<100 lines): 1-2 days
   - Medium PRs (100-500 lines): 3-5 days
   - Large PRs (500+ lines): 1 week+

**Review Criteria:**

| Aspect | What Reviewers Check |
|--------|---------------------|
| **Correctness** | Does the code do what it claims? |
| **Quality** | Is the code well-structured and maintainable? |
| **Style** | Does it follow project conventions? |
| **Testing** | Has it been adequately tested? |
| **Documentation** | Are changes documented? |
| **Performance** | Are there any performance concerns? |
| **Security** | Are there any security issues? (API keys, XSS, etc.) |

**Responding to Feedback:**

1. **Address each comment:**
   - Fix requested changes
   - Explain if you disagree (with reasoning)
   - Mark conversations as resolved when done

2. **Push updates:**
   ```bash
   # Make changes
   git add .
   git commit -m "refactor: address PR feedback"
   git push origin your-branch-name
   ```

3. **Request re-review:**
   - Click "Re-request review" on GitHub after pushing updates

**Approval and Merge:**

1. PR requires at least 1 approval
2. All review comments must be addressed
3. All checks must pass (when implemented)
4. Maintainer will merge using "Squash and merge"

### PR Requirements Checklist

Before requesting review, ensure:

- [ ] **Code Quality:**
  - [ ] Follows TypeScript/React guidelines
  - [ ] No `any` types unless absolutely necessary
  - [ ] Proper error handling
  - [ ] Meaningful variable/function names

- [ ] **Testing:**
  - [ ] Manual testing completed
  - [ ] All features work as expected
  - [ ] No regressions in existing functionality
  - [ ] Tested in multiple browsers

- [ ] **Documentation:**
  - [ ] Code comments added for complex logic
  - [ ] JSDoc comments for new public functions
  - [ ] Relevant `.md` files updated
  - [ ] CHANGELOG.md updated

- [ ] **Git:**
  - [ ] Branch name follows convention
  - [ ] Commit messages follow Conventional Commits
  - [ ] Synced with upstream/main
  - [ ] No merge conflicts

- [ ] **PR Description:**
  - [ ] Clear description of changes
  - [ ] Type of change indicated
  - [ ] Testing steps documented
  - [ ] Related issues referenced

- [ ] **No Breaking Changes (or documented):**
  - [ ] Backwards compatible, OR
  - [ ] Breaking changes documented with migration guide

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
