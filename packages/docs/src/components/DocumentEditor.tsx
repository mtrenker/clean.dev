'use client';

/**
 * `DocumentEditor` — the package's main entry component.
 *
 * A Plate.js editor configured for long-form, print-grade documents with a
 * paginated **Page Mode**. Generic by design: the same component composes CVs,
 * client reports, proposals, and blog posts.
 *
 * The `value` prop is the *initial* document; edits are reported through
 * `onChange`. Pass `readOnly` to use it purely as a page preview for PDF
 * composition (e.g. behind a browser "Print → Save as PDF").
 */
import * as React from 'react';
import {
  Plate,
  PlateContent,
  usePlateEditor,
  type AnyPlatePlugin,
  type PlateEditor,
} from 'platejs/react';

import {
  pageCssVariables,
  resolvePageConfig,
  resolveTheme,
  type DocumentTheme,
  type PageConfig,
} from '../config/page';
import { createDocumentPlugins } from '../plugins';
import { createEmptyDocument } from '../builders';
import type { DocumentValue } from '../types';
import { PageCanvas, type DocumentMode } from './PageCanvas';
import { DocumentToolbar } from './Toolbar';
import { DocumentFloatingToolbar } from './FloatingToolbar';

export interface DocumentEditorProps {
  /** Initial document value (a Plate value). Defaults to an empty paragraph. */
  value?: DocumentValue;
  /** Called with the full value whenever the document changes. */
  onChange?: (value: DocumentValue) => void;
  /** Render read-only — ideal as a page preview for PDF/print. */
  readOnly?: boolean;
  /** `page` (paginated paper) or `flow` (full-width writing surface). */
  mode?: DocumentMode;
  /** Page geometry (size, orientation, margins, guides). */
  page?: Partial<PageConfig>;
  /** Theme tokens (colours, fonts). Overrides the print-grade defaults. */
  theme?: Partial<DocumentTheme>;
  /**
   * Fully replace the plugin list. When omitted, the package defaults are used
   * (see {@link createDocumentPlugins}); combine with `extendPlugins` to add to
   * the defaults instead.
   */
  plugins?: AnyPlatePlugin[];
  /** Extra plugins appended to the defaults (ignored if `plugins` is set). */
  extendPlugins?: AnyPlatePlugin[];
  /** `true` (default) shows the built-in block toolbar; pass a node for a custom one. */
  toolbar?: boolean | React.ReactNode;
  /**
   * Contextual inline toolbar that floats near the text selection.
   * `true` (default) shows the built-in one; pass a node for a custom one, or
   * `false` to disable. Always hidden in `readOnly` mode.
   */
  floatingToolbar?: boolean | React.ReactNode;
  /** Placeholder shown when the document is empty. */
  placeholder?: string;
  /** Preview zoom factor in page mode (1 = 100%). */
  zoom?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Receives the Plate editor instance once mounted (for export, etc.). */
  onReady?: (editor: PlateEditor) => void;
}

export const DocumentEditor = ({
  value,
  onChange,
  readOnly = false,
  mode = 'page',
  page,
  theme,
  plugins,
  extendPlugins,
  toolbar = true,
  floatingToolbar = true,
  placeholder = 'Start writing…',
  zoom = 1,
  className,
  style,
  onReady,
}: DocumentEditorProps): React.ReactElement => {
  const pageConfig = React.useMemo(() => resolvePageConfig(page), [page]);
  const themeConfig = React.useMemo(() => resolveTheme(theme), [theme]);

  const editor = usePlateEditor({
    plugins: plugins ?? createDocumentPlugins({ extend: extendPlugins }),
    value: value ?? createEmptyDocument(),
  });

  const onReadyRef = React.useRef(onReady);
  onReadyRef.current = onReady;
  React.useEffect(() => {
    onReadyRef.current?.(editor);
  }, [editor]);

  const cssVars = React.useMemo(
    () => pageCssVariables(pageConfig, themeConfig),
    [pageConfig, themeConfig],
  );

  const rootStyle = {
    ...cssVars,
    '--pdoc-zoom': String(zoom),
    ...style,
  } as React.CSSProperties;

  const toolbarNode =
    toolbar === false || readOnly ? null : toolbar === true ? (
      <DocumentToolbar />
    ) : (
      toolbar
    );

  const floatingToolbarNode =
    floatingToolbar === false || readOnly ? null : floatingToolbar === true ? (
      <DocumentFloatingToolbar />
    ) : (
      floatingToolbar
    );

  return (
    <div
      className={`pdoc pdoc--${mode}${className ? ` ${className}` : ''}`}
      style={rootStyle}
      data-readonly={readOnly ? '' : undefined}
    >
      <Plate
        editor={editor}
        readOnly={readOnly}
        onValueChange={({ value: next }) => {
          onChange?.(next);
        }}
      >
        {toolbarNode}
        <PageCanvas mode={mode} showGuides={pageConfig.showPageGuides}>
          <PlateContent
            className="pdoc-content"
            placeholder={placeholder}
            readOnly={readOnly}
            spellCheck
            aria-label="Document content"
          />
        </PageCanvas>
        {floatingToolbarNode}
      </Plate>
    </div>
  );
};
