/**
 * The figure data format. A figure is data: authors own the facts and the argument,
 * `render.ts` owns every pixel, the table and (unless authored) the text equivalent.
 *
 * Rules the renderer enforces (it throws) and `check.ts` reports:
 * - A flow has exactly one station with `constraint: true`, or none plus a `noConstraint` reason.
 * - A queue of 0 draws no squares; the count "0" is still printed.
 * - `capacity.count` draws that many circles. No count, no circles; the label prints when given.
 * - A capacity needs a count or a label.
 * - Nothing is colored except the loop around the constraint, its leader and the word "constraint".
 */

/** One figure: a numbered drawing with its caption, table and text equivalent. */
export type Figure = {
  /** "fig-1". Used as the prefix for element ids and as the jitter seed. Keep it stable. */
  id: string;
  /** Printed as "Fig. n" in the caption. */
  number: number;
  /** Mono title, used in the SVG <title> and the table caption. */
  title: string;
  /** "Numbers are illustrative." Printed small under the caption and in the table caption. */
  note?: string;
  /** One row per flow, drawn top to bottom. */
  flows: Flow[];
  /** The argument. Authored, never generated. Required. */
  caption: string;
  /** Set the caption as a pull quote (D's `.pull`: italic, large, 30ch); "Fig. n" and the title stay as the mono line above. */
  pull?: true;
  /**
   * Text equivalent. Generated from the data when omitted. If authored, it must still
   * name every station and contain the word "constraint" (or each flow's `noConstraint` reason).
   */
  text?: string;
  /** Optional live sentence, shown before the drawing. Static HTML without JavaScript. */
  sentence?: Sentence;
};

/** A row of stations along one flow line. */
export type Flow = {
  /** "Fleet", "Now", "Before". Mono. Left of the row if every label in the figure is short, else above it. */
  label?: string;
  /** In flow order. */
  stations: Station[];
  /** "arrow" draws an open chevron. `{ stop }` ends the line in a plain tick labelled with the words. */
  end: "arrow" | { stop: string };
  /** Required when no station is the constraint: the reason, in words. */
  noConstraint?: string;
};

/** One station: a small open circle on the line, with its queue and capacity. */
export type Station = {
  /**
   * Sans 600. Below the line on wide drawings, beside it on narrow ones. Wrapped (two balanced lines)
   * if it does not fit. A "\n" forces the break where the phrase allows it ("agents in\nseparate workspaces");
   * outside the drawing (table, text equivalent, SVG title, check.ts) the newline reads as a space.
   */
  name: string;
  /** Work waiting at this station: open squares, or filled squares when `state` is "in-progress". */
  queue?: { count: number; state?: "waiting" | "in-progress" };
  /**
   * `count` draws that many small circles on the other side of the line. `label` prints when given;
   * it may be omitted when the count alone says it (one circle under "review by Martin"). One of the two is required.
   */
  capacity?: { count: number; label?: string } | { count?: undefined; label: string };
  /** The loop, the leader, the word "constraint". At most one per flow. */
  constraint?: true;
  /**
   * Fan out into `count` parallel lanes (the main line is one of them), each carrying this
   * station's queue. `more` adds three dots beyond the outermost lane: "some, not exactly this many".
   */
  lanes?: { count: number; more?: boolean };
};

/** A live sentence: the text-first form of the figure, computed by a model under models/. */
export type Sentence = {
  /** Module name under models/, for example "review-queue". */
  model: string;
  /** Default values and bounds. `label` becomes the control's accessible name. */
  inputs: Record<string, { value: number; min: number; max: number; label: string }>;
};

/** What `render()` returns. Every value is an HTML string. */
export type Rendered = {
  /** The horizontal SVG, shown from 64rem. */
  wide: string;
  /** The vertical SVG, capped at 25rem and drawn 1:1 for a 360px screen. */
  narrow: string;
  /** The real <table>. */
  table: string;
  /** The visible text equivalent paragraph, the target of both SVGs' aria-describedby. */
  text: string;
  /** The live sentence markup, or "" when the figure has none. */
  sentence: string;
  /** The complete block: sentence, <figure> with both SVGs and caption, then text and table. */
  figure: string;
};
