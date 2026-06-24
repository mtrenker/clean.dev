/**
 * React render components for the document-layout elements.
 *
 * Each component is a thin, presentational wrapper around Plate's
 * `PlateElement`. All styling lives in `styles/docs.css` and is driven by
 * stable `pdoc-*` class names + CSS custom properties, so the components stay
 * framework-agnostic and survive independently of any host app's CSS.
 */
import * as React from 'react';
import { PlateElement, type PlateElementProps } from 'platejs/react';

import type {
  CalloutElement,
  CardElement,
  ColumnElement,
  KeyValueItemElement,
  TextAlign,
} from '../types';

type AlignableElement = { align?: TextAlign };

const textAlignStyle = (element: unknown): React.CSSProperties | undefined => {
  const align = (element as AlignableElement).align;
  return align ? { textAlign: align } : undefined;
};

/* ----------------------------- Cover / header ----------------------------- */

export const CoverElementComponent = (props: PlateElementProps): React.ReactElement => (
  <PlateElement {...props} as="header" className="pdoc-cover">
    {props.children}
  </PlateElement>
);

export const EyebrowElementComponent = (props: PlateElementProps): React.ReactElement => (
  <PlateElement {...props} as="p" className="pdoc-eyebrow" style={textAlignStyle(props.element)}>
    {props.children}
  </PlateElement>
);

export const DocTitleElementComponent = (props: PlateElementProps): React.ReactElement => (
  <PlateElement {...props} as="h1" className="pdoc-doc-title" style={textAlignStyle(props.element)}>
    {props.children}
  </PlateElement>
);

export const DocSubtitleElementComponent = (props: PlateElementProps): React.ReactElement => (
  <PlateElement {...props} as="p" className="pdoc-doc-subtitle" style={textAlignStyle(props.element)}>
    {props.children}
  </PlateElement>
);

/* -------------------------------- Section -------------------------------- */

export const SectionElementComponent = (props: PlateElementProps): React.ReactElement => (
  <PlateElement {...props} as="section" className="pdoc-section">
    {props.children}
  </PlateElement>
);

/* -------------------------------- Headings ------------------------------- */

export const H1ElementComponent = (props: PlateElementProps): React.ReactElement => (
  <PlateElement {...props} as="h1" className="pdoc-h1" style={textAlignStyle(props.element)}>
    {props.children}
  </PlateElement>
);

export const H2ElementComponent = (props: PlateElementProps): React.ReactElement => (
  <PlateElement {...props} as="h2" className="pdoc-h2" style={textAlignStyle(props.element)}>
    {props.children}
  </PlateElement>
);

export const H3ElementComponent = (props: PlateElementProps): React.ReactElement => (
  <PlateElement {...props} as="h3" className="pdoc-h3" style={textAlignStyle(props.element)}>
    {props.children}
  </PlateElement>
);

export const ParagraphElementComponent = (props: PlateElementProps): React.ReactElement => (
  <PlateElement {...props} as="p" className="pdoc-p" style={textAlignStyle(props.element)}>
    {props.children}
  </PlateElement>
);

export const BlockquoteElementComponent = (props: PlateElementProps): React.ReactElement => (
  <PlateElement {...props} as="blockquote" className="pdoc-blockquote" style={textAlignStyle(props.element)}>
    {props.children}
  </PlateElement>
);

export const HrElementComponent = (props: PlateElementProps): React.ReactElement => (
  <PlateElement {...props} className="pdoc-hr-wrap">
    <div contentEditable={false}>
      <hr className="pdoc-hr" />
    </div>
    {props.children}
  </PlateElement>
);

/* -------------------------------- Callout -------------------------------- */

export const CalloutElementComponent = (props: PlateElementProps): React.ReactElement => {
  const element = props.element as CalloutElement;
  const variant = element.variant ?? 'note';
  return (
    <PlateElement
      {...props}
      className={`pdoc-callout pdoc-callout--${variant}`}
      style={textAlignStyle(element)}
    >
      {element.title ? (
        <div className="pdoc-callout__title" contentEditable={false}>
          {element.title}
        </div>
      ) : null}
      <div className="pdoc-callout__body">{props.children}</div>
    </PlateElement>
  );
};

/* -------------------------------- Columns -------------------------------- */

export const ColumnsElementComponent = (props: PlateElementProps): React.ReactElement => (
  <PlateElement {...props} className="pdoc-columns">
    {props.children}
  </PlateElement>
);

export const ColumnElementComponent = (props: PlateElementProps): React.ReactElement => {
  const element = props.element as ColumnElement;
  return (
    <PlateElement
      {...props}
      className="pdoc-column"
      style={{ flexGrow: element.ratio ?? 1, flexBasis: 0 }}
    >
      {props.children}
    </PlateElement>
  );
};

/* --------------------------------- Card ---------------------------------- */

export const CardElementComponent = (props: PlateElementProps): React.ReactElement => {
  const element = props.element as CardElement;
  const tags = element.tags ?? [];
  return (
    <PlateElement {...props} as="article" className="pdoc-card" style={textAlignStyle(element)}>
      {element.aside ? (
        <div className="pdoc-card__aside" contentEditable={false}>
          {element.aside}
        </div>
      ) : null}
      <div className="pdoc-card__main">
        {element.title || element.meta ? (
          <div className="pdoc-card__head" contentEditable={false}>
            {element.title ? (
              <span className="pdoc-card__title">{element.title}</span>
            ) : null}
            {element.meta ? (
              <span className="pdoc-card__meta">{element.meta}</span>
            ) : null}
          </div>
        ) : null}
        <div className="pdoc-card__body">{props.children}</div>
        {tags.length > 0 ? (
          <div className="pdoc-card__tags" contentEditable={false}>
            {tags.map((tag) => (
              <span key={tag} className="pdoc-chip">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </PlateElement>
  );
};

/* ------------------------------- Key / value ------------------------------ */

export const KeyValueElementComponent = (props: PlateElementProps): React.ReactElement => (
  <PlateElement {...props} as="dl" className="pdoc-kv">
    {props.children}
  </PlateElement>
);

export const KeyValueItemElementComponent = (props: PlateElementProps): React.ReactElement => {
  const element = props.element as KeyValueItemElement;
  return (
    <PlateElement {...props} className="pdoc-kv__row">
      <span className="pdoc-kv__label" contentEditable={false}>
        {element.label}
      </span>
      <span className="pdoc-kv__value" style={textAlignStyle(element)}>{props.children}</span>
    </PlateElement>
  );
};

/* ------------------------------- Page break ------------------------------- */

export const PageBreakElementComponent = (props: PlateElementProps): React.ReactElement => (
  <PlateElement {...props} className="pdoc-page-break">
    <div className="pdoc-page-break__rule" contentEditable={false}>
      <span className="pdoc-page-break__label">Page break</span>
    </div>
    {props.children}
  </PlateElement>
);
