# Design System

This document describes the design system for clean.dev, built with a
token-based architecture for easy theming and maintenance.

## Philosophy

The design system is built on CSS variables (custom properties) and Tailwind
utilities, allowing for:

- **Easy theming**: Switch between light/dark or create new themes by changing
  CSS variables
- **Consistency**: All components use the same tokens
- **Maintainability**: Update colors/spacing in one place, reflected everywhere
- **Type-safety**: Tailwind's IntelliSense works with all tokens

## Color System

### Semantic Colors

All colors are defined as HSL values in CSS variables:

```css
--background: 39 10% 98%; /* Main page background */
--foreground: 24 10% 10%; /* Primary text color */
--muted: 24 6% 90%; /* Subtle backgrounds */
--muted-foreground: 24 5% 40%; /* Secondary text */
--accent: 32 95% 44%; /* Brand accent (amber-700) */
--accent-foreground: 24 10% 10%; /* Text on accent */
--border: 24 10% 10%; /* Border color */
--card: 0 0% 100%; /* Card backgrounds */
--card-foreground: 24 10% 10%; /* Card text */
```

### Usage in Tailwind

```tsx
<div className="bg-background text-foreground">
  <button className="bg-accent text-accent-foreground">Click me</button>
  <p className="text-muted-foreground">Secondary text</p>
</div>;
```

### Dark Theme

The `.dark` class switches to dark mode. To enable:

1. Add `class="dark"` to `<html>` element
2. Or uncomment the `@media (prefers-color-scheme: dark)` section in globals.css

## Typography

### Font Families

```css
--font-serif: "Playfair Display", Georgia, serif;
--font-sans: "IBM Plex Sans", system-ui, sans-serif;
--font-mono: "IBM Plex Mono", Menlo, monospace;
```

Usage:

```tsx
<h1 className="font-serif">Heading</h1>
<p className="font-sans">Body text</p>
<code className="font-mono">Code</code>
```

### Typography Components

Pre-built component classes for common patterns:

```tsx
<h1 className="heading-display">Large display heading</h1>
<h2 className="heading-section">Section heading</h2>
<span className="text-label">Uppercase label</span>
```

## Layout Components

### Section

Standard section with consistent padding:

```tsx
<section className="section">
  {/* Content with consistent padding */}
</section>

<section className="section section-border">
  {/* Section with top border */}
</section>
```

### Container

Centered container with max-width:

```tsx
<div className="container-custom">
  {/* Max-width 80rem, centered */}
</div>;
```

## Button Components

### Button Variants

```tsx
{/* Primary button */}
<Link href="/about" className="btn-primary">
  Learn More
</Link>;

{/* Secondary button */}
<Link href="/contact" className="btn-secondary">
  Get in Touch
</Link>;

{/* Custom button */}
<button className="btn bg-accent text-accent-foreground">
  Custom Style
</button>;
```

## Animation System

### Intersection Observer Animations

The `.observe` class enables fade-in animations on scroll:

```tsx
<div className="observe">
  {/* Fades in when scrolled into view */}
</div>

<div className="observe delay-300">
  {/* Fades in with 300ms delay */}
</div>
```

The animation is controlled by the `.animate-in` class added by JavaScript.

## Design Tokens

### Spacing

```css
--section-padding-x: 1.5rem; /* 24px - Horizontal section padding */
--section-padding-y: 6rem; /* 96px - Vertical section padding */
--container-max-width: 80rem; /* 1280px - Max content width */
```

### Borders

```css
--border-width: 2px; /* Standard border width */
```

### Transitions

```css
--transition-base: 150ms ease-in-out; /* Standard transitions */
--transition-long: 300ms ease-in-out; /* Longer transitions */
--animation-fade-in: 1000ms ease-out; /* Scroll animations */
```

## Creating New Themes

To create a new theme, override the color variables:

```css
/* In globals.css */
.theme-custom {
  --background: 220 30% 15%;
  --foreground: 210 20% 95%;
  --accent: 150 80% 45%;
  /* ... other colors */
}
```

Apply to HTML element:

```tsx
<html className="theme-custom">
```

## Best Practices

1. **Always use semantic tokens**: Use `bg-background` instead of `bg-zinc-50`
2. **Use component classes**: Prefer `.btn-primary` over custom button styles
3. **Maintain consistency**: New components should use existing tokens
4. **Theme-aware**: Test all changes in both light and dark themes
5. **Responsive by default**: Use the responsive variants (md:, lg:, etc.)

## File Structure

```
apps/web/src/
├── app/
│   ├── globals.css          # Design system CSS variables & components
│   ├── layout.tsx           # Root layout using design tokens
│   └── page.tsx             # Landing page using design tokens
└── tailwind.config.ts       # Tailwind theme configuration
```

## Future Enhancements

- [x] Add dark mode toggle component
- [ ] Create more reusable component patterns
- [ ] Add animation variants (slide, scale, etc.)
- [ ] Create spacing scale utilities
- [ ] Add shadow system
- [ ] Create form input components
