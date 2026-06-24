/**
 * The inline text-formatting controls (bold, italic, underline, …), shared by
 * the block toolbar and the floating toolbar so both stay in sync.
 */
import * as React from 'react';
import { useEditorRef, useEditorVersion } from 'platejs/react';

import { DocMark, type DocMarkType } from '../types';
import { isMarkActive, toggleMark } from '../utils/transforms';
import {
  BoldIcon,
  CodeIcon,
  HighlightIcon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from './icons';
import { ToolbarButton } from './ToolbarButton';

interface MarkDef {
  mark: DocMarkType;
  title: string;
  icon: React.ReactElement;
}

const MARKS: MarkDef[] = [
  { mark: DocMark.Bold, title: 'Bold', icon: <BoldIcon /> },
  { mark: DocMark.Italic, title: 'Italic', icon: <ItalicIcon /> },
  { mark: DocMark.Underline, title: 'Underline', icon: <UnderlineIcon /> },
  { mark: DocMark.Strikethrough, title: 'Strikethrough', icon: <StrikethroughIcon /> },
  { mark: DocMark.Code, title: 'Inline code', icon: <CodeIcon /> },
  { mark: DocMark.Highlight, title: 'Highlight', icon: <HighlightIcon /> },
];

export interface InlineMarkButtonsProps {
  /** Subset/order of marks to render. Defaults to the full set. */
  marks?: DocMarkType[];
}

export const InlineMarkButtons = ({
  marks,
}: InlineMarkButtonsProps): React.ReactElement => {
  const editor = useEditorRef();
  // Keep active (aria-pressed) states in sync as marks toggle, even when the
  // selection itself does not change.
  useEditorVersion();
  const defs = marks ? MARKS.filter((m) => marks.includes(m.mark)) : MARKS;

  return (
    <>
      {defs.map(({ mark, title, icon }) => (
        <ToolbarButton
          key={mark}
          title={title}
          active={isMarkActive(editor, mark)}
          onAction={() => {
            toggleMark(editor, mark);
          }}
        >
          {icon}
        </ToolbarButton>
      ))}
    </>
  );
};
