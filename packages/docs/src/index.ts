/**
 * @cleandev/docs
 *
 * A reusable Plate.js document-writing editor with a paginated **Page Mode**
 * and generic, PDF-oriented layout elements (cover, section, callout, columns,
 * card, key-value, page break, …). Suitable for client reports, proposals,
 * CVs/project profiles, and blog posts.
 *
 * Import the stylesheet once in your app:
 *   import '@cleandev/docs/styles.css';
 */

/* Main components */
export { DocumentEditor } from './components/DocumentEditor';
export type { DocumentEditorProps } from './components/DocumentEditor';
export { PageCanvas } from './components/PageCanvas';
export type { DocumentMode } from './components/PageCanvas';
export { DocumentToolbar } from './components/Toolbar';
export { DocumentFloatingToolbar } from './components/FloatingToolbar';
export type { DocumentFloatingToolbarProps } from './components/FloatingToolbar';
export { InlineMarkButtons } from './components/InlineMarks';
export type { InlineMarkButtonsProps } from './components/InlineMarks';
export { ToolbarButton, ToolbarSeparator } from './components/ToolbarButton';
export type { ToolbarButtonProps } from './components/ToolbarButton';

/* Plugins & render components (extension points) */
export {
  createDocumentPlugins,
  basicPlugins,
  documentLayoutPlugins,
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
} from './plugins';
export type { CreateDocumentPluginsOptions } from './plugins';
export * as elements from './elements';

/* Configuration */
export {
  PAGE_SIZES,
  defaultPageConfig,
  defaultTheme,
  resolvePageConfig,
  resolveTheme,
  resolvePageSize,
  effectiveDimensions,
  pageCssVariables,
} from './config/page';
export type {
  PageConfig,
  PageSizeName,
  PageDimensions,
  PageMargins,
  PageOrientation,
  DocumentTheme,
} from './config/page';

/* Types */
export {
  DocElement,
  DocMark,
} from './types';
export type {
  DocElementType,
  DocMarkType,
  TextAlign,
  TextBlockProps,
  CalloutVariant,
  DocumentValue,
  CalloutElement,
  CardElement,
  ColumnElement,
  ColumnsElement,
  KeyValueItemElement,
  PageBreakElement,
  TElement,
  TText,
  Value,
} from './types';

/* Authoring helpers */
export { b, createEmptyDocument } from './builders';

/* Transform/query utilities (for custom toolbars/UI) */
export {
  isMarkActive,
  toggleMark,
  currentBlockType,
  isBlockType,
  setBlockType,
  currentTextAlign,
  isTextAlign,
  setTextAlign,
  insertBlock,
} from './utils/transforms';

/* Example content (for demos/tests; not required by consumers) */
export {
  samples,
  sampleProfile,
  sampleReport,
  sampleProposal,
  sampleBlogPost,
} from './samples';
