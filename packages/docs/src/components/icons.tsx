/**
 * Tiny, dependency-free SVG icon set for the toolbars.
 *
 * Icons are 16×16, stroke/fill use `currentColor`, and they carry
 * `aria-hidden` because the buttons that wrap them provide the accessible
 * label. Kept intentionally minimal — a precise, editorial line look rather
 * than a heavy icon font.
 */
import * as React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

const Svg = ({ children, ...props }: IconProps): React.ReactElement => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    focusable={false}
    {...props}
  >
    {children}
  </svg>
);

export const BoldIcon = (props: IconProps): React.ReactElement => (
  <Svg {...props}>
    <path d="M4.5 3h4a2.5 2.5 0 0 1 0 5h-4z" fill="currentColor" stroke="none" />
    <path d="M4.5 8h4.6a2.5 2.5 0 0 1 0 5H4.5z" fill="currentColor" stroke="none" />
  </Svg>
);

export const ItalicIcon = (props: IconProps): React.ReactElement => (
  <Svg {...props}>
    <line x1="10.5" y1="3.5" x2="6.5" y2="12.5" />
    <line x1="9" y1="3.5" x2="12" y2="3.5" />
    <line x1="4" y1="12.5" x2="7" y2="12.5" />
  </Svg>
);

export const UnderlineIcon = (props: IconProps): React.ReactElement => (
  <Svg {...props}>
    <path d="M4.5 3v4.5a3.5 3.5 0 0 0 7 0V3" />
    <line x1="3.5" y1="13.5" x2="12.5" y2="13.5" />
  </Svg>
);

export const StrikethroughIcon = (props: IconProps): React.ReactElement => (
  <Svg {...props}>
    <line x1="3" y1="8" x2="13" y2="8" />
    <path d="M5 5.2A2.6 2.6 0 0 1 7.7 3.5c1.7 0 2.6 1 2.9 2" />
    <path d="M10.6 9.2c.2 1.6-.9 3.3-3 3.3-1.7 0-2.7-.9-3-2" />
  </Svg>
);

export const CodeIcon = (props: IconProps): React.ReactElement => (
  <Svg {...props}>
    <polyline points="6 5 2.5 8 6 11" />
    <polyline points="10 5 13.5 8 10 11" />
  </Svg>
);

export const HighlightIcon = (props: IconProps): React.ReactElement => (
  <Svg {...props}>
    <path d="M3 13h10" strokeWidth="2" />
    <path d="M5.5 10.5 9 3l3 1.5-3.5 7.5z" />
    <path d="M5.5 10.5 5 12l2.5-.5z" fill="currentColor" stroke="none" />
  </Svg>
);

export const QuoteIcon = (props: IconProps): React.ReactElement => (
  <Svg {...props}>
    <path d="M6.5 4.5C4.8 5.2 4 6.5 4 8.3V11h3V8H5.6c0-1 .4-1.6 1.4-2zM12.5 4.5C10.8 5.2 10 6.5 10 8.3V11h3V8h-1.4c0-1 .4-1.6 1.4-2z" fill="currentColor" stroke="none" />
  </Svg>
);

export const AlignLeftIcon = (props: IconProps): React.ReactElement => (
  <Svg {...props}>
    <line x1="3" y1="4" x2="13" y2="4" />
    <line x1="3" y1="7" x2="10.5" y2="7" />
    <line x1="3" y1="10" x2="13" y2="10" />
    <line x1="3" y1="13" x2="9" y2="13" />
  </Svg>
);

export const AlignCenterIcon = (props: IconProps): React.ReactElement => (
  <Svg {...props}>
    <line x1="3" y1="4" x2="13" y2="4" />
    <line x1="4.5" y1="7" x2="11.5" y2="7" />
    <line x1="3" y1="10" x2="13" y2="10" />
    <line x1="5" y1="13" x2="11" y2="13" />
  </Svg>
);

export const AlignRightIcon = (props: IconProps): React.ReactElement => (
  <Svg {...props}>
    <line x1="3" y1="4" x2="13" y2="4" />
    <line x1="5.5" y1="7" x2="13" y2="7" />
    <line x1="3" y1="10" x2="13" y2="10" />
    <line x1="7" y1="13" x2="13" y2="13" />
  </Svg>
);

export const AlignJustifyIcon = (props: IconProps): React.ReactElement => (
  <Svg {...props}>
    <line x1="3" y1="4" x2="13" y2="4" />
    <line x1="3" y1="7" x2="13" y2="7" />
    <line x1="3" y1="10" x2="13" y2="10" />
    <line x1="3" y1="13" x2="13" y2="13" />
  </Svg>
);
