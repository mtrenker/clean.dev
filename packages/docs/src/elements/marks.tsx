/** Leaf (text mark) render components. */
import * as React from 'react';
import { PlateLeaf, type PlateLeafProps } from 'platejs/react';

export const BoldLeafComponent = (props: PlateLeafProps): React.ReactElement => (
  <PlateLeaf {...props} as="strong">
    {props.children}
  </PlateLeaf>
);

export const ItalicLeafComponent = (props: PlateLeafProps): React.ReactElement => (
  <PlateLeaf {...props} as="em">
    {props.children}
  </PlateLeaf>
);

export const UnderlineLeafComponent = (props: PlateLeafProps): React.ReactElement => (
  <PlateLeaf {...props} as="u">
    {props.children}
  </PlateLeaf>
);

export const StrikethroughLeafComponent = (props: PlateLeafProps): React.ReactElement => (
  <PlateLeaf {...props} as="s">
    {props.children}
  </PlateLeaf>
);

export const CodeLeafComponent = (props: PlateLeafProps): React.ReactElement => (
  <PlateLeaf {...props} as="code" className="pdoc-code">
    {props.children}
  </PlateLeaf>
);

export const HighlightLeafComponent = (props: PlateLeafProps): React.ReactElement => (
  <PlateLeaf {...props} as="mark" className="pdoc-mark">
    {props.children}
  </PlateLeaf>
);
