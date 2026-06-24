/**
 * Page & document configuration.
 *
 * All physical dimensions are expressed in **millimetres** so that on-screen
 * preview (rendered at the CSS reference of 96dpi) and printed / PDF output
 * line up exactly. The editor converts these values into CSS custom
 * properties consumed by `styles/docs.css`.
 */

export type PageOrientation = 'portrait' | 'landscape';

export interface PageDimensions {
  /** Width in millimetres (portrait). */
  width: number;
  /** Height in millimetres (portrait). */
  height: number;
}

/** Built-in paper sizes (portrait, millimetres). */
export const PAGE_SIZES = {
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
} as const satisfies Record<string, PageDimensions>;

export type PageSizeName = keyof typeof PAGE_SIZES;

export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PageConfig {
  /** Named paper size or explicit portrait dimensions in millimetres. */
  size: PageSizeName | PageDimensions;
  orientation: PageOrientation;
  /** Content margins (the printable inset) in millimetres. */
  margin: PageMargins;
  /**
   * Render visual page-boundary guides in page mode so authors can see where
   * content will break across printed pages.
   */
  showPageGuides: boolean;
  /** Gap between pages / around the sheet in the on-screen gutter (px). */
  gutter: number;
}

/**
 * Document theme tokens. Every value maps to a CSS custom property, so a
 * consumer can re-theme the whole document by passing a partial override —
 * no Tailwind or app stylesheet required.
 */
export interface DocumentTheme {
  /** Page (paper) background. */
  paper: string;
  /** Gutter / canvas background behind the pages. */
  canvas: string;
  /** Primary ink colour. */
  ink: string;
  /** Secondary / body text colour. */
  inkSoft: string;
  /** Muted text colour (labels, captions). */
  inkMuted: string;
  /** Accent colour (kickers, rules, links, callouts). */
  accent: string;
  /** Hairline / border colour. */
  border: string;
  /** Strong rule colour (header/footer separators). */
  rule: string;
  /** Chip / subtle surface background. */
  surface: string;
  /** Display / heading font stack. */
  fontDisplay: string;
  /** Body font stack. */
  fontBody: string;
  /** Monospace / label font stack. */
  fontMono: string;
  /** Base body font size (px). */
  fontSize: number;
  /** Page drop shadow. */
  shadow: string;
}

const DEFAULT_MARGIN: PageMargins = { top: 18, right: 18, bottom: 18, left: 18 };

export const defaultPageConfig: PageConfig = {
  size: 'A4',
  orientation: 'portrait',
  margin: DEFAULT_MARGIN,
  showPageGuides: true,
  gutter: 32,
};

/**
 * Default theme — an editorial, print-grade look (warm paper, pine accent,
 * Space Grotesk display / IBM Plex body & mono). Inspired by a refined
 * document/CV aesthetic but carries no document-specific content.
 *
 * The font stacks degrade gracefully to system fonts; load the webfonts in
 * the host app for the full effect (see README).
 */
export const defaultTheme: DocumentTheme = {
  paper: '#fbfaf7',
  canvas: '#e9e7e0',
  ink: '#16181d',
  inkSoft: '#3a3d44',
  inkMuted: '#8a8d92',
  accent: '#2f6f6a',
  border: '#e6e3da',
  rule: '#16181d',
  surface: '#f0eee7',
  fontDisplay: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
  fontBody: "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif",
  fontMono: "'IBM Plex Mono', ui-monospace, 'SF Mono', monospace",
  fontSize: 14,
  shadow: '0 4px 30px rgba(20, 24, 29, 0.13)',
};

/** Resolve a size (named or explicit) to portrait dimensions in millimetres. */
export function resolvePageSize(size: PageConfig['size']): PageDimensions {
  return typeof size === 'string' ? PAGE_SIZES[size] : size;
}

/** Effective page dimensions accounting for orientation. */
export function effectiveDimensions(config: PageConfig): PageDimensions {
  const base = resolvePageSize(config.size);
  if (config.orientation === 'landscape') {
    return { width: base.height, height: base.width };
  }
  return base;
}

/** Merge a partial page config onto the defaults. */
export function resolvePageConfig(partial?: Partial<PageConfig>): PageConfig {
  return {
    ...defaultPageConfig,
    ...partial,
    margin: { ...defaultPageConfig.margin, ...partial?.margin },
  };
}

/** Merge a partial theme onto the defaults. */
export function resolveTheme(partial?: Partial<DocumentTheme>): DocumentTheme {
  return { ...defaultTheme, ...partial };
}

/**
 * Build the inline CSS custom properties for a page + theme. Spread onto the
 * editor root element's `style`.
 */
export function pageCssVariables(
  config: PageConfig,
  theme: DocumentTheme,
): Record<string, string> {
  const dims = effectiveDimensions(config);
  return {
    '--pdoc-page-width': `${dims.width}mm`,
    '--pdoc-page-height': `${dims.height}mm`,
    '--pdoc-margin-top': `${config.margin.top}mm`,
    '--pdoc-margin-right': `${config.margin.right}mm`,
    '--pdoc-margin-bottom': `${config.margin.bottom}mm`,
    '--pdoc-margin-left': `${config.margin.left}mm`,
    '--pdoc-gutter': `${config.gutter}px`,
    '--pdoc-paper': theme.paper,
    '--pdoc-canvas': theme.canvas,
    '--pdoc-ink': theme.ink,
    '--pdoc-ink-soft': theme.inkSoft,
    '--pdoc-ink-muted': theme.inkMuted,
    '--pdoc-accent': theme.accent,
    '--pdoc-border': theme.border,
    '--pdoc-rule': theme.rule,
    '--pdoc-surface': theme.surface,
    '--pdoc-font-display': theme.fontDisplay,
    '--pdoc-font-body': theme.fontBody,
    '--pdoc-font-mono': theme.fontMono,
    '--pdoc-font-size': `${theme.fontSize}px`,
    '--pdoc-shadow': theme.shadow,
  };
}
