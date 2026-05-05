# 🎨 CSS Utility Classes & Effects - Quick Reference

## Color & Glow Effects

### Accent Colors
```html
<!-- Cyan (Primary) -->
<span class="accent-primary">Glowing Cyan Text</span>

<!-- Green (Success) -->
<span class="accent-secondary">Lime Green Accent</span>

<!-- Pink (Highlight) -->
<span class="accent-tertiary">Hot Pink Highlight</span>

<!-- Purple (Secondary) -->
<span class="accent-purple">Purple Accent</span>
```

## Button Variants

### Primary Button
```html
<button class="header-cta">Join Now</button>
```
- Cyan gradient
- Bright glow effect
- Shine sweep on hover

### Color Variants
```html
<button class="btn btn-success">Success Action</button>
<button class="btn btn-danger">Delete Item</button>
<button class="btn btn-warning">Warning Action</button>
<button class="btn btn-secondary">Secondary</button>
```

## Card Styling

### Color-Coded Cards
```html
<!-- Default Cyan -->
<div class="cat-card">Category Card</div>

<!-- Success Green -->
<div class="card card-success">Success Card</div>

<!-- Danger Pink -->
<div class="card card-danger">Danger Card</div>

<!-- Warning Orange -->
<div class="card card-warning">Warning Card</div>

<!-- Purple Theme -->
<div class="card card-purple">Purple Card</div>
```

## Text Effects

### Glowing Text
```html
<h1 class="heading-gradient-rainbow">Rainbow Gradient Title</h1>
<p class="text-glow">Pulsing Glow Effect</p>
<p class="text-pulse-primary">Color Pulsing Text</p>
```

## Animation Classes

### Movement Animations
```html
<div class="float-subtle">Floating Element</div>
<div class="bounce-gentle">Gentle Bounce</div>
```

## Border Effects

### Neon Borders
```html
<!-- Cyan Neon Border -->
<div class="neon-border-cyan">Neon Container</div>

<!-- Purple Neon Border -->
<div class="neon-border-purple">Purple Neon</div>

<!-- Pink Neon Border -->
<div class="neon-border-pink">Pink Neon</div>
```

## Link Effects

### Animated Underlines
```html
<a href="#" class="link-animated">Hover for animated underline</a>
```

## Alert Types

### Success Alert
```html
<div class="alert alert-success">
  <div class="alert-icon">✓</div>
  <div class="alert-content">
    <div class="alert-title">Success!</div>
    <div class="alert-message">Operation completed successfully</div>
  </div>
</div>
```

### Error Alert
```html
<div class="alert alert-error">
  <div class="alert-icon">✕</div>
  <div class="alert-content">
    <div class="alert-title">Error</div>
    <div class="alert-message">Something went wrong</div>
  </div>
</div>
```

### Warning Alert
```html
<div class="alert alert-warning">
  <div class="alert-icon">!</div>
  <div class="alert-content">
    <div class="alert-title">Warning</div>
    <div class="alert-message">Please be careful</div>
  </div>
</div>
```

### Info Alert
```html
<div class="alert alert-info">
  <div class="alert-icon">ℹ</div>
  <div class="alert-content">
    <div class="alert-title">Info</div>
    <div class="alert-message">Here's some information</div>
  </div>
</div>
```

## Badge Styles

### Color Variants
```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-danger">Danger</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-outline">Outline</span>
```

## Modal Components

### Modal with Header
```html
<div class="modal-overlay active">
  <div class="modal">
    <div class="modal-header">
      <h2 class="modal-title">Modal Title</h2>
      <button class="modal-close">×</button>
    </div>
    <div class="modal-body">
      Modal content goes here...
    </div>
    <div class="modal-footer">
      <button class="modal-btn secondary">Cancel</button>
      <button class="modal-btn primary">Confirm</button>
    </div>
  </div>
</div>
```

## Form Inputs

