# Styling Guide

This document covers the styling system used in InfoGraphix AI.

## Overview

InfoGraphix AI uses TailwindCSS via CDN for styling. The application also provides 22 distinct infographic styles and 10 color palettes for generated images.

## TailwindCSS Setup

TailwindCSS is loaded via CDN in `index.html`:

```html
<script src="https://cdn.tailwindcss.com"></script>
```

### Advantages

- Zero build configuration
- Immediate access to all Tailwind utilities
- Smaller initial bundle size
- No PostCSS setup required

### Limitations

- No custom configuration (tailwind.config.js)
- No purging of unused styles
- Requires internet connection
- Slightly larger CSS payload

### Migration to Build-Time

To migrate to build-time Tailwind:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Design System

### Color Palette (UI)

The application UI uses a neutral color scheme:

| Use Case | Tailwind Classes |
|----------|------------------|
| Primary | `bg-blue-600`, `hover:bg-blue-700` |
| Secondary | `bg-gray-100`, `hover:bg-gray-200` |
| Background | `bg-white`, `bg-gray-50` |
| Text | `text-gray-900`, `text-gray-600`, `text-gray-400` |
| Border | `border-gray-200`, `border-gray-300` |
| Error | `bg-red-50`, `text-red-600`, `border-red-200` |
| Success | `bg-green-50`, `text-green-600`, `border-green-200` |

### Typography

| Element | Classes |
|---------|---------|
| Heading 1 | `text-3xl font-bold text-gray-900` |
| Heading 2 | `text-2xl font-semibold text-gray-900` |
| Heading 3 | `text-xl font-medium text-gray-900` |
| Body | `text-base text-gray-600` |
| Small | `text-sm text-gray-500` |
| Caption | `text-xs text-gray-400` |

### Spacing

Consistent spacing scale:

| Size | Value | Use Case |
|------|-------|----------|
| 1 | 0.25rem | Tight spacing |
| 2 | 0.5rem | Icon gaps |
| 3 | 0.75rem | Button padding (y) |
| 4 | 1rem | Standard gap |
| 6 | 1.5rem | Section spacing |
| 8 | 2rem | Large gaps |

### Shadows

| Level | Class | Use Case |
|-------|-------|----------|
| Small | `shadow-sm` | Inputs, small cards |
| Default | `shadow` | Cards, dropdowns |
| Medium | `shadow-md` | Elevated cards |
| Large | `shadow-lg` | Modals, popovers |

## Component Patterns

### Buttons

```tsx
// Primary button
<button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
  Generate
</button>

// Secondary button
<button className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
  Cancel
</button>

// Icon button
<button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
  <Settings className="w-5 h-5 text-gray-600" />
</button>

// Danger button
<button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
  Delete
</button>
```

### Form Elements

```tsx
// Text input
<input
  type="text"
  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
  placeholder="Enter topic..."
/>

// Textarea
<textarea
  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow resize-none"
  rows={4}
/>

// Select
<select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
  <option>Option 1</option>
</select>

// Label
<label className="block text-sm font-medium text-gray-700 mb-1">
  Topic
</label>
```

### Cards

```tsx
// Standard card
<div className="bg-white rounded-lg shadow-md p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-2">Title</h3>
  <p className="text-gray-600">Content</p>
</div>

// Clickable card
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
  ...
</div>

// Card with border
<div className="bg-white border border-gray-200 rounded-lg p-6">
  ...
</div>
```

### Modals

```tsx
// Modal overlay
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  {/* Modal content */}
  <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Modal Title</h2>
    <p className="text-gray-600 mb-6">Modal content</p>
    <div className="flex justify-end gap-3">
      <button className="...">Cancel</button>
      <button className="...">Confirm</button>
    </div>
  </div>
</div>
```

## Infographic Styles

The 22 available infographic styles for generated images:

| Style | Description |
|-------|-------------|
| Modern | Clean lines, contemporary feel |
| Minimalist | Sparse design, lots of whitespace |
| Corporate | Professional, business-appropriate |
| Tech | Digital, futuristic elements |
| Nature | Organic shapes, natural motifs |
| Vintage | Retro aesthetics, aged appearance |
| Hand-Drawn | Sketchy, illustrated look |
| Geometric | Shape-based, mathematical |
| Gradient | Smooth color transitions |
| Flat Design | No shadows, solid colors |
| Isometric | 3D perspective without vanishing point |
| Cyberpunk | Neon colors, dystopian tech |
| Retro-Futuristic | 80s vision of the future |
| Watercolor | Painted, artistic look |
| Paper-Cut | Layered paper effect |
| Neon-Glow | Glowing elements, dark background |
| Blueprint | Technical drawing style |
| Chalkboard | Chalk on blackboard aesthetic |
| Magazine | Editorial, publication style |
| Bauhaus | German modernist design |
| Art-Deco | 1920s decorative style |
| Data-Viz | Data visualization focus |

## Color Palettes

The 10 available color palettes for generated images:

| Palette | Colors | Best For |
|---------|--------|----------|
| Professional | Blues, grays, navy | Business, corporate |
| Vibrant | Bright, saturated | Marketing, youth |
| Earth Tones | Browns, greens, beige | Nature, organic |
| Ocean | Blues, teals, aqua | Water, calm |
| Sunset | Oranges, pinks, purples | Warm, emotional |
| Monochrome | Single color variations | Elegant, simple |
| Pastel | Soft, muted colors | Gentle, approachable |
| Bold Contrast | High contrast pairs | Impact, attention |
| Forest | Deep greens, browns | Environmental |
| Warm Neutrals | Beiges, creams, tans | Sophisticated, natural |

## Responsive Design

### Breakpoints

| Prefix | Min Width | Use Case |
|--------|-----------|----------|
| (none) | 0px | Mobile first |
| `sm:` | 640px | Large phones |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large screens |

### Common Patterns

```tsx
// Responsive container
<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

// Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// Responsive text
<h1 className="text-2xl sm:text-3xl lg:text-4xl">

// Hide on mobile
<div className="hidden md:block">

// Show only on mobile
<div className="md:hidden">
```

## Animation

### Transitions

```tsx
// Color transition
<button className="transition-colors">

// Shadow transition
<div className="transition-shadow">

// All transitions
<div className="transition-all">

// Custom duration
<div className="transition-all duration-300">
```

### Loading States

```tsx
// Spinner
<Loader2 className="w-5 h-5 animate-spin" />

// Pulse (skeleton)
<div className="animate-pulse bg-gray-200 rounded h-4 w-full" />

// Fade in
<div className="animate-fade-in">  // Requires custom config
```

## Icons

Icons from Lucide React:

```tsx
import {
  Loader2,      // Loading spinner
  Image,        // Image/generation
  Download,     // Download action
  Save,         // Save action
  Trash2,       // Delete action
  Settings,     // Settings/config
  ChevronDown,  // Dropdown indicator
  ChevronRight, // Expand indicator
  X,            // Close/dismiss
  Check,        // Success/selected
  AlertCircle,  // Error/warning
  Info,         // Information
  Search,       // Search input
  Link,         // URL input
  Github,       // GitHub input
  FileText,     // File upload
  History,      // Version history
  Star,         // Rating
  ExternalLink, // External link
} from 'lucide-react';

// Standard size
<Icon className="w-4 h-4" />

// With color
<Icon className="w-4 h-4 text-gray-600" />

// Larger
<Icon className="w-6 h-6" />
```

## Dark Mode (Future)

The application currently uses light mode only. To add dark mode:

```tsx
// Container with dark mode support
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-white">
    Content
  </p>
</div>

// Enable via class on html element
<html class="dark">
```

## Accessibility

### Focus States

All interactive elements should have visible focus:

```tsx
<button className="... focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
```

### Color Contrast

Ensure sufficient contrast ratios:
- Body text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum

### Screen Readers

```tsx
// Screen reader only
<span className="sr-only">Loading</span>

// Aria labels
<button aria-label="Close modal">
  <X className="w-5 h-5" />
</button>
```
