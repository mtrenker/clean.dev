/**
 * The block / structural toolbar — sticky top chrome for the editor.
 *
 * Handles document structure (paragraph ⇄ heading, quote) and inserting the
 * package's layout blocks (callout, columns, card, page break). Inline text
 * marks live here too, but are also surfaced contextually by the
 * {@link DocumentFloatingToolbar} near the selection.
 *
 * It is intentionally self-contained — the editor works without it, and
 * consumers can build their own UI on top of the exported transform helpers.
 * Pass `toolbar={false}` to {@link DocumentEditor} to hide it, or
 * `toolbar={<Custom/>}` to supply your own.
 */
import * as React from 'react';
import { useEditorRef, useEditorVersion } from 'platejs/react';

import { b } from '../builders';
import { DocElement, type TextAlign } from '../types';
import {
  insertBlock,
  isBlockType,
  isTextAlign,
  setBlockType,
  setTextAlign,
} from '../utils/transforms';
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  QuoteIcon,
} from './icons';
import { InlineMarkButtons } from './InlineMarks';
import { ToolbarButton, ToolbarSeparator } from './ToolbarButton';

const ALIGN_BUTTONS: { align: TextAlign; title: string; icon: React.ReactElement }[] = [
  { align: 'left', title: 'Align left', icon: <AlignLeftIcon /> },
  { align: 'center', title: 'Align center', icon: <AlignCenterIcon /> },
  { align: 'right', title: 'Align right', icon: <AlignRightIcon /> },
  { align: 'justify', title: 'Justify', icon: <AlignJustifyIcon /> },
];

export const DocumentToolbar = (): React.ReactElement => {
  const editor = useEditorRef();
  // Re-render on each editor change so active states stay in sync.
  useEditorVersion();

  return (
    <div className="pdoc-tb" role="toolbar" aria-label="Document formatting">
      <div className="pdoc-tb__group">
        <ToolbarButton
          title="Heading 1"
          text
          active={isBlockType(editor, DocElement.H1)}
          onAction={() => {
            setBlockType(editor, DocElement.H1);
          }}
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          title="Heading 2"
          text
          active={isBlockType(editor, DocElement.H2)}
          onAction={() => {
            setBlockType(editor, DocElement.H2);
          }}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          title="Heading 3"
          text
          active={isBlockType(editor, DocElement.H3)}
          onAction={() => {
            setBlockType(editor, DocElement.H3);
          }}
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          title="Paragraph"
          text
          active={isBlockType(editor, DocElement.Paragraph)}
          onAction={() => {
            setBlockType(editor, DocElement.Paragraph);
          }}
        >
          ¶
        </ToolbarButton>
      </div>

      <ToolbarSeparator />

      <div className="pdoc-tb__group">
        <InlineMarkButtons />
      </div>

      <ToolbarSeparator />

      <div className="pdoc-tb__group" aria-label="Text alignment">
        {ALIGN_BUTTONS.map(({ align, title, icon }) => (
          <ToolbarButton
            key={align}
            title={title}
            active={isTextAlign(editor, align)}
            onAction={() => {
              setTextAlign(editor, align);
            }}
          >
            {icon}
          </ToolbarButton>
        ))}
      </div>

      <ToolbarSeparator />

      <div className="pdoc-tb__group">
        <ToolbarButton
          title="Quote"
          active={isBlockType(editor, DocElement.Blockquote)}
          onAction={() => {
            setBlockType(editor, DocElement.Blockquote);
          }}
        >
          <QuoteIcon />
        </ToolbarButton>
        <ToolbarButton
          title="Insert callout"
          text
          onAction={() => {
            insertBlock(editor, b.callout([b.p('')], { variant: 'info' }));
          }}
        >
          Callout
        </ToolbarButton>
        <ToolbarButton
          title="Insert two columns"
          text
          onAction={() => {
            insertBlock(
              editor,
              b.columns([b.column([b.p('')]), b.column([b.p('')])]),
            );
          }}
        >
          Columns
        </ToolbarButton>
        <ToolbarButton
          title="Insert card"
          text
          onAction={() => {
            insertBlock(editor, b.card([b.p('')], { title: 'Title', aside: '2024' }));
          }}
        >
          Card
        </ToolbarButton>
        <ToolbarButton
          title="Insert page break"
          text
          onAction={() => {
            insertBlock(editor, b.pageBreak());
          }}
        >
          Break
        </ToolbarButton>
      </div>
    </div>
  );
};