### Input with Neon Focus
```html
<input type="text" placeholder="Type here..." />
<textarea placeholder="Enter message..."></textarea>
<select>
  <option>Select option</option>
</select>
```
- Cyan border on focus
- Intense glow on focus
- 1.5px border with gradients

## Progress Bar

### Animated Progress
```html
<div class="progress">
  <div class="progress-bar animated" style="width: 75%"></div>
</div>
```

## Pagination

### Pagination Links
```html
<div class="pagination">
  <a class="pagination-link disabled">←</a>
  <a class="pagination-link">1</a>
  <a class="pagination-link active">2</a>
  <a class="pagination-link">3</a>
  <a class="pagination-link">→</a>
</div>
```

## Loading States

### Spinner
```html
<div class="loader"></div>
<div class="loader loader-lg"></div>
```

### Skeleton Loading
```html
<div class="skeleton skeleton-heading"></div>
<div class="skeleton skeleton-text"></div>
<div class="skeleton skeleton-text"></div>
```

## Tags

### Tag with Close Button
```html
<span class="tag">
  Important Tag
  <span class="tag-close">×</span>
</span>
```

## Tooltip

### Hoverable Tooltip
```html
<div class="tooltip-wrapper">
  <span>Hover me</span>
  <div class="tooltip">This is a tooltip</div>
</div>
```

## CSS Variables Available

```css
:root {
  /* Primary Colors */
  --accent: #00f0ff;
  --accent-bright: #00ffff;
  --accent-secondary: #00ff88;
  --accent-tertiary: #ff006e;
  --accent-purple: #a855f7;
  --accent-pink: #ff1493;
  --accent-orange: #ff6b00;
  --accent-lime: #00ff88;
  --accent-violet: #b537f2;
  
  /* Glow Effects */
  --glow-cyan: 0 0 20px rgba(0, 240, 255, 0.3);
  --glow-purple: 0 0 20px rgba(168, 85, 247, 0.3);
  --glow-pink: 0 0 20px rgba(255, 0, 110, 0.3);
  --glow-green: 0 0 20px rgba(0, 255, 136, 0.3);
  --glow-orange: 0 0 20px rgba(255, 107, 0, 0.3);
}
```

## Animation Classes

### Glow Effects
```css
.glow-effect { animation: neonGlow 2s ease-in-out infinite; }
.float-effect { animation: floatUp 3s ease-in-out infinite; }
.shimmer-effect { animation: shimmerLine 2s infinite; }
.text-glow { animation: textGlowEffect 2s ease-in-out infinite; }
```

### Gradient Effects
```css
.heading-gradient-rainbow { /* Animated rainbow gradient */ }
.color-shift-on-hover { /* Color changes on hover */ }
```

---

## Design Tips

### 1. Color Hierarchy
- Use Cyan for primary actions
- Use Green for positive feedback
- Use Pink/Red for critical actions
- Use Orange for warnings
- Use Purple for secondary elements

### 2. Spacing
- Cards: 20-28px padding
- Containers: 24px padding
- Between sections: 40-60px margin
- Between elements: 12-16px gap

### 3. Border Radius
- Buttons: 10px
- Cards: 14-16px
- Inputs: 10px
- Modals: 16px

### 4. Hover Effects
- Scale: 1.02-1.05
- Translate Y: -3px to -8px
- Glow Intensification: +20px box-shadow range

### 5. Animation Timing
- Quick interactions: 0.2-0.3s
- Smooth transitions: 0.3-0.4s
- Background animations: 2-4s loops
- Entrance animations: 0.5-0.8s

---

## Keyboard Shortcuts & Focus

All interactive elements have proper focus states:
- Outline: 2px solid rgba(0, 240, 255, 0.35)
- Outline-offset: 4px
- Border-radius: 6px

This ensures accessibility for keyboard navigation!

---

**Updated**: May 5, 2026
**Version**: 2.0
