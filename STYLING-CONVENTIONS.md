# Styling Conventions

**InfoGraphix-GenAI Styling Guide**
**Version:** 1.9.1
**Last Updated:** 2025-12-12

## Overview

InfoGraphix-GenAI uses a hybrid styling approach combining TailwindCSS v4 with custom CSS layers. This document outlines the conventions and best practices for maintaining consistent styling across the application.

## Architecture

### CSS Layer Structure

All styles are organized in `/src/styles/main.css` using Tailwind's `@layer` directive:

```css
@layer base { ... }       /* Global element styles */
@layer components { ... } /* Reusable component patterns */
@layer utilities { ... }  /* Custom utility classes */
```

### TailwindCSS v4

- **Framework:** TailwindCSS v4 (imported via `@import "tailwindcss"`)
- **Config:** `tailwind.config.js` for custom theme extensions
- **Font:** Inter (Google Fonts) loaded in main.css

## Styling Conventions

### 1. **Prefer Tailwind Utility Classes**

Use Tailwind utility classes directly in JSX for most styling needs:

```tsx
<button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl">
  Generate
</button>
```

### 2. **Use Component Classes for Patterns**

For frequently used patterns, use component classes defined in `@layer components`:

```tsx
<button className="btn-primary">Generate</button>
<input className="input-field" />
<div className="card">...</div>
```

**Available Component Classes:**
- `.btn-primary` - Primary action button with gradient
- `.btn-secondary` - Secondary button
- `.input-field` - Form input field
- `.card` - Card container
- `.alert-error` - Error message box
- `.badge`, `.badge-blue`, `.badge-green`, `.badge-yellow` - Status badges

### 3. **Custom Utilities for Repeated Patterns**

Use utility classes for repeated styling patterns:

```tsx
<h1 className="text-gradient">InfoGraphix AI</h1>
<div className="glass">...</div>
```

**Available Utility Classes:**
- `.text-gradient` - Blue to purple gradient text
- `.glass` - Glassmorphism effect
- `.animate-in` - Fade-in animation
- `.focus-ring` - Consistent focus styling
- `.scrollbar-hide` - Hide scrollbar while allowing scroll
- `.sr-only` - Screen reader only content

### 4. **When to Use Inline Styles**

**ONLY use inline styles for dynamic values that cannot be expressed with Tailwind:**

#### ✅ **Acceptable Inline Style Use Cases:**

1. **Dynamic Percentages** (e.g., progress bars):
   ```tsx
   <div style={{ width: `${(completed / total) * 100}%` }} />
   ```

2. **Dynamic Colors** (from user input or API):
   ```tsx
   <div style={{ backgroundColor: color }} />
   <span style={{ color: textColor }} />
   ```

3. **Staggered Animations** (calculated delays):
   ```tsx
   <div style={{ animationDelay: `${index * 75}ms` }} />
   ```

4. **CSS Variables** (for theme switching):
   ```tsx
   <div style={{ '--custom-value': value } as React.CSSProperties} />
   ```

#### ❌ **AVOID Inline Styles For:**

- Static colors (use Tailwind color utilities)
- Fixed dimensions (use Tailwind sizing utilities)
- Standard animations (use Tailwind animation utilities or custom keyframes)
- Hover/focus states (use Tailwind pseudo-class variants)

### 5. **Animation Conventions**

#### Standard Animations

Use Tailwind's built-in animations when possible:
```tsx
<div className="animate-spin">...</div>
<div className="animate-pulse">...</div>
```

#### Custom Animations

Define keyframes in `@layer utilities` in main.css:

```css
@keyframes animateIn {
  from {
    opacity: 0;
    transform: translateY(var(--tw-enter-translate-y, 0))
               scale(var(--tw-enter-scale, 1));
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

Use with utility classes:
```tsx
<div className="animate-in slide-in-from-top-5 zoom-in-95">...</div>
```

### 6. **Responsive Design**

Use Tailwind's responsive modifiers consistently:

```tsx
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Mobile: full width, Tablet: half width, Desktop: third width */}
</div>
```

**Breakpoints:**
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px
- `2xl:` - 1536px

### 7. **Dark Mode**

The application uses a dark color scheme by default:

```tsx
<div className="bg-slate-800 text-slate-200 border-slate-700">
  {/* Dark background, light text, subtle borders */}
</div>
```

**Color Palette:**
- Background: `slate-900`, `slate-800`
- Text: `slate-200`, `slate-300`, `white`
- Borders: `slate-700`, `slate-600`
- Accents: `blue-500`, `indigo-500`, `purple-500`

### 8. **Accessibility**

#### Focus Indicators

Always provide visible focus indicators:
```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500">
  {/* Or use the .focus-ring utility */}
