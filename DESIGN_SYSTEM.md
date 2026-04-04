# Design System

This document describes the design system for clean.dev, built with a
token-based architecture for easy theming and maintenance.

## Philosophy

The design system follows a **"Neue Brutalismus"** aesthetic — refined
architectural brutalism with massive typography hierarchy, a terracotta/rust
accent, dramatic negative space, and precise interactions. All design choices
prioritize mobile-first responsiveness (320px+) and WCAG AA accessibility.

The system is built on CSS variables (custom properties) and Tailwind
utilities, allowing for:

- **Easy theming**: Switch between light/dark or create new themes by changing
  CSS variables
- **Consistency**: All components use the same tokens
- **Maintainability**: Update colors/spacing in one place, reflected everywhere
- **Type-safety**: Tailwind's IntelliSense works with all tokens
- **Accessibility**: WCAG AA contrast ratios, visible focus states, skip-to-content

## Color System

### Semantic Colors

All colors are defined as HSL values in CSS variables:

```css
--background: 35 25% 96%;           /* warm stone cream */
--foreground: 20 20% 10%;           /* deep warm charcoal */
--muted: 30 12% 88%;               /* warm gray */
--muted-foreground: 20 8% 42%;     /* mid warm gray — WCAG AA */
--accent: 10 72% 38%;              /* terracotta / rust */
--accent-foreground: 35 25% 96%;   /* cream on accent */
--border: 20 20% 10%;              /* same as foreground */
--card: 35 20% 99%;                /* near-white warm */
--card-foreground: 20 20% 10%;     /* deep charcoal */
```

### Usage in Tailwind

```tsx
<div className="bg-background text-foreground">
  <button className="bg-accent text-accent-foreground">Click me</button>
  <p className="text-muted-foreground">Secondary text</p>
</div>;
```

### Dark Theme

The `.dark` class switches to dark mode, and auto dark mode is activated via
`prefers-color-scheme: dark` media query.

```css
.dark {
  --background: 20 20% 7%;          /* deep warm black */
  --foreground: 30 12% 90%;         /* warm off-white */
  --muted: 20 12% 16%;             /* dark warm gray */
  --muted-foreground: 20 8% 58%;   /* mid warm — WCAG AA */
  --accent: 10 72% 56%;            /* brighter terracotta */
  --border: 30 10% 25%;            /* subtle warm border */
  --card: 20 15% 11%;              /* slightly lighter dark */
}
```

## Typography

### Font Families

```css
--font-serif: 'Syne', 'Arial Black', sans-serif;     /* Display / headings */
--font-sans: 'Plus Jakarta Sans', system-ui, sans-serif; /* Body text */
--font-mono: 'Fira Code', Menlo, monospace;           /* Code / labels */
```

Note: "font-serif" is used for the display/heading font (Syne) despite the
CSS variable name. This maintains backwards compatibility with existing
Tailwind classes (`font-serif`).

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

## Accessibility

### Skip-to-Content Link

A visually hidden skip-to-content link is included in the layout. It becomes
visible on keyboard focus:

```tsx
<a href="#main-content" className="skip-to-content">
  Skip to content
</a>
```

### Focus States

All interactive elements have visible focus states using `focus-visible`:

```css
:focus-visible {
  outline: 3px solid hsl(var(--focus-ring));
  outline-offset: 2px;
}
```

### Contrast

All text/background combinations meet WCAG AA contrast ratios (4.5:1 for
normal text, 3:1 for large text) in both light and dark modes.

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

## Navigation

### Mobile Navigation

On screens below `md` (768px), the main navigation collapses into a hamburger
menu that opens a slide-in drawer from the right. The drawer includes focus
trapping and `Escape` key dismissal.

### Desktop Navigation

On `md+` screens, navigation items are displayed inline in the header.

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
--section-padding-y: 5rem;   /* 80px - Vertical section padding */
--container-max-width: 80rem; /* 1280px - Max content width */
```

### Borders

```css
--border-width: 2px; /* Standard border width */
```

### Transitions

```css
--transition-base: 180ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
--transition-long: 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
--animation-fade-in: 800ms ease-out;
```

### Focus

```css
--focus-ring: 10 72% 38%; /* Matches accent color */
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
5. **Responsive by default**: Use the responsive variants (sm:, md:, lg:, etc.)
6. **Mobile-first**: Start with mobile styles, add breakpoints for larger screens
7. **Accessible**: Ensure WCAG AA contrast and visible focus for all interactive elements

## File Structure

```
apps/web/src/
├── app/
│   ├── globals.css          # Design system CSS variables & components
│   ├── layout.tsx           # Root layout using design tokens
│   ├── page.tsx             # Landing page using design tokens
│   ├── me/page.tsx          # Portfolio (with print optimization)
│   ├── imprint/page.tsx     # Imprint page
│   ├── admin/page.tsx       # Admin dashboard
│   ├── clients/page.tsx     # Client management
│   ├── invoices/
│   │   ├── page.tsx         # Invoice list
│   │   └── [id]/page.tsx    # Invoice detail
│   ├── settings/page.tsx    # Settings page
│   └── time/page.tsx        # Time tracking
├── components/
│   └── ui/
│       ├── section.tsx      # Section wrapper component
│       ├── container.tsx    # Container component
│       ├── heading.tsx      # Heading component
│       ├── button.tsx      # Button component
│       ├── card.tsx        # Card component
│       └── index.ts        # Barrel export
└── tailwind.config.ts       # Tailwind theme configuration
```

