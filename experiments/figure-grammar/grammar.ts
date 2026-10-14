/**
 * The pen grammar as named constants. Every value was measured from direction D's hand-built
 * SVG (experiments/identity-specimens/d-drawn/index.html) unless the comment says otherwise.
 * Units are SVG user units. The wide drawing is 960 units across; the narrow one is 328 units,
 * drawn 1:1 on a 360px screen. Colors and stroke widths live in D's styles.css (one source for
 * paper, ink and signal); they are repeated in STROKE for reference only.
 */

/** Marks shared by both orientations. */
export const MARK = {
  /** Queue square side. D: 10. Big enough to count, small enough for a 48-square tower. */
  square: 10,
  /** Centre-to-centre distance of squares, both axes. D: 14 (x 63, 77, 91...; y 208, 194, 180...). Leaves a 4-unit gap the eye uses to separate items. */
  squarePitch: 14,
  /** Squares are grouped in fives so they can be counted. D: 5. */
  group: 5,
  /** Each corner is nudged by up to this much, seeded. D: 0.6. Hand-set without becoming hard to count. */
  jitter: 0.6,
  /** Station circle radius, sitting on the line. D: 5. */
  stationR: 5,
  /** Capacity circle radius. D: 3.5. Smaller than a station so the two never read as the same mark. */
  capR: 3.5,
  /** Capacity circle pitch. D: 12 (444, 456, 468...). */
  capPitch: 12,
  /** Open chevron arrowhead: 10 back, 5 to each side, tip 2 beyond the line end. D: "M926 231 L936 236 L926 241" on a line ending at 934. */
  arrow: { back: 10, half: 5, overshoot: 2 },
  /** Half length of the plain tick that stops a line. D: 7 ("M880 143 V157"). */
  stopTick: 7,
  /** Gap between a lane and the square it carries. D: 7 (square bottom 143 on lane 150). */
  laneSquareGap: 7,
  /** "Some, not this many": three dots beyond the outermost lane. D: r 1.3 at 28, 35 and 42 units out. */
  laneDot: { r: 1.3, offsets: [28, 35, 42] },
  /** Count numerals are all or nothing per figure: on if any queue is zero or more than one group of
   * five, and then every queue prints its count. Not from D, which printed every count in Figure 1 and
   * none in Figure 2; this rule reproduces both (round 2). */
  countAbove: 5,
} as const;

/** The hand-drawn loop around the constraint. */
export const LOOP = {
  /** Samples along the stroke, joined by a Catmull-Rom curve (tension 1/6, end points doubled). D: 31. */
  points: 31,
  /** One full turn plus about 30 degrees, so the end passes the start. D: 390 degrees. */
  sweep: 390,
  /** Where the pen starts, in degrees (0 = right, 90 = down). D: about -138 wide, -114 to -123 narrow; seeded within +-8. */
  start: -126,
  startJitter: 8,
  /** The radius drifts outward over the stroke, so the closing pass sits outside the start. D: 8%. */
  drift: 0.08,
  /** Three low-amplitude sine terms on the radius: [harmonic, amplitude]. Phases are seeded. Measured by eye from D's loops; amplitudes sum to 6%. */
  wobble: [[2, 0.03], [3, 0.018], [5, 0.012]] as const,
  /** Clear space between the enclosed marks and the loop. Round 2: 6, so the loop hugs the block the way a pen does. */
  pad: 6,
  /** Smallest radius. Round 2: 24. D's smallest radius was 41 (wide, review by Martin). */
  minR: 24,
  /** Radii are the enclosed box's half-extents times this, plus pad: the loop hugs the block and lets the box's
   * far corners poke out slightly, as D's do (D Fig. 1 narrow: squares corner at 1.05 of its ellipse). Round 2. */
  hug: 1.2,
  /** Aspect ratio (rx/ry) follows the enclosed box's own (power 1), clamped to 1 to 3.5. Round 2; D's narrow loops are about 2:1 to 3:1. */
  aspectMin: 1,
  aspectMax: 3.5,
  /** How far the loop may bleed past the viewBox edge before it is pushed in. D bled 3.2 units on Figure 2 narrow. */
  bleed: 6,
  /** At a drawing edge the loop may tighten to this share of its width before it is moved off-centre. Round 2. */
  edgeTighten: 0.85,
} as const;

/** Stroke widths, from D's styles.css (reference only; the stylesheet applies them). */
export const STROKE = {
  /** Flow line, ruled, not freehand. */
  line: 1.25,
  station: 1.5,
  square: 1.1,
  capacity: 1.1,
  /** Round caps and vector-effect: non-scaling-stroke keep it a pen line at every size. */
  loop: 1.6,
  leader: 1.2,
  /** Paper knockout behind every SVG label (paint-order: stroke), so grid lines stop short of text. */
  knockout: 5,
} as const;

/** Font sizes in user units. Wide renders at 0.91 to 1.15 px per unit from 64rem; narrow at 1:1. Everything is 14px or more. */
export const TYPE = {
  wide: { name: 18, count: 16, cap: 16, note: 16, row: 16, sig: 16 },
  narrow: { name: 16, count: 16, cap: 14, note: 14, row: 16, sig: 14 },
  /** Estimated advance widths in em, for layout without a browser. Plex Mono is 0.6em exactly. */
  monoAdvance: 0.6,
  /** Plex Sans SemiBold, estimated per glyph class. A 5% safety margin is added in render.ts. */
  sans: { narrow: 0.27, mid: 0.38, wide: 0.84, upper: 0.65, digit: 0.57, space: 0.25, other: 0.55 },
  /** Ascent used for text bounding boxes. */
  ascent: 0.78,
  descent: 0.22,
} as const;

