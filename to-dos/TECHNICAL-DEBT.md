# Technical Debt

Known issues, code quality improvements, and refactoring needs.

## Resolved Items

### ~~State Management Complexity~~ (RESOLVED)

**Location:** `App.tsx`

**Resolution Date:** 2025-12-11

**Solution Implemented:**
- Extracted `useVersionHistory` hook for version management with IndexedDB
- Extracted `useGeneration` hook for AI generation workflow
- Extracted `useFormPersistence` hook for form auto-save with debouncing
- All hooks exported from `hooks/index.ts`

**Files Created:**
- `hooks/useVersionHistory.ts`
- `hooks/useGeneration.ts`
- `hooks/useFormPersistence.ts`
- `hooks/index.ts`

---

### ~~Base64 Image Storage~~ (RESOLVED)

**Location:** localStorage persistence

**Resolution Date:** 2025-12-11

**Solution Implemented:**
- IndexedDB storage via `services/storageService.ts`
- Image compression using Canvas API (configurable quality/dimensions)
- Storage quota monitoring with `getStorageQuota()`
- Auto-cleanup of old versions (max 50)
- Migration utility from localStorage

**Files Created:**
- `services/storageService.ts` (280+ lines)

---

### ~~Error Boundary Missing~~ (RESOLVED)

**Location:** Application-wide

**Resolution Date:** 2025-12-11

**Solution Implemented:**
- Full ErrorBoundary class component with fallback UI
- User-friendly error display with recovery options
- Optional error callback for external logging
- Integrated in `index.tsx` wrapping entire app

**Files Created:**
- `components/ErrorBoundary.tsx`

**Files Modified:**
- `index.tsx` - Added ErrorBoundary wrapper

## High Priority

(No remaining high priority items)

## Medium Priority

### API Key Client-Side Exposure

**Location:** Application-wide (AI Studio integration)

**Issue:** API keys are handled client-side for AI Studio deployment model. While this is intentional for the target deployment environment, the security model is not clearly documented.

**Code Review Finding:** v1.4.5 code review (2025-12-12)

**Impact:** Security documentation gap - users may not understand the security implications of the client-side API key model.

**Proposed Solution:**
- Document security model in README.md
- Add security considerations section to docs
- Clarify AI Studio vs. local development security
- Document API key best practices

**Estimated Effort:** Low (documentation only)

**Target Version:** v1.4.6 or v1.5.0

---

### ~~Type Safety Gaps~~ (RESOLVED)

**Location:** Various

**Resolution Date:** 2025-12-11

**Solution Implemented:**
- Type-safe validation in `useFormPersistence` hook with schema validation
- Validates enum values against actual TypeScript enums
- Returns null for invalid data, falling back to defaults

**Files Modified:**
- `hooks/useFormPersistence.ts` - Added `validateFormValues()` function

---

### ~~TailwindCSS CDN Usage~~ (RESOLVED)

**Location:** `index.html`

**Resolution Date:** 2025-12-11

**Solution Implemented:**
- Migrated to build-time TailwindCSS compilation
- Added proper configuration with content paths
- Custom theme extensions for dark slate colors
- PostCSS integration with autoprefixer
- Component classes in `styles/main.css`

**Files Created:**
- `tailwind.config.js`
- `postcss.config.js`
- `styles/main.css`

**Files Modified:**
- `index.html` - Removed CDN script
- `index.tsx` - Added CSS import

**Dependencies Added:**
- tailwindcss (dev)
- postcss (dev)
- autoprefixer (dev)

---

### Component Prop Drilling

**Location:** Multiple components

**Issue:** Props passed through multiple component layers unnecessarily.

**Example:**
```
App → InfographicForm → RichSelect
     └─ passes 10+ props through
```

**Proposed Solution:**
- Use React Context for shared state
- Implement compound components pattern
- Extract container components

**Estimated Effort:** Medium

---

### Missing Loading States

**Location:** Various async operations