## Reusable UI Components

The design system includes reusable React components in `@/components/ui/`:

### Section

Wrapper for page sections with consistent padding and borders.

```tsx
import { Section } from '@/components/ui';

<Section variant="default">
  {/* Content */}
</Section>

<Section variant="inverted">
  {/* Dark section */}
</Section>

<Section variant="accent" noBorder>
  {/* Accent colored section without top border */}
</Section>
```

**Props:**

- `children: React.ReactNode` - Section content
- `className?: string` - Additional CSS classes
- `variant?: 'default' | 'inverted' | 'accent'` - Color scheme
- `noBorder?: boolean` - Remove top border
- `noPadding?: boolean` - Remove section padding

### Container

Centered container with max-width constraints.

```tsx
import { Container } from '@/components/ui';

<Container>
  {/* Default max-width (7xl) */}
</Container>

<Container size="narrow">
  {/* Narrow container (4xl) */}
</Container>

<Container size="wide" className="px-6">
  {/* Wide container with custom padding */}
</Container>
```

**Props:**

- `children: React.ReactNode` - Container content
- `className?: string` - Additional CSS classes
- `size?: 'default' | 'narrow' | 'wide'` - Width constraint

### Heading

Semantic heading component with variants.

```tsx
import { Heading } from '@/components/ui';

<Heading as="h1" variant="display">
  Large Display Heading
</Heading>

<Heading as="h2" variant="section" animate>
  Section Heading (with animation)
</Heading>

<Heading as="h3" variant="label">
  UPPERCASE LABEL
</Heading>
```

**Props:**

- `children: React.ReactNode` - Heading text
- `as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'` - HTML element
- `variant?: 'display' | 'section' | 'label'` - Visual style
- `className?: string` - Additional CSS classes
- `animate?: boolean` - Enable scroll animation

### Button

Button/Link component with variants.

```tsx
import { Button } from '@/components/ui';

<Button href="/contact" variant="primary">
  Get Started
</Button>

<Button variant="secondary" onClick={handleClick}>
  Learn More
</Button>

<Button type="submit" disabled>
  Submit Form
</Button>
```

**Props:**

- `children: React.ReactNode` - Button text
- `href?: string` - Next.js Link href (renders as Link)
- `variant?: 'primary' | 'secondary'` - Visual style
- `className?: string` - Additional CSS classes
- `onClick?: () => void` - Click handler
- `type?: 'button' | 'submit' | 'reset'` - Button type
- `disabled?: boolean` - Disabled state

### Card

Card container with border and padding.

```tsx
import { Card } from '@/components/ui';

<Card>
  <h3>Card Title</h3>
  <p>Card content...</p>
</Card>

<Card animate delay={200}>
  {/* Animated card with delay */}
</Card>
```

**Props:**

- `children: React.ReactNode` - Card content
- `className?: string` - Additional CSS classes
- `animate?: boolean` - Enable scroll animation
- `delay?: number` - Animation delay in milliseconds

## Component Usage Examples

### Page Layout Pattern

```tsx
import { Card, Container, Heading } from "@/components/ui";

const MyPage = () => (
  <main className="bg-background py-10">
    <Container className="px-6">
      <Heading as="h1" variant="display" className="mb-6 text-4xl">
        Page Title
      </Heading>

      <Card>
        {/* Page content */}
      </Card>
    </Container>
  </main>
);
```

### Landing Page Section Pattern

```tsx
import { Container, Heading, Section } from "@/components/ui";

<Section variant="inverted">
  <Container>
    <Heading as="h2" variant="section" animate className="mb-12">
      Section Title
    </Heading>

    {/* Section content */}
  </Container>
</Section>;
```

### Animated Grid Pattern

```tsx
import { Card } from "@/components/ui";

<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
  {items.map((item, index) => (
    <Card key={item.id} animate delay={index * 100}>
      <h3 className="font-serif text-2xl font-bold">{item.title}</h3>
      <p className="text-muted-foreground">{item.description}</p>
    </Card>
  ))}
</div>;
```

## Print Styles (Portfolio Page)

The portfolio page (`/work`) includes special print styles for CV generation:

```tsx
// Screen: Centered with ring
className = "rounded-full ring-2 ring-border print:rounded-none print:ring-0";

// Print: Left-aligned without decorative elements
className = "text-center print:text-start";

// Print: Show sidebar
className = "hidden print:flex";

// Print: Page break before
className = "break-before-page";

// Print: Avoid break inside
className = "break-inside-avoid";
```

**To print the CV:**

1. Navigate to `/work`
2. Use browser print (Ctrl/Cmd + P)
3. The page automatically adjusts for print layout

## Future Enhancements

- [x] Add dark mode toggle component
- [ ] Create more reusable component patterns
- [ ] Add animation variants (slide, scale, etc.)
- [ ] Create spacing scale utilities
- [ ] Add shadow system
- [ ] Create form input components
