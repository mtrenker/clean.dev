/**
 * Default plugin set for the document editor.
 *
 * Built on Plate's primitives: basic block/mark plugins from
 * `@platejs/basic-nodes`, plus this package's document-layout plugins created
 * with `createPlatePlugin`. Consumers can extend or replace the list — see
 * {@link createDocumentPlugins}.
 */
import {
  ParagraphPlugin,
  createPlatePlugin,
  type AnyPlatePlugin,
} from 'platejs/react';
import {
  BlockquotePlugin,
  BoldPlugin,
  CodePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  HighlightPlugin,
  HorizontalRulePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react';

import { DocElement } from '../types';
import {
  BlockquoteElementComponent,
  CalloutElementComponent,
  CardElementComponent,
  ColumnElementComponent,
  ColumnsElementComponent,
  CoverElementComponent,
  DocSubtitleElementComponent,
  DocTitleElementComponent,
  EyebrowElementComponent,
  H1ElementComponent,
  H2ElementComponent,
  H3ElementComponent,
  HrElementComponent,
  KeyValueElementComponent,
  KeyValueItemElementComponent,
  PageBreakElementComponent,
  ParagraphElementComponent,
  SectionElementComponent,
} from '../elements';
import {
  BoldLeafComponent,
  CodeLeafComponent,
  HighlightLeafComponent,
  ItalicLeafComponent,
  StrikethroughLeafComponent,
  UnderlineLeafComponent,
} from '../elements/marks';

/* ------------------------- document-layout plugins ------------------------ */

export const CoverPlugin = createPlatePlugin({
  key: DocElement.Cover,
  node: { isElement: true },
}).withComponent(CoverElementComponent);

export const EyebrowPlugin = createPlatePlugin({
  key: DocElement.Eyebrow,
  node: { isElement: true },
}).withComponent(EyebrowElementComponent);

export const DocTitlePlugin = createPlatePlugin({
  key: DocElement.DocTitle,
  node: { isElement: true },
}).withComponent(DocTitleElementComponent);

export const DocSubtitlePlugin = createPlatePlugin({
  key: DocElement.DocSubtitle,
  node: { isElement: true },
}).withComponent(DocSubtitleElementComponent);

export const SectionPlugin = createPlatePlugin({
  key: DocElement.Section,
  node: { isElement: true },
}).withComponent(SectionElementComponent);

export const CalloutPlugin = createPlatePlugin({
  key: DocElement.Callout,
  node: { isElement: true },
}).withComponent(CalloutElementComponent);

export const ColumnsPlugin = createPlatePlugin({
  key: DocElement.Columns,
  node: { isElement: true },
}).withComponent(ColumnsElementComponent);

export const ColumnPlugin = createPlatePlugin({
  key: DocElement.Column,
  node: { isElement: true },
}).withComponent(ColumnElementComponent);

export const CardPlugin = createPlatePlugin({
  key: DocElement.Card,
  node: { isElement: true },
}).withComponent(CardElementComponent);

export const KeyValuePlugin = createPlatePlugin({
  key: DocElement.KeyValue,
  node: { isElement: true },
}).withComponent(KeyValueElementComponent);

export const KeyValueItemPlugin = createPlatePlugin({
  key: DocElement.KeyValueItem,
  node: { isElement: true },
}).withComponent(KeyValueItemElementComponent);

export const PageBreakPlugin = createPlatePlugin({
  key: DocElement.PageBreak,
  node: { isElement: true, isVoid: true },
}).withComponent(PageBreakElementComponent);

/** All document-layout plugins this package adds on top of the basics. */
export const documentLayoutPlugins = [
  CoverPlugin,
  EyebrowPlugin,
  DocTitlePlugin,
  DocSubtitlePlugin,
  SectionPlugin,
  CalloutPlugin,
  ColumnsPlugin,
  ColumnPlugin,
  CardPlugin,
  KeyValuePlugin,
  KeyValueItemPlugin,
  PageBreakPlugin,
];

/* ----------------------------- basic plugins ------------------------------ */

/** Basic block & mark plugins, wired with this package's render components. */
export const basicPlugins = [
  ParagraphPlugin.withComponent(ParagraphElementComponent),
  H1Plugin.withComponent(H1ElementComponent),
  H2Plugin.withComponent(H2ElementComponent),
  H3Plugin.withComponent(H3ElementComponent),
  BlockquotePlugin.withComponent(BlockquoteElementComponent),
  HorizontalRulePlugin.withComponent(HrElementComponent),
  BoldPlugin.withComponent(BoldLeafComponent),
  ItalicPlugin.withComponent(ItalicLeafComponent),
  UnderlinePlugin.withComponent(UnderlineLeafComponent),
  StrikethroughPlugin.withComponent(StrikethroughLeafComponent),
  CodePlugin.withComponent(CodeLeafComponent),
  HighlightPlugin.withComponent(HighlightLeafComponent),
];

export interface CreateDocumentPluginsOptions {
  /** Extra plugins appended after the defaults (e.g. images, tables, AI). */
  extend?: AnyPlatePlugin[];
}

/**
 * Build the default plugin list for {@link DocumentEditor}.
 *
 * @example
 * const plugins = createDocumentPlugins({ extend: [MyImagePlugin] });
 */
export function createDocumentPlugins(
  options: CreateDocumentPluginsOptions = {},
): AnyPlatePlugin[] {
  return [
    ...basicPlugins,
    ...documentLayoutPlugins,
    ...(options.extend ?? []),
  ] as AnyPlatePlugin[];
}