</button>
```

#### Screen Reader Content

Use `.sr-only` for screen reader only content:
```tsx
<span className="sr-only">Loading...</span>
<Spinner aria-hidden="true" />
```

#### Reduced Motion

Animations respect `prefers-reduced-motion` via media query in main.css:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 9. **High Contrast Mode**

High contrast styles are defined in `/src/styles/high-contrast.css` and automatically applied when `data-high-contrast="true"` is set on the document root.

## Code Organization

### Component Styling Structure

Organize component classes consistently:

```tsx
<div
  className={`
    // Layout
    flex items-center gap-4 p-4

    // Visual
    bg-slate-800 border border-slate-700 rounded-xl

    // Typography
    text-white font-medium

    // Interactions
    hover:bg-slate-700 focus:ring-2

    // Responsive
    md:flex-row md:p-6

    // States
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `}
>
```

### Template Literals for Conditional Classes

Use template literals for conditional styling:

```tsx
className={`
  base-classes
  ${condition ? 'conditional-classes' : 'alternative-classes'}
  ${isActive && 'active-classes'}
`}
```

Or use a utility library like `clsx` or `classnames`:

```tsx
import clsx from 'clsx';

className={clsx(
  'base-classes',
  condition && 'conditional-classes',
  { 'active-classes': isActive }
)}
```

## File Structure

```
src/styles/
  ├── main.css           # Main stylesheet (@layer directives)
  └── high-contrast.css  # High contrast mode styles

tailwind.config.js      # Tailwind configuration
```

## Common Patterns

### Gradient Buttons

```tsx
<button className="btn-primary">
  {/* Blue-to-indigo gradient with shadow */}
</button>
```

### Card Containers

```tsx
<div className="card p-6">
  {/* Glass effect with backdrop blur */}
</div>
```

### Form Inputs

```tsx
<input className="input-field" placeholder="Enter text..." />
```

### Status Badges

```tsx
<span className="badge-green">Active</span>
<span className="badge-yellow">Pending</span>
<span className="badge-blue">Complete</span>
```

### Glassmorphism Effect

```tsx
<div className="glass p-6 rounded-2xl">
  {/* Frosted glass effect */}
</div>
```

## Best Practices

### ✅ DO

- Use Tailwind utilities for 95%+ of styling needs
- Define component classes for frequently repeated patterns (3+ uses)
- Use semantic class names in component layer (`.btn-primary` not `.blue-button`)
- Keep inline styles minimal and only for truly dynamic values
- Group related utility classes together
- Use consistent spacing (gap-2, gap-4, gap-6, gap-8)
- Maintain visual hierarchy with consistent sizing
- Test with reduced motion preferences

### ❌ DON'T

- Create component classes for one-off styles
- Use inline styles for static values
- Mix Tailwind and traditional CSS for the same element
- Use arbitrary values (`[#hexcolor]`) when theme colors exist
- Ignore accessibility (focus states, contrast ratios)
- Use overly specific selectors

## Migration Guide

### Converting Inline Styles to Tailwind

**Before:**
```tsx
<div style={{ padding: '16px', backgroundColor: '#1e293b' }}>
```

**After:**
```tsx
<div className="p-4 bg-slate-800">
```

### Creating Component Classes

**If a pattern is used 3+ times:**

1. Add to `@layer components` in main.css:
   ```css
   .my-component {
     @apply px-4 py-2 bg-slate-800 rounded-lg;
   }
   ```

2. Use the class:
   ```tsx
   <div className="my-component">
   ```

## Performance Considerations

- **PurgeCSS:** Unused Tailwind classes are automatically removed in production builds
- **Minimal Custom CSS:** Keep custom CSS minimal to reduce bundle size
- **Dynamic Styles:** Use CSS variables for theme values when possible
- **Animation Performance:** Prefer `transform` and `opacity` for animations (GPU-accelerated)

## Tools & Resources

- **Tailwind Docs:** https://tailwindcss.com/docs
- **Tailwind v4:** https://tailwindcss.com/blog/tailwindcss-v4
- **Color Contrast Checker:** WebAIM Contrast Checker
- **Accessibility:** WCAG 2.1 AA standards

## Audit Summary (v1.9.1)

**Inline Styles Found:** 7
- 4 in BatchQueueCard.tsx (progress bar widths) ✅ Required
- 2 in PaletteGenerator.tsx (dynamic colors) ✅ Required
- 1 in VersionHistory.tsx (staggered animation delay) ✅ Required

**Conclusion:** Styling conventions are well-maintained with minimal inline styles. All inline styles are justified and necessary for dynamic values.

## Version History

- **v1.9.1** (2025-12-12): Initial styling conventions documentation
