# 👨‍💻 CSS System Developer Guide

## Quick Start for Developers

### Understanding the System

The new CSS system is built on **design tokens** - values stored in CSS variables that define every aspect of the design. This means:

1. **No hardcoded values** - Everything uses variables
2. **Consistent design** - Same values everywhere
3. **Easy theme switching** - Just override variables
4. **Easy maintenance** - Change once, update everywhere

### The Golden Rule

> **Always use CSS variables instead of hardcoded values**

❌ Wrong:
```css
.my-card {
  background: rgba(255, 255, 255, 0.02);
  color: #e2e8f0;
  border: 1px solid rgba(204, 255, 0, 0.1);
}
```

✅ Right:
```css
.my-card {
  background: var(--glass-bg-light);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}
```

---

## File Organization & Responsibilities

### `variables.css` - Design Tokens ONLY
**What goes here:** ONLY CSS custom property definitions
```css
:root {
  /* Colors */
  --accent: #ccff00;
  
  /* Shadows */
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.2);
  
  /* Transitions */
  --transition-base: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}
```

**What NEVER goes here:** Any actual CSS rules or selectors

### `common.css` - Base Styles & Fundamentals
**What goes here:**
- HTML/body resets
- Typography base styles
- Button base styles
- Card base styles
- Basic animations
- Scrollbar styling

**What does NOT go here:**
- Page-specific layouts
- Advanced components
- Component-specific animations

**Example:**
```css
/* ✅ Good - Base button styling */
button {
  padding: var(--space-md) var(--space-lg);
  background: transparent;
  border: 1px solid var(--accent);
  transition: var(--transition-base);
}

/* ❌ Bad - Too specific */
.header-button {
  position: absolute;
  right: 0;
  top: 0;
}
```

### `animations.css` - Reusable Animation Library
**What goes here:**
- Keyframe animations
- Animation utility classes
- Stagger animations

**What does NOT go here:**
- Component-specific animations
- Page-specific animations

**Example:**
```css
/* ✅ Good - Reusable animation */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease both;
}

/* ❌ Bad - Too specific */
@keyframes articleEnter {
  /* ... component-specific ... */
}
```

### `style.css` - Component Patterns
**What goes here:**
- `.card`, `.card-primary`, `.card-featured`
- `.badge`, `.tag`
- `.alert`, `.alert-success`, etc.
- `.avatar`
- `.table`
- Utility classes (spacing, text, flex)

**Example:**
```css
/* ✅ Good - Reusable component pattern */
.alert {
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  background: var(--glass-bg-light);
  border-left: 4px solid var(--accent);
}

/* ❌ Bad - Too specific to one use case */
.form-error {
  margin-top: 12px;
  position: absolute;
  left: 0;
  top: 100%;
}
```

### `components.css` - Advanced Reusable Components
**What goes here:**
- Modals & Dialogs
- Dropdowns & Menus  
- Tooltips
- Tabs
- Accordion
- Toast/Notifications
- Pagination

**What does NOT go here:**
- Page-specific components
- Single-use components

### `pages-layout.css` - Page-Specific ONLY
**What goes here:**
- Page header styling
- Grid/list layouts for that page
- Page-specific overrides
- Page-specific components

**What does NOT go here:**
- Reusable component patterns
- General card styling

**Example:**
```css
/* ✅ Good - Page-specific layout */
.articles-grid {
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-2xl);
}

/* ❌ Bad - This should be in common.css or style.css */
.card {
  padding: 20px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
}
```

### `responsive.css` - Mobile-First Breakpoints
**What goes here:**
- Media query breakpoints
- Responsive adjustments for ALL files
- Accessibility preferences

**Important:** Use media queries to override styles from other files, don't duplicate them.

---

## Creating New Components

### Step 1: Is this reusable?
- **Yes, multiple pages use it** → Goes in `style.css` or `components.css`
- **No, only for one page** → Goes in `pages-layout.css`

### Step 2: Plan the structure

```css
/* Base style for the component */
.my-component {
  background: var(--glass-bg-light);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  transition: var(--transition-base);
}

/* Hover state */
.my-component:hover {
  background: var(--glass-bg-medium);
  border-color: var(--border-light);
  transform: translateY(-4px);
  box-shadow: var(--shadow-md), var(--glow-accent);
}

/* Variant 1 */
.my-component-primary {
  border-color: var(--border-light);
}

/* Variant 2 */
.my-component-success {
  border-left: 4px solid var(--success);
}
```

