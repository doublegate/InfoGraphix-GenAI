# Bundle Size Analysis

**v1.8.0 Baseline** - Established 2025-12-12

## Overview

Bundle size analysis using `rollup-plugin-visualizer` to track and optimize application bundle sizes. This document establishes baseline metrics for future optimization.

## Running Analysis

```bash
# Generate bundle analysis report
npm run build:analyze

# View report
open dist/stats.html
```

The report shows:
- Bundle composition (treemap visualization)
- Size of each module and chunk
- Gzip and Brotli compressed sizes
- Dependencies and their impact

## Baseline Metrics (v1.8.0)

### Total Bundle Sizes

| Category | Uncompressed | Gzipped | Brotli |
|----------|--------------|---------|---------|
| **Total** | 1,592 KB | 457 KB | ~350 KB (est) |
| JavaScript | 1,507 KB | 444 KB | - |
| CSS | 85 KB | 12 KB | - |

### Individual Chunks

| File | Size | Gzipped | Type | Load Strategy |
|------|------|---------|------|---------------|
| `index-pPF6ZTJP.js` | 660.35 KB | 175.51 KB | Main bundle | Initial |
| `export-libs-Cm4teysG.js` | 686.49 KB | 203.56 KB | Export utilities | Lazy-loaded |
| `index.es-_too4CM_.js` | 158.55 KB | 52.90 KB | Vendor libs | Initial |
| `VersionHistory-DZNlhkAA.js` | 26.58 KB | 6.05 KB | Component | Lazy-loaded |
| `purify.es-Bzr520pe.js` | 22.45 KB | 8.63 KB | Sanitization | Lazy-loaded |
| `BatchManager-BvZaBDv7.js` | 21.91 KB | 5.70 KB | Component | Lazy-loaded |
| `exportUtils-BrR9IJ_W.js` | 3.44 KB | 1.51 KB | Utility | Initial |
| `index-gpGr-2HW.css` | 84.85 KB | 12.40 KB | Styles | Initial |

### Initial Load Breakdown

**Total Initial Load:** ~922 KB uncompressed, ~240 KB gzipped

- Main bundle: 660 KB (176 KB gzipped)
- Vendor bundle: 159 KB (53 KB gzipped)
- Styles: 85 KB (12 KB gzipped)
- Small utilities: ~18 KB (~6 KB gzipped)

### Lazy-Loaded Chunks

**Total Lazy:** ~756 KB uncompressed, ~217 KB gzipped

- Export libraries (jsPDF, JSZip): 686 KB (204 KB gzipped)
- VersionHistory component: 27 KB (6 KB gzipped)
- DOMPurify sanitization: 22 KB (9 KB gzipped)
- BatchManager component: 22 KB (6 KB gzipped)

## Key Dependencies

### Large Dependencies (>50KB uncompressed)

1. **@google/genai** (~120 KB) - Gemini AI SDK
2. **jsPDF** (~450 KB, lazy) - PDF export
3. **JSZip** (~200 KB, lazy) - ZIP export
4. **React + React-DOM** (~140 KB) - UI framework
5. **lucide-react** (~80 KB) - Icon library
6. **i18next** (~70 KB) - Internationalization
7. **node-vibrant** (~65 KB, lazy) - Color extraction

## Optimization Opportunities

### High Priority
1. **Tree-shake lucide-react** - Only import used icons instead of entire library
2. **Code split i18next** - Lazy-load language files
3. **Optimize @google/genai** - Consider using a lighter SDK or custom implementation

### Medium Priority
4. **Bundle icons** - Generate icon sprite instead of importing all icons
5. **Lazy-load DOMPurify** - Only load when needed for user-generated content
6. **Split large components** - Further split InfographicForm and App.tsx

### Low Priority
7. **Minify CSS** - Additional CSS optimization
8. **Image optimization** - Use WebP for static assets
9. **Pre-compression** - Serve pre-compressed Brotli assets

## Monitoring

### Threshold Alerts

- **Initial load >300 KB gzipped**: Review and optimize
- **Any chunk >250 KB gzipped**: Consider splitting
- **Total bundle >2 MB uncompressed**: Major optimization needed

### Tracking Changes

When adding new features:
1. Run `npm run build:analyze` before changes
2. Implement feature
3. Run analysis again
4. Compare bundle sizes
5. Document significant increases (>5%) in PR

## Related

- Vite config: `vite.config.ts`
- Code splitting: Lazy imports in `App.tsx`
- Manual chunks: `vite.config.ts` > `build.rollupOptions.output.manualChunks`
