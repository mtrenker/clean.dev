import type { TElement, TText, Value } from 'platejs';

/**
 * Element type keys used by the document editor.
 *
 * These names are intentionally **generic** — they describe layout/semantic
 * roles, not a specific document kind. The same set composes a CV, a client
 * report, a proposal, or a blog post.
 */
export const DocElement = {
  /* Basic content nodes (provided by @platejs/basic-nodes) */
  Paragraph: 'p',
  H1: 'h1',
  H2: 'h2',
  H3: 'h3',
  Blockquote: 'blockquote',
  Hr: 'hr',

  /* Document-layout nodes (provided by this package) */
  Cover: 'cover',
  DocTitle: 'doc-title',
  DocSubtitle: 'doc-subtitle',
  Eyebrow: 'eyebrow',
  Section: 'section',
  Callout: 'callout',
  Columns: 'columns',
  Column: 'column',
  Card: 'card',
  KeyValue: 'key-value',
  KeyValueItem: 'key-value-item',
  PageBreak: 'page-break',
} as const;

export type DocElementType = (typeof DocElement)[keyof typeof DocElement];

/** Text mark keys (provided by @platejs/basic-nodes). */
export const DocMark = {
  Bold: 'bold',
  Italic: 'italic',
  Underline: 'underline',
  Strikethrough: 'strikethrough',
  Code: 'code',
  Highlight: 'highlight',
} as const;

export type DocMarkType = (typeof DocMark)[keyof typeof DocMark];

/** Block-level text alignment used by printable text/layout elements. */
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

/** Common props supported by text-like blocks. */
export interface TextBlockProps {
  align?: TextAlign;
}

/** Callout visual variants. Generic, not tied to any document kind. */
export type CalloutVariant = 'note' | 'info' | 'success' | 'warning' | 'accent';

/* ------------------------------------------------------------------ *
 * Typed element shapes
 *
 * Consumers can build document values directly against these types, or
 * use the `b.*` builder helpers exported from the package.
 * ------------------------------------------------------------------ */

export interface CalloutElement extends TElement, TextBlockProps {
  type: typeof DocElement.Callout;
  variant?: CalloutVariant;
  title?: string;
}

export interface ColumnElement extends TElement {
  type: typeof DocElement.Column;
  /** Optional flex ratio for this column (defaults to 1). */
  ratio?: number;
}

export interface ColumnsElement extends TElement {
  type: typeof DocElement.Columns;
  children: ColumnElement[];
}

export interface CardElement extends TElement, TextBlockProps {
  type: typeof DocElement.Card;
  /** Short marginal label, e.g. a year, a step number, a status. */
  aside?: string;
  /** Card heading. */
  title?: string;
  /** Secondary heading shown next to / under the title. */
  meta?: string;
  /** Generic tag chips (technologies, topics, categories…). */
  tags?: string[];
}

export interface KeyValueItemElement extends TElement, TextBlockProps {
  type: typeof DocElement.KeyValueItem;
  label?: string;
}

export interface PageBreakElement extends TElement {
  type: typeof DocElement.PageBreak;
  children: [{ text: '' }];
}

/** A document value is a Plate value (array of top-level blocks). */
export type DocumentValue = Value;

export type { TElement, TText, Value };
