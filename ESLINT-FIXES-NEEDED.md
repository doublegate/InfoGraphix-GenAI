# ESLint Fixes Needed (v1.8.0 - TD-019)

**Status:** Rules updated to strict mode, critical fixes applied, remaining errors documented for incremental resolution

**Stricter Rules Applied (v1.8.0):**
- `@typescript-eslint/no-unused-vars`: warn → error
- `react-hooks/exhaustive-deps`: warn → error
- `@typescript-eslint/no-floating-promises`: error (new)
- `@typescript-eslint/await-thenable`: error (new)
- `@typescript-eslint/no-misused-promises`: error (new)
- `no-console`: warn → error
- `complexity`: warn at >20 (new)

## Remaining Errors (to be fixed incrementally)

### Critical (Affects Functionality)
- [ ] **Misused Promises in Event Handlers:** ~10 instances
  - Files: InfographicForm.tsx, InfographicResult.tsx, VersionHistory.tsx, TemplateBrowser.tsx, BatchManager.tsx
  - Fix: Wrap async handlers with `() => void fn()`

### High Priority (Code Quality)
- [ ] **Floating Promises:** ~8 instances
  - Files: BatchManager.tsx, LanguageSelector.tsx, PaletteGenerator.tsx, useVersionHistory.ts
  - Fix: Add `void` keyword or `.catch()` handler

- [ ] **Unused Variables/Imports:** ~15 instances
  - Fix: Remove or prefix with `_`

### Medium Priority (Cleanup)
- [ ] **Complexity Warnings:** 3 functions >20 complexity
  - InfographicForm.tsx line 112 (complexity: 40)
  - VersionHistory.tsx line 33 (complexity: 33)
  - useKeyboardShortcuts.ts line 39 (complexity: 26)
  - geminiService.ts line 89 (complexity: 23)
  - Consider: Extract helper functions, use switch/case, simplify logic

- [ ] **Unnecessary Escape Characters:** 3 instances
  - templateService.ts, exportUtils.ts
  - Fix: Remove `\` before `-` in regex patterns

- [ ] **Await-thenable:** 1 instance
  - VersionHistory.tsx line 461
  - Fix: Remove `await` on non-Promise value

## Progress Tracking

**Sprint 2 TD-019 Status:**
- ✅ ESLint config updated with stricter rules
- ✅ Critical fixes applied (App.tsx, ApiKeySelector.tsx, i18n,useStyleSuggestions.ts)
- ✅ Build succeeds with new rules
- ⏳ Remaining ~40 errors documented for incremental fixes

**Next Steps:**
1. Continue Sprint 2 with remaining items (TD-030 through TD-003)
2. Address remaining ESLint errors in follow-up sprint or incrementally
3. Run `npm run lint` before each commit to prevent new violations

**Quick Fix Commands:**
```bash
# Check remaining errors
npm run lint

# Auto-fix what's possible
npm run lint:fix

# Count remaining errors
npm run lint 2>&1 | grep "error" | wc -l
```

## Notes
- Complexity warnings are informational - they highlight candidates for refactoring but don't block code quality
- Console errors are properly handled via logger utility (src/utils/logger.ts)
- All new rules are correctly configured with TypeScript project for type-aware linting