### Step 3: Add to appropriate file

**Reusable component:**
```css
/* In style.css or components.css */
.my-component { ... }
```

**Page-specific:**
```css
/* In pages-layout.css or Articles.css */
.articles-my-component { ... }
```

---

## Design Tokens Reference

### Colors
```css
/* Primary Accent */
var(--accent)           /* #ccff00 (dark), #0066ff (light) */
var(--accent-alt)       /* #00e5ff (dark), #00b4d8 (light) */

/* Text */
var(--text-primary)     /* Main text */
var(--text-secondary)   /* Secondary text (70% opacity) */
var(--text-tertiary)    /* Tertiary text (40% opacity) */
var(--text-muted)       /* Muted text (25% opacity) */

/* Status */
var(--success)          /* Success messages */
var(--error)            /* Error messages */
var(--warning)          /* Warning messages */
var(--info)             /* Info messages */

/* Background */
var(--bg-primary)       /* Main background */
var(--bg-secondary)     /* Secondary background */
var(--bg-tertiary)      /* Tertiary background */

/* Glass Effect */
var(--glass-bg-light)   /* Light glass background */
var(--glass-bg-medium)  /* Medium glass background */
var(--glass-bg-heavy)   /* Heavy glass background */

/* Border */
var(--border-primary)   /* Primary border */
var(--border-secondary) /* Secondary border */
var(--border-light)     /* Light border */

/* Shadows */
var(--shadow-xs)        /* Extra small shadow */
var(--shadow-sm)        /* Small shadow */
var(--shadow-md)        /* Medium shadow */
var(--shadow-lg)        /* Large shadow */
var(--shadow-xl)        /* Extra large shadow */

/* Glow Effects */
var(--glow-accent)      /* Accent glow */
var(--glow-accent-alt)  /* Alt accent glow */
```

### Spacing Scale
```css
var(--space-xs)    /* 0.25rem */
var(--space-sm)    /* 0.5rem */
var(--space-md)    /* 1rem */
var(--space-lg)    /* 1.5rem */
var(--space-xl)    /* 2rem */
var(--space-2xl)   /* 2.5rem */
var(--space-3xl)   /* 3rem */
```

### Border Radius
```css
var(--radius-sm)   /* 4px */
var(--radius-md)   /* 8px */
var(--radius-lg)   /* 12px */
var(--radius-xl)   /* 16px */
var(--radius-2xl)  /* 20px */
var(--radius-full) /* 9999px */
```

### Typography
```css
var(--font-family)          /* 'Assistant', sans-serif */
var(--font-mono)            /* 'JetBrains Mono', monospace */
var(--font-weight-light)    /* 300 */
var(--font-weight-normal)   /* 400 */
var(--font-weight-medium)   /* 500 */
var(--font-weight-semibold) /* 600 */
var(--font-weight-bold)     /* 700 */
var(--font-weight-black)    /* 900 */
```

### Animations
```css
var(--transition-fast)      /* 0.15s ease */
var(--transition-base)      /* 0.3s ease */
var(--transition-slow)      /* 0.5s ease */
var(--transition-smooth)    /* 0.3s smooth ease */
```

---

## Common Patterns

### Card with Hover Effect
```css
.card {
  background: var(--glass-bg-light);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  transition: var(--transition-base);
}

.card:hover {
  background: var(--glass-bg-medium);
  border-color: var(--border-light);
  box-shadow: var(--shadow-md), var(--glow-accent);
  transform: translateY(-4px);
}
```

### Animated Entry
```css
.card {
  animation: fadeInUp 0.6s ease both;
}

.card:nth-child(1) { animation-delay: 0.05s; }
.card:nth-child(2) { animation-delay: 0.1s; }
.card:nth-child(3) { animation-delay: 0.15s; }
```