**Issue:** Some operations lack proper loading indicators:
- Version deletion
- File upload processing
- Initial localStorage load

**Estimated Effort:** Low

## Low Priority

### Console Logging Not Filtered for Production

**Location:** Application-wide

**Issue:** 40+ console.log statements exist across the codebase without environment-based filtering. In production builds, these logs create unnecessary noise and may expose sensitive information.

**Code Review Finding:** v1.4.5 code review (2025-12-12)

**Impact:** Production debugging noise, potential information disclosure

**Proposed Solution:**
- Create logger utility with environment-based filtering
- Replace all console.log calls with logger methods
- Implement log levels (debug, info, warn, error)
- Disable debug/info logs in production builds

**Example:**
```typescript
// utils/logger.ts
export const logger = {
  debug: (...args: any[]) => {
    if (import.meta.env.DEV) console.log(...args);
  },
  info: (...args: any[]) => {
    if (import.meta.env.DEV) console.info(...args);
  },
  warn: (...args: any[]) => console.warn(...args),
  error: (...args: any[]) => console.error(...args),
};
```

**Estimated Effort:** Low (1-2 hours)

**Target Version:** v1.5.0

---

### Missing Unit Tests

**Location:** Application-wide

**Issue:** No unit test framework is currently configured. This creates risk for future maintainability and regression prevention.

**Code Review Finding:** v1.4.5 code review (2025-12-12)

**Impact:** Future maintainability, regression prevention

**Proposed Solution:**
- Add Vitest test framework
- Configure test environment with React Testing Library
- Write unit tests for utility functions and services
- Add component tests for key UI components
- Configure test coverage reporting
- Add CI integration

**Priority Areas:**
1. `services/geminiService.ts` - API integration logic
2. `services/storageService.ts` - IndexedDB operations
3. Custom hooks (`hooks/`) - State management logic
4. Utility functions
5. Component rendering and interactions

**Estimated Effort:** High (ongoing)

**Target Version:** v2.0.0 (comprehensive suite as per v2.0.0 plan)

---

### Callback Function Parameters

**Location:** Multiple components

**Issue:** Some callback functions pass multiple individual parameters where object destructuring would improve API clarity and extensibility.

**Code Review Finding:** v1.4.5 code review (2025-12-12)

**Impact:** Code readability, API design

**Example:**
```typescript
// Current
onGenerate(topic, inputType, size, aspectRatio, style, palette);

// Proposed
onGenerate({ topic, inputType, size, aspectRatio, style, palette });
```

**Benefits:**
- Named parameters for clarity
- Easier to add optional parameters
- More flexible function signatures
- Better IDE autocomplete

**Estimated Effort:** Low (refactoring)

**Target Version:** v1.5.0

---

### Code Organization

**Files to Consider Splitting:**

| File | Lines | Suggested Split |
|------|-------|-----------------|
| `App.tsx` | 400+ | Extract hooks, handlers |
| `types.ts` | 100+ | Separate by domain |
| `geminiService.ts` | 200+ | Split analysis/generation |

---

### Test Coverage

**Current State:** No automated tests

**Needed:**
- Unit tests for utility functions
- Component tests with Testing Library
- Integration tests for generation flow
- E2E tests for critical paths

**Estimated Effort:** High (ongoing)

---

### ~~Documentation Inline~~ (RESOLVED)

**Resolution Date:** 2025-12-11

**Solution Implemented:**
- Comprehensive JSDoc documentation added to `types.ts`
- All enums documented with use case descriptions
- All interfaces documented with property descriptions
- Added `@remarks` sections for additional context

**Files Modified:**
- `types.ts` - Added complete JSDoc documentation (250+ lines)

---

### ~~Accessibility Audit~~ (RESOLVED)

**Resolution Date:** 2025-12-11