/** The horizontal drawing. */
export const WIDE = {
  width: 960,
  /** Line starts here when no row label sits in a left gutter. D Figure 1: 24. */
  lineStart: 24,
  /** Line ends here for an arrow. D: 934. */
  lineEnd: 934,
  /** Row labels sit left of the line if every label is at most this wide, else above the row. "Fleet" fits; "After a second reviewer" does not. */
  gutterMax: 80,
  /** Space between a left row label and the line start. D: "Fleet" ends near 48, line starts at 70. */
  gutterGap: 18,
  /** Stations sit at the centres of equal slots across [lineStart - 24, lineEnd]. Reproduces D Figure 1 (96, 282, 468, 654, 840) within 3 units. */
  slotLead: 24,
  /** Bottom of the first square row above the line. D: 18 (218 on a line at 236). */
  queueGap: 18,
  /** Count numeral baseline above the top square row. D: 10 (72 over 82). */
  countGap: 10,
  /** Capacity circles below the line. D: 20. */
  capY: 20,
  /** Station name baseline below the line, and extra lines. D: 56; 22 for "separate workspaces". */
  nameY: 56,
  nameLine: 22,
  /** Capacity text baseline under the last name line, and extra lines. D: 24; 20. */
  capTextGap: 24,
  capLine: 20,
  /** Lane spacing. D: 32 (150, 118, 86, 54). */
  lanePitch: 32,
  /** Lanes leave the main line this far before the station, run flat from `flat` before it, and rejoin at the next station (round 2), descending over 1.55 × (leave − flat). D: 140, 76, rejoin 180 after at "code appears", descent 100. */
  fan: { leave: 140, flat: 76 },
  /** Minimum clear space between neighbouring labels. */
  textGap: 20,
  /** Minimum clear space between neighbouring marks above the line. */
  markGap: 12,
  /** Room the arrowhead needs after the last station. */
  arrowRoom: 40,
  /** Leader from the loop's upper right, curving out then up to the word. D Figure 1: from -40 degrees, (54, -50); Figure 2: (31, -38). Flipped left when the word would leave the drawing. */
  leader: { angle: -40, dx: 46, dy: -44, ctrl: [0.66, 0.3], label: [6, 4] },
  /** Leader from the top of the loop with the word centred above: used when the constraint is the last station
   * (the arrowhead must stay outside the loop) or the word has no room beside it. Round 2, not in D. */
  leaderTop: { angle: -84, dx: 10, dy: -30, ctrl: [0.15, 0.65], label: [0, -6] },
  /** The arrowhead's back clears a loop around the last station by this much. Round 2. */
  arrowClear: 12,
  /** Space between row bands. D Figure 2: about 59. */
  rowGap: 44,
  /** Space above the first band and below the last. D: 10 to 60 (Figure 1 had room to spare). */
  edge: 10,
} as const;

/** The vertical drawing. */
export const NARROW = {
  width: 328,
  /** The flow line runs down the left. D: x 28. */
  lineX: 28,
  /** Names, capacity text and squares start here. D: 46. */
  textX: 46,
  /** Counts are right-aligned here, on the name's baseline. D: 326. */
  countRight: 326,
  /** Capacity circles stack on the left of the line (the rotated "below"). D: x 12, from 18 below the station, pitch 12. */
  capX: 12,
  capDy: 18,
  /** Name baseline relative to the station, and extra lines. D: 6; 20. */
  nameDy: 6,
  nameLine: 20,
  /** Capacity text baseline below the station, and extra lines. D: 28 (Figure 1) and 26 (Figure 2); 18. */
  capDy2: 28,
  capLine: 18,
  /** Squares run in rows of ten with a gap after five. D: 4 extra units (102.2 to 119.9). */
  groupGap: 4,
  /** First square row top below the last text baseline. D: 12. */
  squaresGap: 12,
  /** Space between one station block and the next station. D: 32 to 40. */
  stationGap: 36,
  /** First station below the line start, line start below a row label. D: 14 to 16; 18 to 20. */
  firstStation: 14,
  labelToLine: 20,
  /** Line end after the last block, for the arrow. D: 22. */
  lineTail: 22,
  /** Lane spacing and the fan, rotated. D: lanes at 28, 58, 88, 118; leave 75 before, flat from 45. */
  lanePitch: 30,
  fan: { leave: 75, flat: 45 },
  /** Clear space between a fan's rejoin and the next station. D: 0: the lanes rejoin at the next station (round 2). */
  fanClear: 0,
  /** A lane's square sits up and right of the lane station: [dx to its left edge, dy to its top]. D: (+10, -10). */
  laneSquare: [10, -10],
  /** Dots beyond the outermost lane, rotated, and the gap to the lane station's name. D: 16, 23, 30, which overlaps
   * the last lane's square; 23, 30, 37 clears it. Name 10 after the last dot (D: 13). */
  laneDots: [23, 30, 37],
  laneNameGap: 10,
  /** Leader from the loop's lower right, out then down. D: from about 30 degrees, (36, 22), label at (+4, +6). */
  leader: { angle: 30, dx: 36, dy: 22, ctrl: [0.62, 0.17], label: [4, 6] },
  /** Next station clears the loop and its word by this much. D: 17. */
  loopClear: 16,
  rowGap: 36,
  edge: 10,
} as const;
