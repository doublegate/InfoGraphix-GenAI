# Technical Debt

Known issues, code quality improvements, and refactoring needs.

## High Priority

### State Management Complexity

**Location:** `App.tsx`

**Issue:** All application state is managed in a single component with many useState hooks. This makes the component large and harder to maintain.

**Current State:**
```typescript
// 15+ useState hooks in App.tsx
const [processingStep, setProcessingStep] = useState(...);
const [analysisResult, setAnalysisResult] = useState(...);
const [generatedImage, setGeneratedImage] = useState(...);
// ... many more
```

**Proposed Solution:**
- Consider using useReducer for related state
- Extract custom hooks for logical groupings
- Evaluate React Context or lightweight state management

**Estimated Effort:** Medium

---

### Base64 Image Storage

**Location:** localStorage persistence

**Issue:** Images stored as base64 data URLs consume significant storage space. localStorage has ~5MB limit, which can be exceeded with few high-resolution images.

**Impact:**
- Users can only save limited versions
- Large images cause quota errors
- No cleanup mechanism

**Proposed Solution:**
- Implement IndexedDB storage for images
- Add image compression before storage
- Implement storage quota warnings
- Auto-cleanup old versions

**Estimated Effort:** Medium

---

### Error Boundary Missing

**Location:** Application-wide

**Issue:** No React error boundaries implemented. JavaScript errors crash the entire app.

**Proposed Solution:**
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log to error tracking service
    // Show fallback UI
  }
}
```

**Estimated Effort:** Low

## Medium Priority

### Type Safety Gaps

**Location:** Various

**Issues:**
1. Some API responses typed as `any`
2. Event handlers lack proper typing
3. localStorage data not validated on load

**Examples:**
```typescript
// Current (unsafe)
const stored = localStorage.getItem('key');
const data = JSON.parse(stored); // Could be anything

// Proposed (type-safe)
const data = validateSchema(JSON.parse(stored), SavedVersionSchema);
```

**Estimated Effort:** Medium

---

### TailwindCSS CDN Usage

**Location:** `index.html`

**Issue:** Using TailwindCSS via CDN has limitations:
- No purging of unused styles
- No custom configuration
- Requires network connection
- Larger CSS payload

**Proposed Solution:**
- Migrate to build-time Tailwind
- Add tailwind.config.js
- Configure purge settings

**Estimated Effort:** Low

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

### Documentation Inline

**Issue:** Some complex functions lack JSDoc comments.

**Files Needing Documentation:**
- `geminiService.ts` - API interaction functions
- `App.tsx` - State management logic
- `types.ts` - Enum value descriptions

**Estimated Effort:** Low

---

### Accessibility Audit

**Known Issues:**
- Missing aria-labels on icon buttons
- Color contrast not verified
- Keyboard navigation incomplete
- No skip-to-content link

**Estimated Effort:** Medium

---

### Performance Optimization

**Potential Improvements:**
- Memoize expensive computations
- Lazy load version history images
- Virtualize long lists
- Debounce form auto-save

**Estimated Effort:** Medium

## Refactoring Candidates

### Extract Custom Hooks

```typescript
// Proposed extractions
useFormPersistence()  // Auto-save form to localStorage
useVersionHistory()   // Manage saved versions
useGeneration()       // Handle generation flow
useApiKey()          // API key management
```

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

### Current Status

| Category | Count | Priority |
|----------|-------|----------|
| High Priority | 3 | Address in next release |
| Medium Priority | 5 | Address within 2 releases |
| Low Priority | 6 | Address as time permits |

### Goals

- Reduce high priority items to 0
- Maintain medium priority items < 5
- Review quarterly
