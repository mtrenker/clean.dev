/**
 * A small, dependency-free formatting toolbar.
 *
 * It is intentionally minimal — the editor works without it, and consumers can
 * build their own UI on top of the exported transform helpers. Pass
 * `toolbar={false}` to {@link DocumentEditor} to hide it, or `toolbar={<Custom/>}`
 * to supply your own.
 */
import * as React from 'react';
import { useEditorRef, useEditorVersion } from 'platejs/react';

import { b } from '../builders';
import { DocElement, DocMark } from '../types';
import {
  insertBlock,
  isBlockType,
  isMarkActive,
  setBlockType,
  toggleMark,
} from '../utils/transforms';

interface BtnProps {
  label: string;
  title: string;
  active?: boolean;
  onAction: () => void;
}

const ToolbarButton = ({ label, title, active, onAction }: BtnProps): React.ReactElement => (
  <button
    type="button"
    className={`pdoc-tb__btn${active ? ' pdoc-tb__btn--active' : ''}`}
    title={title}
    aria-label={title}
    aria-pressed={active}
    // Keep the editor selection while clicking the toolbar.
    onMouseDown={(event) => {
      event.preventDefault();
    }}
    onClick={onAction}
  >
    {label}
  </button>
);

const Divider = (): React.ReactElement => <span className="pdoc-tb__divider" aria-hidden />;

export const DocumentToolbar = (): React.ReactElement => {
  const editor = useEditorRef();
  // Re-render on each editor change so active states stay in sync.
  useEditorVersion();

  return (
    <div className="pdoc-tb" role="toolbar" aria-label="Formatting">
      <div className="pdoc-tb__group">
        <ToolbarButton
          label="H1"
          title="Heading 1"
          active={isBlockType(editor, DocElement.H1)}
          onAction={() => {
            setBlockType(editor, DocElement.H1);
          }}
        />
        <ToolbarButton
          label="H2"
          title="Heading 2"
          active={isBlockType(editor, DocElement.H2)}
          onAction={() => {
            setBlockType(editor, DocElement.H2);
          }}
        />
        <ToolbarButton
          label="H3"
          title="Heading 3"
          active={isBlockType(editor, DocElement.H3)}
          onAction={() => {
            setBlockType(editor, DocElement.H3);
          }}
        />
        <ToolbarButton
          label="¶"
          title="Paragraph"
          active={isBlockType(editor, DocElement.Paragraph)}
          onAction={() => {
            setBlockType(editor, DocElement.Paragraph);
          }}
        />
      </div>

      <Divider />

      <div className="pdoc-tb__group">
        <ToolbarButton
          label="B"
          title="Bold"
          active={isMarkActive(editor, DocMark.Bold)}
          onAction={() => {
            toggleMark(editor, DocMark.Bold);
          }}
        />
        <ToolbarButton
          label="I"
          title="Italic"
          active={isMarkActive(editor, DocMark.Italic)}
          onAction={() => {
            toggleMark(editor, DocMark.Italic);
          }}
        />
        <ToolbarButton
          label="U"
          title="Underline"
          active={isMarkActive(editor, DocMark.Underline)}
          onAction={() => {
            toggleMark(editor, DocMark.Underline);
          }}
        />
        <ToolbarButton
          label="</>"
          title="Inline code"
          active={isMarkActive(editor, DocMark.Code)}
          onAction={() => {
            toggleMark(editor, DocMark.Code);
          }}
        />
      </div>

      <Divider />

      <div className="pdoc-tb__group">
        <ToolbarButton
          label="❝"
          title="Quote"
          active={isBlockType(editor, DocElement.Blockquote)}
          onAction={() => {
            setBlockType(editor, DocElement.Blockquote);
          }}
        />
        <ToolbarButton
          label="Callout"
          title="Insert callout"
          onAction={() => {
            insertBlock(editor, b.callout([b.p('')], { variant: 'info' }));
          }}
        />
        <ToolbarButton
          label="Columns"
          title="Insert two columns"
          onAction={() => {
            insertBlock(
              editor,
              b.columns([b.column([b.p('')]), b.column([b.p('')])]),
            );
          }}
        />
        <ToolbarButton
          label="Card"
          title="Insert card"
          onAction={() => {
            insertBlock(editor, b.card([b.p('')], { title: 'Title', aside: '2024' }));
          }}
        />
        <ToolbarButton
          label="Break"
          title="Insert page break"
          onAction={() => {
            insertBlock(editor, b.pageBreak());
          }}
        />
      </div>
    </div>
  );
};