**Solution Implemented:**
- Added skip-to-content link in `App.tsx`
- Added `aria-labels` to all icon buttons across components
- Added `aria-hidden="true"` to decorative icons
- Implemented full keyboard navigation in `RichSelect.tsx` (Arrow keys, Enter, Escape, Home, End)
- Added proper ARIA attributes: `aria-haspopup`, `aria-expanded`, `aria-selected`, `role="listbox"`, `role="option"`
- Added `role="dialog"` and `aria-modal` to VersionHistory drawer
- Added proper labels for search and sort inputs
- Added focus ring styles for keyboard navigation

**Files Modified:**
- `App.tsx` - Skip-to-content link, nav landmarks
- `components/RichSelect.tsx` - Full keyboard nav, ARIA attributes
- `components/InfographicResult.tsx` - aria-labels, aria-hidden
- `components/VersionHistory.tsx` - Dialog role, labels, aria-hidden

**Remaining:**
- Color contrast verification (automated testing recommended)

---

### Performance Optimization

**Potential Improvements:**
- Memoize expensive computations
- Lazy load version history images
- Virtualize long lists
- Debounce form auto-save

**Estimated Effort:** Medium

## Refactoring Candidates

### ~~Extract Custom Hooks~~ (RESOLVED)

**Resolution Date:** 2025-12-11

**Implemented Hooks:**
```typescript
// hooks/useFormPersistence.ts
useFormPersistence()  // Auto-save form with debouncing and validation

// hooks/useVersionHistory.ts
useVersionHistory()   // Manage saved versions with IndexedDB

// hooks/useGeneration.ts
useGeneration()       // Handle two-phase AI generation workflow
```

**Remaining:**
- `useApiKey()` - API key management (optional future extraction)

### Consolidate API Error Handling

**Current:** Error handling duplicated across service functions

**Proposed:** Centralized error handler with consistent user messages

```typescript
// Proposed pattern
const handleApiError = (error: unknown): UserFacingError => {
  if (isGeminiError(error)) {
    return mapGeminiError(error);
  }
  return genericError;
};
```

### Component Composition

**RichSelect:** Consider using Radix UI or Headless UI for better accessibility and behavior.

**Modal Components:** Extract reusable Modal wrapper component.

## Technical Debt Tracking

### Adding New Debt

When adding technical debt:
1. Document in this file
2. Add TODO comment in code
3. Create GitHub issue if significant
4. Link related items

### Addressing Debt

When addressing debt:
1. Create branch for refactoring
2. Update this document
3. Ensure tests pass (when available)
4. Request review for significant changes

## Metrics

### Current Status (Updated 2025-12-12)

| Category | Total | Resolved | Remaining | Priority |
|----------|-------|----------|-----------|----------|
| High Priority | 3 | 3 | 0 | All resolved |
| Medium Priority | 6 | 3 | 3 | Address within 2 releases |
| Low Priority | 9 | 2 | 7 | Address as time permits |
| Refactoring | 4 | 1 | 3 | As needed |

**Recent Additions (v1.4.5 Code Review - 2025-12-12):**
- Medium: API Key Client-Side Exposure (documentation gap)
- Low: Console Logging Not Filtered for Production
- Low: Missing Unit Tests
- Low: Callback Function Parameters

### Resolution Summary

| Item | Status | Date |
|------|--------|------|
| State Management Complexity | RESOLVED | 2025-12-11 |
| Base64 Image Storage | RESOLVED | 2025-12-11 |
| Error Boundary Missing | RESOLVED | 2025-12-11 |
| Type Safety Gaps | RESOLVED | 2025-12-11 |
| TailwindCSS CDN Usage | RESOLVED | 2025-12-11 |
| Documentation Inline | RESOLVED | 2025-12-11 |
| Extract Custom Hooks | RESOLVED | 2025-12-11 |
| Accessibility Audit | RESOLVED | 2025-12-11 |

### Goals

- ~~Reduce high priority items to 0~~ ACHIEVED
- Maintain medium priority items < 5 (currently 3)
- Review quarterly
