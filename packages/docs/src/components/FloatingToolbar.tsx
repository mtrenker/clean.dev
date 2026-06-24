/**
 * Floating inline-formatting toolbar.
 *
 * A small, precise panel that appears just above the current text selection and
 * offers inline marks (bold, italic, underline, …). It is positioned from the
 * live DOM selection rectangle, so it needs no heavy positioning dependency.
 *
 * Behaviour:
 *  - shown only when there is an expanded (non-collapsed) selection and the
 *    editor is focused;
 *  - hidden in read-only mode;
 *  - buttons `preventDefault` on mousedown, so clicking the panel keeps the
 *    selection and the panel stays open;
 *  - repositions on scroll/resize while open.
 *
 * Positioning uses `position: fixed` (viewport coordinates), so it is never
 * clipped by the scrolling page canvas and ignores the page-zoom transform.
 */
import * as React from 'react';
import { useEditorReadOnly } from 'platejs/react';

import type { DocMarkType } from '../types';
import { InlineMarkButtons } from './InlineMarks';

/** Gap in px between the selection and the panel. */
const OFFSET = 8;
/** Minimum inset from the viewport edges when clamping. */
const EDGE = 8;

interface Position {
  top: number;
  left: number;
  /** Whether the panel sits below the selection (arrow points up). */
  below: boolean;
}

function selectionBelongsToRoot(selection: Selection, root: HTMLElement): boolean {
  const { anchorNode, focusNode } = selection;
  const anchor = anchorNode instanceof Element ? anchorNode : anchorNode?.parentElement;
  const focus = focusNode instanceof Element ? focusNode : focusNode?.parentElement;

  return Boolean(anchor && focus && root.contains(anchor) && root.contains(focus));
}

function readSelectionRect(root: HTMLElement): DOMRect | null {
  if (typeof window === 'undefined') return null;
  const selection = window.getSelection();
  if (
    !selection ||
    selection.rangeCount === 0 ||
    selection.isCollapsed ||
    !selectionBelongsToRoot(selection, root)
  ) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const rects = Array.from(range.getClientRects()).filter(
    (rect) => rect.width > 0 || rect.height > 0,
  );
  const rect = rects[0] ?? range.getBoundingClientRect();
  if (!rect || (rect.width === 0 && rect.height === 0)) return null;
  return rect;
}

export interface DocumentFloatingToolbarProps {
  /** Subset/order of inline marks to show. Defaults to the full set. */
  marks?: DocMarkType[];
}

export const DocumentFloatingToolbar = ({
  marks,
}: DocumentFloatingToolbarProps): React.ReactElement | null => {
  const readOnly = useEditorReadOnly();

  const ref = React.useRef<HTMLDivElement>(null);
  const frameRef = React.useRef<number | null>(null);
  const [pos, setPos] = React.useState<Position | null>(null);

  const reposition = React.useCallback(() => {
    const panel = ref.current;
    const root = panel?.closest<HTMLElement>('.pdoc');
    if (readOnly || !panel || !root) {
      setPos(null);
      return;
    }

    const rect = readSelectionRect(root);
    if (!rect) {
      setPos(null);
      return;
    }

    const { offsetWidth: w, offsetHeight: h } = panel;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = rect.left + rect.width / 2 - w / 2;
    left = Math.min(Math.max(left, EDGE), vw - w - EDGE);

    let top = rect.top - h - OFFSET;
    let below = false;
    if (top < EDGE) {
      // Not enough room above — flip below the selection.
      top = Math.min(rect.bottom + OFFSET, vh - h - EDGE);
      below = true;
    }

    setPos({ top, left, below });
  }, [readOnly]);

  const scheduleReposition = React.useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      reposition();
    });
  }, [reposition]);

  React.useLayoutEffect(() => {
    scheduleReposition();
  }, [scheduleReposition]);

  React.useEffect(() => {
    if (readOnly) {
      setPos(null);
      return undefined;
    }

    document.addEventListener('selectionchange', scheduleReposition);
    window.addEventListener('mouseup', scheduleReposition);
    window.addEventListener('keyup', scheduleReposition);
    window.addEventListener('scroll', scheduleReposition, true);
    window.addEventListener('resize', scheduleReposition);

    return () => {
      document.removeEventListener('selectionchange', scheduleReposition);
      window.removeEventListener('mouseup', scheduleReposition);
      window.removeEventListener('keyup', scheduleReposition);
      window.removeEventListener('scroll', scheduleReposition, true);
      window.removeEventListener('resize', scheduleReposition);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [readOnly, scheduleReposition]);

  if (readOnly) return null;

  const hidden = pos === null;
  const style: React.CSSProperties = {
    position: 'fixed',
    top: hidden ? -9999 : pos.top,
    left: hidden ? -9999 : pos.left,
    visibility: hidden ? 'hidden' : 'visible',
  };

  return (
    <div
      ref={ref}
      className={`pdoc-ftb${pos?.below ? ' pdoc-ftb--below' : ''}`}
      style={style}
      role="toolbar"
      aria-label="Inline formatting"
      // Defensive: never let a stray mousedown on the panel chrome blur the editor.
      onMouseDown={(event) => {
        event.preventDefault();
      }}
    >
      <InlineMarkButtons marks={marks} />
    </div>
  );
};
