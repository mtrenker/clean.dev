import type { Config } from 'tailwindcss';

/**
 * Tailwind configuration
 *
 * All colour, radius, shadow, and ring values reference CSS variables defined
 * in src/styles/tokens.css. Changing a CSS variable automatically updates
 * every Tailwind utility that consumes it — this is the "single source of
 * truth" guarantee.
 *
 * To add a new theme, override the CSS variables in tokens.css (see the
 * THEME OVERRIDE EXAMPLES section) and the Tailwind utilities will follow.
 */
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class'],
  theme: {
    extend: {
      /* ── Colors ─────────────────────────────────────────────────────────────
       * Each entry maps a semantic role to the matching CSS variable so that
       * Tailwind utilities (bg-background, text-foreground, …) always respect
       * the active theme without any hard-coded hex / hsl values in components.
       * ──────────────────────────────────────────────────────────────────────── */
      colors: {
        /* Surfaces */
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        /* Muted */
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },

        /* Accent / brand */
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },

        /* Border */
        border: 'hsl(var(--border))',

        /* Card */
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        /* Popover / overlay */
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },

        /* Form input */
        input: 'hsl(var(--input))',

        /* Focus ring */
        ring: 'hsl(var(--ring))',

        /* Status — Success */
        success: {
          DEFAULT:    'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },

        /* Status — Warning */
        warning: {
          DEFAULT:    'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },

        /* Status — Destructive / Error */
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },

        /* Status — Info */
        info: {
          DEFAULT:    'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
      },

      /* ── Typography ────────────────────────────────────────────────────────── */
      fontFamily: {
        serif: ['var(--font-serif-google)', 'Georgia', 'serif'],
        sans: ['var(--font-sans-google)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono-google)', 'Menlo', 'monospace'],
      },

      /* ── Border width ──────────────────────────────────────────────────────── */
      borderWidth: {
        DEFAULT: 'var(--border-width)',
      },

      /* ── Border radius ─────────────────────────────────────────────────────── */
      borderRadius: {
        none:   'var(--radius-none)',
        sm:     'var(--radius-sm)',
        DEFAULT: 'var(--radius-base)',
        md:     'var(--radius-md)',
        lg:     'var(--radius-lg)',
        xl:     'var(--radius-xl)',
        '2xl':  'var(--radius-2xl)',
        '3xl':  'var(--radius-3xl)',
        full:   'var(--radius-full)',
      },

      /* ── Elevation — Box shadows ───────────────────────────────────────────── */
      boxShadow: {
        sm:      'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-base)',
        md:      'var(--shadow-md)',
        lg:      'var(--shadow-lg)',
        xl:      'var(--shadow-xl)',
        inner:   'var(--shadow-inner)',
        none:    'none',
      },

      /* ── Ring ──────────────────────────────────────────────────────────────── */
      ringColor: {
        DEFAULT: 'hsl(var(--ring))',
      },

      /* ── Transitions ───────────────────────────────────────────────────────── */
      transitionDuration: {
        base: 'var(--transition-base)',
        long: 'var(--transition-long)',
      },

      /* ── Background images ─────────────────────────────────────────────────── */
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
  ],
};

export default config;