### Button with State
```css
.btn {
  padding: var(--space-md) var(--space-lg);
  background: transparent;
  border: 1.5px solid var(--accent);
  color: var(--accent);
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
  cursor: pointer;
}

.btn:hover {
  background: var(--accent);
  color: var(--bg-primary);
  box-shadow: var(--glow-accent);
}

.btn:active {
  transform: scale(0.95);
}

.btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Form Focus State
```css
input,
textarea {
  background: var(--glass-bg-light);
  border: 1.5px solid var(--border-primary);
  color: var(--text-primary);
  transition: var(--transition-base);
}

input:focus,
textarea:focus {
  outline: none;
  background: var(--glass-bg-medium);
  border-color: var(--accent);
  box-shadow: var(--glow-accent);
}
```

---

## Responsive Tips

### Mobile-First Approach
```css
/* Base styles for mobile */
.card {
  grid-template-columns: 1fr;
  padding: var(--space-md);
}

/* Tablet and up */
@media (min-width: 768px) {
  .card {
    grid-template-columns: repeat(2, 1fr);
    padding: var(--space-lg);
  }
}

/* Desktop and up */
@media (min-width: 1025px) {
  .card {
    grid-template-columns: repeat(3, 1fr);
    padding: var(--space-2xl);
  }
}
```

### Touch Targets
```css
/* Ensure clickable elements are at least 44px */
button,
.link,
input[type="checkbox"] {
  min-height: 44px;
  min-width: 44px;
}
```

### Typography Scaling
```css
/* Use clamp for fluid typography */
h1 {
  font-size: clamp(var(--font-2xl), 4vw, var(--font-4xl));
}
```

---

## Testing the Design System

### Checklist for New Components
- [ ] Uses only CSS variables (no hardcoded values)
- [ ] Has hover states
- [ ] Has focus states (if interactive)
- [ ] Works in light theme
- [ ] Works in dark theme
- [ ] Responsive on mobile
- [ ] Smooth animations (no jank)
- [ ] Accessible (proper contrast, focus visible)

### Testing Light Theme
```javascript
// In browser console
document.body.setAttribute('data-theme', 'light');
```

### Testing Reduced Motion
```css
/* In DevTools - Add to CSS */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Common Mistakes to Avoid

### ❌ Hardcoding Colors
```css
/* Wrong */
.card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(204, 255, 0, 0.1);
}
```

### ✅ Using Variables
```css
/* Right */
.card {
  background: var(--glass-bg-light);
  border: 1px solid var(--border-primary);
}
```

### ❌ Duplicating Component Styles
```css
/* Wrong - These are almost identical */
.card { /* ... */ }
.item-card { /* ... similar ... */ }
.post-card { /* ... similar ... */ }
```

### ✅ Using Base + Variants
```css
/* Right - One base, variants for differences */
.card { /* Base styles */ }
.card-featured { /* Just the differences */ }
.card-success { /* Just the differences */ }
```

### ❌ Page-Specific Variables
```css
/* Wrong - Should be in variables.css */
.page-padding {
  padding: 32px 24px;
}
```

### ✅ Using System Variables
```css
/* Right */
.page-container {
  padding: var(--space-2xl) var(--space-lg);
}
```

---

## Extending the System

### Adding New Colors
1. Edit `variables.css`
2. Add both dark and light variants
3. Test in both themes

### Adding New Animation
1. Create keyframes in `animations.css`
2. Create utility class (e.g., `.animate-my-animation`)
3. Add to stagger patterns if appropriate

### Adding New Component
1. Create in appropriate file (style.css or components.css)
2. Use existing variables
3. Include hover states
4. Add to responsive.css if needed
5. Document the component

---

## Performance Tips

- Use `transform` instead of `position` for animations
- Use `backdrop-filter: blur()` for glass effects (GPU accelerated)
- Minimize repaints with `will-change: transform`
- Lazy-load heavy animations
- Use `prefers-reduced-motion` for accessibility

---

## Resources

- **CSS Documentation:** `/frontend/src/css/README.md`
- **Design Summary:** `/DESIGN_SYSTEM_SUMMARY.md`
- **Variables:** `/frontend/src/css/variables.css`
- **Examples:** Look at existing components in `style.css`

---

## Questions?

When in doubt:
1. Check `variables.css` for available tokens
2. Look for similar components in `style.css`
3. Check `common.css` for base patterns
4. Reference the README.md for guidelines

Remember: **Use variables, avoid duplication, think reusable!** 🚀