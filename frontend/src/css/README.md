# CSS System Documentation - Professional Design 2026

## Overview
The Mini-Forum CSS system has been completely restructured for professional, maintainable, and scalable design. It supports both dark (default) and light themes with no code duplication.

## File Structure & Purpose

### 1. `variables.css` - Design System Foundation
**Purpose:** Central store for all design tokens
- **Color Palettes:** Both dark and light theme colors
- **Gradients:** Pre-defined gradient combinations
- **Shadows:** Layered shadow system
- **Transitions:** Standardized timing functions
- **Spacing:** 8px-based spacing scale
- **Typography:** Font families, weights, sizes, line heights
- **Z-indexes:** Layered stacking context

**Usage in Components:**
```css
.my-component {
  background: var(--glass-bg-light);
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-md);
  transition: var(--transition-base);
}
```

### 2. `global.css` - Framework Setup
- Imports Google Fonts (Assistant)
- Tailwind CSS setup
- RTL direction configuration
- Base HTML/body styles

### 3. `common.css` - Fundamental Styling
**Core Components:**
- HTML/body reset and styling
- Scrollbar styling with gradients
- Background effects & animations
- Layout containers
- Typography (headings, labels, text)
- Button base styles with variants
- Card base styles
- Dividers & separators
- Animation utilities

**Key Classes:**
- `.card` - Basic card with hover lift effect
- `.btn`, `.cta-btn` - Button variants
- `.badge`, `.tag` - Small UI elements
- `.spinner` - Loading indicator
- Spacing utilities: `.mt-*`, `.mb-*`, `.p-*`

### 4. `animations.css` - Animation Library
**Entrance Animations:**
- `fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`
- `scaleIn`, `slideInUp`

**Interactive Animations:**
- `hover-lift` - Cards lift on hover
- `pulse`, `pulse-glow` - Pulsing effect
- `shimmer` - Shimmer effect
- `float` - Floating motion
- `rotate-slow` - Slow rotation

**Utility Classes:**
- `.animate-fade-in-up`, `.animate-scale-in`, etc.
- `.animate-pulse`, `.animate-float`
- Stagger animations with nth-child delays

### 5. `style.css` - Component Patterns
**Card Variants:**
- `.card-primary` - Main card style
- `.cat-card` - Category cards with underline animation
- `.post-card` - Post/article cards
- `.post-card-featured` - Featured posts

**Form Elements:**
- Input, textarea, select styling
- Focus states with glow effects
- Placeholder styling

**Other Components:**
- Search box styling
- Avatars with gradients
- Badges & status indicators
- Loading spinners
- Alerts & messages
- Tables & lists
- Pagination

### 6. `components.css` - Advanced Components
**Modals & Dialogs:**
- Overlay backdrop with blur
- Scale-in animation
- Smooth enter/exit

**Dropdowns & Menus:**
- Context menu styling
- Smooth visibility transitions

**Tooltips:**
- Top/bottom positioning
- Smooth fade-in/out

**Tabs:**
- Active state styling
- Content switching with animation

**Accordion:**
- Collapsible sections
- Smooth height transitions

**Toasts/Notifications:**
- Position in corner
- Slide-in animation
- Success/error/warning variants

### 7. `navigation.css` - Sidebar & Navigation
- Sidebar styling
- Navbar/header styling
- Breadcrumbs
- Navigation links with hover effects

### 8. `pages-layout.css` - Page-Specific Styles
- Page header styling
- Content grids and lists
- Page-specific component overrides

### 9. `responsive.css` - Mobile/Tablet Styles
- Media queries for different breakpoints
- Mobile-first approach
- Accessibility considerations

## Theme System

### Dark Theme (Default)
**Root Variables:**
```css
--accent: #ccff00;              /* Acid Yellow */
--accent-alt: #00e5ff;          /* Cyan */
--bg-primary: #0a0a0c;          /* Deep Black */
--text-primary: #e2e8f0;        /* Light Gray */
```

### Light Theme
**Activated with:**
```html
<body data-theme="light">
```

**Root Variables:**
```css
--accent: #0066ff;              /* Professional Blue */
--accent-alt: #00b4d8;          /* Teal */
--bg-primary: #ffffff;          /* White */
--text-primary: #1a1a2e;        /* Dark Blue */
```

## Using the CSS System

### Creating a New Component

```css
.my-new-component {
  /* Use design tokens */
  background: var(--glass-bg-light);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  color: var(--text-primary);
  
  /* Use transitions */
  transition: var(--transition-base);
  
  /* Use shadows for depth */
  box-shadow: var(--shadow-sm);
}

.my-new-component:hover {
  background: var(--glass-bg-medium);
  border-color: var(--border-light);
  box-shadow: var(--shadow-md), var(--glow-accent);
  transform: translateY(-4px);
}
```

