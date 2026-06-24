/**
 * Small, typed helpers for constructing document values in plain TypeScript.
 *
 * These are optional sugar — a document value is just a Plate value, so you
 * can also write the JSON by hand or load it from a CMS/API.
 *
 * @example
 * import { b } from '@cleandev/docs';
 * const doc = [
 *   b.cover([b.eyebrow('Report'), b.docTitle('Q3 Review'), b.docSubtitle('Acme Inc.')]),
 *   b.section([b.h2('Summary'), b.p('…')]),
 * ];
 */
import {
  DocElement,
  type CalloutVariant,
  type TElement,
  type TextAlign,
} from './types';

type Inline = string | TElement;
type TextBlockOptions = { align?: TextAlign };

const text = (value: string): { text: string } => ({ text: value });

/** Wrap a string into a single text node, or pass through an element. */
function asChildren(content: Inline | Inline[]): TElement['children'] {
  const items = Array.isArray(content) ? content : [content];
  const children = items.map((item) =>
    typeof item === 'string' ? text(item) : item,
  );
  return (children.length > 0 ? children : [text('')]) as TElement['children'];
}

export const b = {
  /* Basic blocks */
  p: (content: Inline | Inline[] = '', opts: TextBlockOptions = {}): TElement => ({
    type: DocElement.Paragraph,
    align: opts.align,
    children: asChildren(content),
  }),
  h1: (content: Inline | Inline[], opts: TextBlockOptions = {}): TElement => ({
    type: DocElement.H1,
    align: opts.align,
    children: asChildren(content),
  }),
  h2: (content: Inline | Inline[], opts: TextBlockOptions = {}): TElement => ({
    type: DocElement.H2,
    align: opts.align,
    children: asChildren(content),
  }),
  h3: (content: Inline | Inline[], opts: TextBlockOptions = {}): TElement => ({
    type: DocElement.H3,
    align: opts.align,
    children: asChildren(content),
  }),
  blockquote: (content: Inline | Inline[], opts: TextBlockOptions = {}): TElement => ({
    type: DocElement.Blockquote,
    align: opts.align,
    children: asChildren(content),
  }),
  hr: (): TElement => ({ type: DocElement.Hr, children: [text('')] }),

  /* Document layout */
  cover: (children: TElement[]): TElement => ({
    type: DocElement.Cover,
    children,
  }),
  eyebrow: (content: Inline | Inline[], opts: TextBlockOptions = {}): TElement => ({
    type: DocElement.Eyebrow,
    align: opts.align,
    children: asChildren(content),
  }),
  docTitle: (content: Inline | Inline[], opts: TextBlockOptions = {}): TElement => ({
    type: DocElement.DocTitle,
    align: opts.align,
    children: asChildren(content),
  }),
  docSubtitle: (content: Inline | Inline[], opts: TextBlockOptions = {}): TElement => ({
    type: DocElement.DocSubtitle,
    align: opts.align,
    children: asChildren(content),
  }),
  section: (children: TElement[]): TElement => ({
    type: DocElement.Section,
    children,
  }),
  callout: (
    content: TElement[],
    opts: { variant?: CalloutVariant; title?: string; align?: TextAlign } = {},
  ): TElement => ({
    type: DocElement.Callout,
    variant: opts.variant,
    title: opts.title,
    align: opts.align,
    children: content,
  }),
  columns: (columns: TElement[]): TElement => ({
    type: DocElement.Columns,
    children: columns,
  }),
  column: (children: TElement[], ratio?: number): TElement => ({
    type: DocElement.Column,
    ratio,
    children,
  }),
  card: (
    children: TElement[],
    opts: {
      aside?: string;
      title?: string;
      meta?: string;
      tags?: string[];
      align?: TextAlign;
    } = {},
  ): TElement => ({
    type: DocElement.Card,
    aside: opts.aside,
    title: opts.title,
    meta: opts.meta,
    tags: opts.tags,
    align: opts.align,
    children: children.length > 0 ? children : [b.p('')],
  }),
  keyValue: (items: TElement[]): TElement => ({
    type: DocElement.KeyValue,
    children: items,
  }),
  kv: (label: string, value: Inline | Inline[], opts: TextBlockOptions = {}): TElement => ({
    type: DocElement.KeyValueItem,
    label,
    align: opts.align,
    children: asChildren(value),
  }),
  pageBreak: (): TElement => ({
    type: DocElement.PageBreak,
    children: [text('')],
  }),
};

/** A minimal, valid starting document. */
export function createEmptyDocument(): TElement[] {
  return [b.p('')];
}
