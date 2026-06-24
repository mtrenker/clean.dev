/**
 * Shared toolbar button primitive used by both the block toolbar and the
 * floating inline toolbar.
 *
 * Compact, squared control with a restrained active state. It calls
 * `preventDefault` on mousedown so the editor selection (and focus) survive the
 * click — essential for a floating toolbar that lives outside the editable.
 */
import * as React from 'react';

export interface ToolbarButtonProps {
  /** Accessible name; also shown as the native tooltip. */
  title: string;
  /** Icon node or short text label rendered inside the button. */
  children: React.ReactNode;
  /** Toggle state for marks/blocks — reflected as `aria-pressed`. */
  active?: boolean;
  /** Treat the label as text (slightly wider, mono) rather than an icon. */
  text?: boolean;
  onAction: () => void;
}

export const ToolbarButton = ({
  title,
  children,
  active,
  text,
  onAction,
}: ToolbarButtonProps): React.ReactElement => (
  <button
    type="button"
    className={`pdoc-tbtn${text ? ' pdoc-tbtn--text' : ''}${active ? ' pdoc-tbtn--active' : ''}`}
    title={title}
    aria-label={title}
    aria-pressed={active}
    // Keep the editor selection/focus while clicking the toolbar.
    onMouseDown={(event) => {
      event.preventDefault();
    }}
    onClick={onAction}
  >
    {children}
  </button>
);

export const ToolbarSeparator = (): React.ReactElement => (
  <span className="pdoc-tb__sep" aria-hidden />
);