### Using Animation Classes

```html
<div class="card animate-fade-in-up">
  <h3>Title</h3>
  <p>Content</p>
</div>

<div class="stagger-item">Item 1</div>
<div class="stagger-item">Item 2</div>
<div class="stagger-item">Item 3</div>
```

### Responsive Design

```css
@media (max-width: 768px) {
  .my-component {
    padding: var(--space-md);
    font-size: var(--font-sm);
  }
}
```

## Best Practices

### 1. Always Use Variables
✅ DO:
```css
background: var(--glass-bg-light);
color: var(--text-primary);
```

❌ DON'T:
```css
background: rgba(255, 255, 255, 0.02);
color: #e2e8f0;
```

### 2. Maintain Spacing Consistency
Use the spacing scale:
- `--space-xs`: 0.25rem
- `--space-sm`: 0.5rem
- `--space-md`: 1rem
- `--space-lg`: 1.5rem
- `--space-xl`: 2rem
- `--space-2xl`: 2.5rem
- `--space-3xl`: 3rem

### 3. Use Semantic Border Radius
- `--radius-sm`: Small buttons, inputs
- `--radius-md`: Medium components
- `--radius-lg`: Cards, modals
- `--radius-xl`: Larger containers
- `--radius-full`: Fully rounded (avatars, pills)

### 4. Leverage Transitions
- `--transition-fast`: Quick interactions (0.15s)
- `--transition-base`: Standard transitions (0.3s)
- `--transition-slow`: Slow animations (0.5s)
- `--transition-smooth`: Smooth ease (0.3s)

### 5. Shadow Hierarchy
- `--shadow-xs`: Subtle elevation
- `--shadow-sm`: Light shadow
- `--shadow-md`: Standard shadow
- `--shadow-lg`: Deep shadow
- `--shadow-xl`: Very deep shadow

### 6. No Duplication
- Each design decision is stored in variables
- Pages should ONLY contain page-specific overrides
- General styles go in `common.css` or `style.css`

## Color Palette Reference

### Dark Theme
| Variable | Color | Usage |
|----------|-------|-------|
| `--accent` | #ccff00 | Primary action, highlights |
| `--accent-alt` | #00e5ff | Secondary accent, info |
| `--success` | #00ff88 | Success states |
| `--error` | #ff4081 | Errors, warnings |
| `--warning` | #ffb81c | Warnings, caution |
| `--text-primary` | #e2e8f0 | Main text |
| `--text-secondary` | 70% opacity | Secondary text |
| `--text-tertiary` | 40% opacity | Tertiary text |

### Light Theme
| Variable | Color | Usage |
|----------|-------|-------|
| `--accent` | #0066ff | Primary action, highlights |
| `--accent-alt` | #00b4d8 | Secondary accent, info |
| `--text-primary` | #1a1a2e | Main text |

## Mobile Responsiveness

### Breakpoints
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px
- Small Mobile: < 480px

### Key Mobile Adjustments
- Reduce padding on small screens
- Stack layouts vertically
- Increase touch targets (min 44px)
- Simplify navigation
- Hide non-essential elements

## Accessibility

### Color Contrast
- Text on backgrounds meets WCAG AA standards
- Light theme: 7:1 contrast ratio
- Dark theme: 7:1 contrast ratio

### Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Focus States
All interactive elements have visible focus:
```css
input:focus {
  outline: none;
  box-shadow: var(--glow-accent);
}
```

## Performance Tips

1. **Use CSS Variables** - Native browser support, no runtime overhead
2. **Backdrop Filter** - Blur effects on GPU
3. **Transform Animations** - Use `transform` instead of position
4. **Will-change** - Hint browser for animations
5. **Contain** - Use `contain: layout` for paint optimization

## Troubleshooting

### Theme not changing?
- Ensure `data-theme="light"` is on the body element
- Clear browser cache
- Check z-index stacking

### Colors look different?
- Verify you're using variables, not hardcoded colors
- Check if light theme CSS is loading
- Inspect computed styles in DevTools

### Animations choppy?
- Check for `will-change` usage
- Verify `transform` vs `position` animations
- Profile in DevTools Performance tab

## Future Enhancements

- [ ] CSS custom properties for dynamic theme switching
- [ ] SASS/SCSS for more advanced features
- [ ] CSS Grid for complex layouts
- [ ] CSS Container Queries for component-scoped styles
- [ ] Advanced micro-interactions