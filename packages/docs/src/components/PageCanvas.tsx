/**
 * The paginated "paper" chrome.
 *
 * In `page` mode it renders content inside a page-sized sheet (paper colour,
 * margins, drop shadow) on a gutter background, optionally drawing
 * page-boundary guides. In `flow` mode it renders a plain, full-width writing
 * surface. All visuals are driven by CSS custom properties from
 * {@link pageCssVariables}.
 */
import * as React from 'react';

export type DocumentMode = 'page' | 'flow';

interface PageCanvasProps {
  mode: DocumentMode;
  showGuides: boolean;
  children: React.ReactNode;
}

export const PageCanvas = ({
  mode,
  showGuides,
  children,
}: PageCanvasProps): React.ReactElement => {
  if (mode === 'flow') {
    return <div className="pdoc-flow">{children}</div>;
  }

  return (
    <div className="pdoc-canvas">
      <div className="pdoc-sheet" data-guides={showGuides ? '' : undefined}>
        {children}
      </div>
    </div>
  );
};
