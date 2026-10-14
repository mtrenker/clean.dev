/**
 * Figure data in, markup out. `render(figure)` returns { wide, narrow, table, text, sentence, figure },
 * all HTML strings. Layout is computed from the data: station spacing from the labels and queues,
 * heights from the tallest stack, lanes from `lanes.count`, the loop from the marks it encloses.
 * Output is deterministic: jitter and loop wobble are seeded from the figure id.
 * Classes are D's (styles.css), so paper, ink, signal and stroke widths have one source.
 */
import type { Figure, Flow, Station, Rendered } from "./types.ts";
import { MARK, LOOP, TYPE, WIDE, NARROW } from "./grammar.ts";
import * as reviewQueue from "./models/review-queue.js";

type Model = {
  compute: (inputs: Record<string, number>) => Record<string, number>;
  lines: (inputs: Record<string, number>, outputs?: Record<string, number>) => Array<Array<{ text?: string; input?: string; output?: string }>>;
  note?: string;
};
const MODELS: Record<string, Model> = { "review-queue": reviewQueue as unknown as Model };

// ---------- small helpers ----------

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const n1 = (v: number) => { const r = Math.round(v * 10) / 10; return String(Object.is(r, -0) ? 0 : r); };
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lcFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
const word = (n: number) => WORDS[n] ?? String(n);
const listAnd = (xs: string[]) => xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
/** "constraint" is the one word that carries the signal color, wherever it appears. */
/** A "\n" in a station name is a forced line break in the drawing and a space everywhere else. */
const plain = (name: string) => name.replace(/\s*\n\s*/g, " ");
const nameLines = (name: string) => name.split(/\s*\n\s*/);
const sigWords = (html: string) => html.replace(/\bconstraint\b/g, '<span class="sig-word">constraint</span>');

/** FNV-1a, then mulberry32: a tiny seeded generator so `node build.ts` is deterministic. */
function rng(seed: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Estimated text width in user units. Mono is exact (0.6em); sans is estimated per glyph class plus 5%. */
function textWidth(s: string, size: number, mono: boolean): number {
  if (mono) return s.length * TYPE.monoAdvance * size;
  const w = TYPE.sans;
  let em = 0;
  for (const c of s) {
    if (c === " ") em += w.space;
    else if ("ijl.,:;'|!".includes(c)) em += w.narrow;
    else if ("frtI()-/".includes(c)) em += w.mid;
    else if ("mwMW".includes(c)) em += w.wide;
    else if (/[0-9]/.test(c)) em += w.digit;
    else if (/[A-Z]/.test(c)) em += w.upper;
    else em += w.other;
  }
  return em * size * 1.05;
}

/** Split a label into lines: a slash list stacks one item per line; otherwise two balanced lines. */
function wrap(s: string, size: number, mono: boolean): string[] {
  if (s.includes(" / ")) return s.split(" / ");
  const words = s.split(" ");
  if (words.length < 2) return [s];
  let best: string[] = [s];
  let bestW = Infinity;
  for (let i = 1; i < words.length; i++) {
    const lines = [words.slice(0, i).join(" "), words.slice(i).join(" ")];
    const w = Math.max(...lines.map((l) => textWidth(l, size, mono)));
    if (w < bestW) { bestW = w; best = lines; }
  }
  return best;
}

type Pt = [number, number];
type Box = { x0: number; y0: number; x1: number; y1: number };
const boxOf = (pts: Pt[]): Box => ({
  x0: Math.min(...pts.map((p) => p[0])), y0: Math.min(...pts.map((p) => p[1])),
  x1: Math.max(...pts.map((p) => p[0])), y1: Math.max(...pts.map((p) => p[1])),
});
const boxPts = (b: Box): Pt[] => [[b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0, b.y1]];
const textBox = (x: number, y: number, w: number, size: number, anchor: "start" | "middle" | "end"): Box => {
  const x0 = anchor === "start" ? x : anchor === "middle" ? x - w / 2 : x - w;
  return { x0, y0: y - size * TYPE.ascent, x1: x0 + w, y1: y + size * TYPE.descent };
};

// ---------- validation (the rules check.ts reports; the renderer refuses to draw a broken figure) ----------

export function validate(fig: Figure): string[] {
  const errors: string[] = [];
  if (!fig.caption?.trim()) errors.push("caption is required; it is the argument and is never generated");
  if (!fig.flows?.length) errors.push("a figure needs at least one flow");
  fig.flows?.forEach((flow, f) => {
    const where = flow.label ? `flow "${flow.label}"` : `flow ${f + 1}`;
    const n = flow.stations.filter((s) => s.constraint).length;
    if (n > 1) errors.push(`${where} has ${n} constraints; a flow has exactly one`);
    if (n === 0 && !flow.noConstraint?.trim()) errors.push(`${where} has no constraint; mark one or give noConstraint with the reason`);
    if (!flow.stations.length) errors.push(`${where} has no stations`);
    for (const s of flow.stations) {
      if (s.queue && (!Number.isInteger(s.queue.count) || s.queue.count < 0)) errors.push(`${s.name}: queue.count must be a whole number`);
      if (s.capacity?.count !== undefined && (!Number.isInteger(s.capacity.count) || s.capacity.count < 1)) errors.push(`${s.name}: capacity.count must be 1 or more`);
      if (s.capacity && s.capacity.count === undefined && !s.capacity.label?.trim()) errors.push(`${s.name}: capacity needs a count or a label`);
      if (s.lanes && (!Number.isInteger(s.lanes.count) || s.lanes.count < 2)) errors.push(`${s.name}: lanes.count must be 2 or more`);
    }
  });
  if (fig.text) {
    for (const flow of fig.flows) for (const s of flow.stations) {
      if (!fig.text.toLowerCase().includes(plain(s.name).toLowerCase())) errors.push(`authored text does not name the station "${plain(s.name)}"`);
    }
    for (const flow of fig.flows) {
      const hasC = flow.stations.some((s) => s.constraint);
      if (hasC && !/\bconstraint\b/i.test(fig.text)) errors.push(`authored text does not contain the word "constraint"`);
    }
  }
  return errors;
}

// ---------- shared drawing pieces ----------

/** A queue square as a four-point path with each corner nudged, seeded per square. */
function square(x: number, y: number, seed: string, wip: boolean): string {
  const r = rng(seed);
  const j = () => (r() * 2 - 1) * MARK.jitter;
  const s = MARK.square;
  const c: Pt[] = [[x + j(), y + j()], [x + s + j(), y + j()], [x + s + j(), y + s + j()], [x + j(), y + s + j()]];
  return `<path class="sq${wip ? " wip" : ""}" d="M${c.map((p) => `${n1(p[0])} ${n1(p[1])}`).join(" L")}Z"/>`;
}

const circle = (cls: string, x: number, y: number, r: number) => `<circle class="${cls}" cx="${n1(x)}" cy="${n1(y)}" r="${r}"/>`;

function text(cls: string, x: number, y: number, lines: string[], lineH: number, anchor: "start" | "middle" | "end"): string {
  const a = anchor === "start" ? "" : ` text-anchor="${anchor}"`;
  const first = esc(lines[0]);
  const rest = lines.slice(1).map((l) => `<tspan x="${n1(x)}" dy="${lineH}">${esc(l)}</tspan>`).join("");
  return `<text class="${cls}" x="${n1(x)}" y="${n1(y)}"${a}>${first}${rest}</text>`;
}

/** Catmull-Rom through the points (tension 1/6, end points doubled), as one cubic path. */
function smooth(pts: Pt[]): string {
  let d = `M${n1(pts[0][0])} ${n1(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${n1(c1[0])} ${n1(c1[1])} ${n1(c2[0])} ${n1(c2[1])} ${n1(p2[0])} ${n1(p2[1])}`;
  }
  return d;
}

type LoopShape = { cx: number; cy: number; rx: number; ry: number; at: (deg: number) => Pt; path: string; box: Box };

/** The pen loop: a wobbling ellipse around the given points, one turn plus about 30 degrees, drifting outward. */
function loop(points: Pt[], seed: string, width: number): LoopShape {
  const b = boxOf(points);
  let cx = (b.x0 + b.x1) / 2;
  const cy = (b.y0 + b.y1) / 2;
  // hug the block: radii follow the enclosed box's own half-extents (aspect power 1), so the far corners
  // of the box may poke out a little, as they do in D's loops; then pad, clamp the aspect, apply the minimum
  const a = Math.max(1, (b.x1 - b.x0) / 2), bb = Math.max(1, (b.y1 - b.y0) / 2);
  let rx = a * LOOP.hug + LOOP.pad, ry = bb * LOOP.hug + LOOP.pad;
  if (rx < ry * LOOP.aspectMin) rx = ry * LOOP.aspectMin;
  if (rx > ry * LOOP.aspectMax) ry = rx / LOOP.aspectMax;
  rx = Math.max(LOOP.minR, rx);
  ry = Math.max(LOOP.minR, ry);
  const reach = 1 + LOOP.drift / 2 + LOOP.wobble.reduce((s, w) => s + w[1], 0);
  // at a drawing edge, tighten the loop (up to a limit) before moving it off its marks
  const room = Math.min(cx + LOOP.bleed, width + LOOP.bleed - cx) / reach;
  if (rx > room) rx = Math.max(room, rx * LOOP.edgeTighten);
  if (cx - rx * reach < -LOOP.bleed) cx = rx * reach - LOOP.bleed;
  if (cx + rx * reach > width + LOOP.bleed) cx = width + LOOP.bleed - rx * reach;
  const r = rng(seed);
  const start = LOOP.start + (r() * 2 - 1) * LOOP.startJitter;
  const phases = LOOP.wobble.map(() => r() * Math.PI * 2);
  const radius = (deg: number, t: number) => {
    const th = (deg * Math.PI) / 180;
    const w = 1 + LOOP.wobble.reduce((s, [h, amp], i) => s + amp * Math.sin(h * th + phases[i]), 0);
    return (1 + LOOP.drift * (t - 0.5)) * w;
  };
  const pt = (deg: number, t: number): Pt => {
    const s = radius(deg, t), th = (deg * Math.PI) / 180;
    return [cx + rx * s * Math.cos(th), cy + ry * s * Math.sin(th)];
  };
  const pts: Pt[] = [];
  for (let i = 0; i < LOOP.points; i++) {
    const t = i / (LOOP.points - 1);
    pts.push(pt(start + LOOP.sweep * t, t));
  }
  const at = (deg: number) => {
    let d = deg;
    while (d < start) d += 360;
    while (d >= start + 360) d -= 360;
    return pt(d, (d - start) / LOOP.sweep);
  };
  return { cx, cy, rx, ry, at, path: smooth(pts), box: boxOf(pts) };
}

type Sig = { markup: string; box: Box };

/** Loop, leader and the word "constraint". Flips the leader to the other side if the word would leave the drawing. */
type LeaderSpec = { angle: number; dx: number; dy: number; ctrl: readonly number[]; label: readonly number[] };

/** Leader from the top of the loop, word centred above it: for a constraint at the end of the line, or a word with no room beside the loop. */
function signalTop(l: LoopShape, spec: LeaderSpec, size: number, width: number): Sig {
  const w = textWidth("constraint", size, true);
  const [sx, sy] = l.at(spec.angle);
  const ex = sx + spec.dx, ey = sy + spec.dy;
  const qx = sx + spec.dx * spec.ctrl[0], qy = sy + spec.dy * spec.ctrl[1];
  const tx = clamp(ex + spec.label[0], w / 2 + 2, width - w / 2 - 2), ty = ey + spec.label[1];
  const tb = textBox(tx, ty, w, size, "middle");
  const markup = [
    `<g class="sig">`,
    `<path class="loop" d="${l.path}"/>`,
    `<path class="leader" d="M${n1(sx)} ${n1(sy)} Q${n1(qx)} ${n1(qy)} ${n1(ex)} ${n1(ey)}"/>`,
    text("t-sig", tx, ty, ["constraint"], 0, "middle"),
    `</g>`,
  ].join("\n");
  return { markup, box: { x0: Math.min(l.box.x0, tb.x0), y0: Math.min(l.box.y0, tb.y0), x1: Math.max(l.box.x1, tb.x1), y1: Math.max(l.box.y1, tb.y1) } };
}

function signal(l: LoopShape, spec0: LeaderSpec, size: number, width: number, top?: LeaderSpec): Sig {
  let spec = spec0;
  const w = textWidth("constraint", size, true);
  let flip = false;
  const make = (flipped: boolean) => {
    const angle = flipped ? 180 - spec.angle : spec.angle;
    const sgn = flipped ? -1 : 1;
    const [sx, sy] = l.at(angle);
    const ex = sx + sgn * spec.dx, ey = sy + spec.dy;
    const qx = sx + sgn * spec.dx * spec.ctrl[0], qy = sy + spec.dy * spec.ctrl[1];
    const tx = ex + sgn * spec.label[0], ty = ey + spec.label[1];
    return { sx, sy, ex, ey, qx, qy, tx, ty, anchor: (flipped ? "end" : "start") as "start" | "end" };
  };
  // walk the attach point away from the edge (toward the loop's top or bottom) before flipping sides
  let g = make(false);
  const base = spec.angle;
  const toward = base < 0 ? -1 : 1;
  for (let step = 1; g.tx + w > width - 2 && step <= 4; step++) {
    spec = { ...spec, angle: base + toward * 10 * step };
    g = make(false);
  }
  if (g.tx + w > width - 2 && top) return signalTop(l, top, size, width);
  if (g.tx + w > width - 2) { spec = { ...spec, angle: base }; flip = true; g = make(true); }
  const tb = textBox(g.tx, g.ty, w, size, g.anchor);
  const markup = [
    `<g class="sig">`,
    `<path class="loop" d="${l.path}"/>`,
    `<path class="leader" d="M${n1(g.sx)} ${n1(g.sy)} Q${n1(g.qx)} ${n1(g.qy)} ${n1(g.ex)} ${n1(g.ey)}"/>`,
    text("t-sig", g.tx, g.ty, ["constraint"], 0, flip ? "end" : "start").replace(' text-anchor="start"', ""),
    `</g>`,
  ].join("\n");
  return { markup, box: { x0: Math.min(l.box.x0, tb.x0), y0: Math.min(l.box.y0, tb.y0), x1: Math.max(l.box.x1, tb.x1), y1: Math.max(l.box.y1, tb.y1) } };
}

/**
 * Count numerals are all or nothing per figure (round 2): a figure prints them if any queue cannot be read
 * at a glance (zero, or more than one group of five), and then every station with a queue prints its count.
 * Lanes never print: their squares are a drawing of "some". See NOTES.md section 9 on in-progress.
 */
const countsOn = (fig: Figure) => fig.flows.some((fl) => fl.stations.some((s) => s.queue && !s.lanes && (s.queue.count === 0 || s.queue.count > MARK.countAbove)));
let COUNTS = false; // set per render() call; render is synchronous
const showCount = (s: Station) => COUNTS && !!s.queue && !s.lanes;
const countText = (s: Station) => `${s.queue!.count}${s.queue!.state === "in-progress" ? " in progress" : ""}`;

// ---------- wide (horizontal) ----------

type Band = { lines: string[]; sig: string[]; top: number; bottom: number };

function wideFlow(fig: Figure, f: number, flow: Flow, lineY: number, gutter: number, labelAbove: boolean, shrink = 0): Band {
  const T = TYPE.wide;
  const lineStart = gutter > 0 ? gutter : WIDE.lineStart;
  const stop = typeof flow.end === "object" ? flow.end.stop : null;
  const names = flow.stations.map((s) => nameLines(s.name));
  const caps = flow.stations.map((s) => (s.capacity?.label ? [s.capacity.label] : []));

  // half extents of each slot: below the line (labels, capacity) and above it (queue, lanes, count)
  const measure = () => {
    const items = flow.stations.map((s, i) => {
      const nameW = Math.max(...names[i].map((l) => textWidth(l, T.name, false)));
      const capW = Math.max(0, ...caps[i].map((l) => textWidth(l, T.cap, true)));
      const circles = s.capacity?.count ? ((s.capacity.count - 1) * MARK.capPitch) / 2 + MARK.capR : 0;
      const cols = s.queue ? Math.min(MARK.group, s.queue.count) : 0;
      const qHalf = cols ? (cols * MARK.squarePitch - 4) / 2 : 0;
      const cHalf = showCount(s) ? textWidth(countText(s), T.count, true) / 2 : 0;
      return {
        below: Math.max(nameW / 2, capW / 2, circles, MARK.stationR),
        above: Math.max(s.lanes ? WIDE.fan.leave : 0, qHalf, cHalf, MARK.stationR),
      };
    });
    if (stop) items.push({ below: textWidth(stop, T.note, true) / 2, above: MARK.stopTick });
    return items;
  };

  // water-fill: stations at the centres of equal slots, widened only where neighbours need more room
  const solve = (): number[] | null => {
    const it = measure();
    const L = lineStart - WIDE.slotLead, R = WIDE.lineEnd - shrink;
    const req = it.slice(1).map((b, i) => Math.max(it[i].below + b.below + WIDE.textGap, it[i].above + b.above + WIDE.markGap));
    const head = Math.max(it[0].below - L, lineStart + 16 - L, lineStart + it[0].above - L);
    const last = it[it.length - 1];
    const tail = stop ? last.below : Math.max(last.below, WIDE.arrowRoom);
    const total = (g: number) => Math.max(g / 2, head) + req.reduce((s, r) => s + Math.max(g, r), 0) + Math.max(g / 2, tail);
    if (total(0) > R - L) return null;
    let lo = 0, hi = R - L;
    for (let k = 0; k < 60; k++) { const g = (lo + hi) / 2; if (total(g) > R - L) hi = g; else lo = g; }
    const g = lo;
    const xs = [L + Math.max(g / 2, head)];
    req.forEach((r) => xs.push(xs[xs.length - 1] + Math.max(g, r)));
    return xs;
  };

  let xs = solve();
  while (!xs) {
    // wrap the widest label that can still wrap, then try again
    let best: { kind: "name" | "cap"; i: number; w: number } | null = null;
    flow.stations.forEach((s, i) => {
      if (names[i].length === 1 && s.name.includes(" ")) { // an authored "\n" break is never re-wrapped
        const w = textWidth(s.name, T.name, false);
        if (!best || w > best.w) best = { kind: "name", i, w };
      }
      if (caps[i].length === 1 && caps[i][0].includes(" ")) {
        const w = textWidth(caps[i][0], T.cap, true);
        if (!best || w > best.w) best = { kind: "cap", i, w };
      }
    });
    if (!best) throw new Error(`${fig.id}: flow ${f + 1} does not fit the wide drawing even with wrapped labels`);
    const b = best as { kind: "name" | "cap"; i: number };
    if (b.kind === "name") names[b.i] = wrap(names[b.i][0], T.name, false);
    else caps[b.i] = wrap(caps[b.i][0], T.cap, true);
    xs = solve();
  }

  const lines: string[] = [];
  const marks: string[] = [];
  const sig: string[] = [];
  const boxes: Box[] = [];
  const y0 = lineY;
  const lastX = xs[xs.length - 1];
  const lineEnd = stop ? lastX : WIDE.lineEnd;

  if (flow.label) {
    if (labelAbove) { /* placed after the band top is known */ }
    else {
      marks.push(text("t-row", 0, y0 + 5, [flow.label], 0, "start"));
      boxes.push(textBox(0, y0 + 5, textWidth(flow.label, T.row, true), T.row, "start"));
    }
  }
  if (stop) {
    const ty = y0 + WIDE.nameY;
    marks.push(text("t-note", lineEnd, ty, [stop], 0, "middle"));
    boxes.push(textBox(lineEnd, ty, textWidth(stop, T.note, true), T.note, "middle"));
  }
  let loopRight = -Infinity; // right edge of a loop around the last station

  flow.stations.forEach((s, i) => {
    const x = xs[i];
    const own: Pt[] = []; // marks the loop must enclose
    const ownText: Box[] = [];
    const wip = s.queue?.state === "in-progress";
    const laneYs = s.lanes ? Array.from({ length: s.lanes.count }, (_, j) => y0 - j * WIDE.lanePitch) : [y0];

    // lanes: S-curves out of the main line, flat past the station, back in
    if (s.lanes) {
      // lanes rejoin at the next station (or the line's end), so they converge into what follows
      const { leave, flat } = WIDE.fan;
      const d = i + 1 < xs.length ? xs[i + 1] : x + leave;
      const a = x - leave, b = x - flat, c = Math.max(x + flat, d - (leave - flat) * 1.55);
      const ri = d - c, ro = b - a;
      for (const ly of laneYs.slice(1)) {
        lines.push(`<path class="ln" d="M${n1(a)} ${n1(y0)} C${n1(a + ro * 0.56)} ${n1(y0)} ${n1(a + ro * 0.44)} ${n1(ly)} ${n1(b)} ${n1(ly)} H${n1(c)} C${n1(c + ri * 0.42)} ${n1(ly)} ${n1(d - ri * 0.42)} ${n1(y0)} ${n1(d)} ${n1(y0)}"/>`);
      }
    }

    // queue
    if (s.queue && s.queue.count > 0) {
      const q: string[] = [];
      if (s.lanes) {
        const c = s.queue.count;
        laneYs.forEach((ly, j) => {
          for (let k = 0; k < c; k++) {
            const sx = x - (c * MARK.squarePitch - 4) / 2 + k * MARK.squarePitch;
            const sy = ly - MARK.laneSquareGap - MARK.square;
            q.push(square(sx, sy, `${fig.id}:${f}:${i}:${j}:${k}`, wip));
            own.push(...boxPts({ x0: sx, y0: sy, x1: sx + MARK.square, y1: sy + MARK.square }));
          }
        });
      } else {
        const cols = Math.min(MARK.group, s.queue.count);
        const left = x - (cols * MARK.squarePitch - 4) / 2;
        for (let k = 0; k < s.queue.count; k++) {
          const sx = left + (k % MARK.group) * MARK.squarePitch;
          const sy = y0 - WIDE.queueGap - MARK.square - Math.floor(k / MARK.group) * MARK.squarePitch;
          q.push(square(sx, sy, `${fig.id}:${f}:${i}:${k}`, wip));
          own.push(...boxPts({ x0: sx, y0: sy, x1: sx + MARK.square, y1: sy + MARK.square }));
        }
      }
      marks.push(`<g class="q">\n${q.join("\n")}\n</g>`);
    }
    if (showCount(s)) {
      const c = s.queue!.count;
      const rows = Math.ceil(c / MARK.group);
      const ty = c === 0 ? y0 - WIDE.queueGap : y0 - WIDE.queueGap - MARK.square - (rows - 1) * MARK.squarePitch - WIDE.countGap;
      const label = countText(s);
      marks.push(text("t-count", x, ty, [label], 0, "middle"));
      ownText.push(textBox(x, ty, textWidth(label, T.count, true), T.count, "middle"));
    }
    // stations, one per lane
    for (const ly of laneYs) { marks.push(circle("st", x, ly, MARK.stationR)); own.push([x - 5, ly - 5], [x + 5, ly + 5]); }
    if (s.lanes?.more) {
      const top = laneYs[laneYs.length - 1];
      marks.push(`<g class="lane-more" aria-hidden="true">${MARK.laneDot.offsets.map((o) => `<circle cx="${n1(x)}" cy="${n1(top - o)}" r="${MARK.laneDot.r}"/>`).join("")}</g>`);
      boxes.push({ x0: x - 2, y0: top - MARK.laneDot.offsets[2] - 2, x1: x + 2, y1: top });
    }
    // capacity circles, the other side of the line
    if (s.capacity?.count) {
      const n = s.capacity.count;
      for (let k = 0; k < n; k++) {
        const cx = x + MARK.capPitch * (k - (n - 1) / 2);
        marks.push(circle("cp", cx, y0 + WIDE.capY, MARK.capR));
        own.push([cx - MARK.capR, y0 + WIDE.capY - MARK.capR], [cx + MARK.capR, y0 + WIDE.capY + MARK.capR]);
      }
    }
    // name and capacity text
    const ny = y0 + WIDE.nameY;
    marks.push(text("t-name", x, ny, names[i], WIDE.nameLine, "middle"));
    names[i].forEach((l, k) => ownText.push(textBox(x, ny + k * WIDE.nameLine, textWidth(l, T.name, false), T.name, "middle")));
    if (caps[i].length) {
      const cy = ny + (names[i].length - 1) * WIDE.nameLine + WIDE.capTextGap;
      marks.push(text("t-cap", x, cy, caps[i], WIDE.capLine, "middle"));
      caps[i].forEach((l, k) => ownText.push(textBox(x, cy + k * WIDE.capLine, textWidth(l, T.cap, true), T.cap, "middle")));
    }
    boxes.push(boxOf(own), ...ownText);

    if (s.constraint) {
      const encl = withNearbyText(own, ownText);
      const l = loop(encl, `${fig.id}:${f}:loop:wide`, WIDE.width);
      const last = i === flow.stations.length - 1 && !stop;
      // the arrowhead is the flow leaving the system: a loop at the end never holds it, and its word goes on top
      const sg = last ? signalTop(l, WIDE.leaderTop, T.sig, WIDE.width) : signal(l, WIDE.leader, T.sig, WIDE.width, WIDE.leaderTop);
      if (last) loopRight = l.box.x1 + 1;
      sig.push(sg.markup);
      boxes.push(sg.box);
    }
  });

  const { back, half, overshoot } = MARK.arrow;
  const tip = stop ? lastX : Math.max(WIDE.lineEnd + overshoot, loopRight + WIDE.arrowClear + back);
  if (tip > WIDE.width - 2) return wideFlow(fig, f, flow, lineY, gutter, labelAbove, shrink + tip - (WIDE.width - 2));
  const end = stop ? lastX : tip - overshoot;
  lines.unshift(`<path class="ln" d="M${lineStart} ${n1(y0)} H${n1(end)}"/>`);
  if (stop) lines.push(`<path class="ln" d="M${n1(end)} ${n1(y0 - MARK.stopTick)} V${n1(y0 + MARK.stopTick)}"/>`);
  else lines.push(`<path class="ln" d="M${n1(tip - back)} ${n1(y0 - half)} L${n1(tip)} ${n1(y0)} L${n1(tip - back)} ${n1(y0 + half)}"/>`);

  let top = Math.min(...boxes.map((b) => b.y0));
  const bottom = Math.max(...boxes.map((b) => b.y1));
  if (flow.label && labelAbove) {
    const ty = top - 10;
    marks.unshift(text("t-row", lineStart, ty, [flow.label], 0, "start"));
    top = ty - T.row * TYPE.ascent;
  }
  return { lines: [...lines, ...marks], sig, top: top - y0, bottom: bottom - y0 };
}

/** The loop encloses the marks, plus any label that sits on or right next to them. */
function withNearbyText(own: Pt[], texts: Box[]): Pt[] {
  const b = boxOf(own);
  const m = 14;
  const near = texts.filter((t) => t.x1 > b.x0 - m && t.x0 < b.x1 + m && t.y1 > b.y0 - m && t.y0 < b.y1 + m);
  // a pen loop hugs words, not their bounding boxes: use the ends of the line and its top and bottom centre
  const cross = (t: Box): Pt[] => {
    const my = (t.y0 + t.y1) / 2, mx = (t.x0 + t.x1) / 2;
    return [[t.x0, my], [t.x1, my], [mx, t.y0 + 2], [mx, t.y1 - 2]];
  };
  return [...own, ...near.flatMap(cross)];
}

function renderWide(fig: Figure, titleId: string, descId: string, title: string): string {
  const labels = fig.flows.map((fl) => fl.label).filter((l): l is string => !!l);
  const labelW = Math.max(0, ...labels.map((l) => textWidth(l, TYPE.wide.row, true)));
  const left = labels.length > 0 && labelW <= WIDE.gutterMax;
  const gutter = left ? Math.round(labelW + WIDE.gutterGap) : 0;
  const above = labels.length > 0 && !left;
  // first pass for the extents, second pass at the real line positions
  const probe = fig.flows.map((fl, f) => wideFlow(fig, f, fl, 0, gutter, above));
  const ys: number[] = [];
  let cursor = WIDE.edge;
  probe.forEach((b, f) => {
    const y = cursor - b.top;
    ys.push(y);
    cursor = y + b.bottom + (f < probe.length - 1 ? WIDE.rowGap : WIDE.edge);
  });
  const bands = fig.flows.map((fl, f) => wideFlow(fig, f, fl, ys[f], gutter, above));
  const height = Math.ceil(cursor);
  return [
    `<svg class="fig-wide" viewBox="0 0 ${WIDE.width} ${height}" role="img" aria-labelledby="${titleId}" aria-describedby="${descId}" focusable="false">`,
    `<title id="${titleId}">${esc(title)}</title>`,
    ...bands.flatMap((b) => b.lines),
    ...bands.flatMap((b) => b.sig),
    `</svg>`,
  ].join("\n");
}

// ---------- narrow (vertical) ----------

function renderNarrow(fig: Figure, titleId: string, descId: string, title: string): string {
  const T = TYPE.narrow;
  const N = NARROW;
  const out: string[] = [];
  const sigs: string[] = [];
  let cursor = N.edge;

  fig.flows.forEach((flow, f) => {
    let lineStart = cursor;
    if (flow.label) {
      const ty = cursor + T.row * TYPE.ascent;
      out.push(text("t-row", 0, ty, [flow.label], 0, "start"));
      lineStart = ty + N.labelToLine;
    }
    const lines: string[] = [];
    const marks: string[] = [];
    let y = lineStart + N.firstStation;
    let prevBottom = lineStart;
    let nextMin = y;

    const flowLines = lines, flowMarks = marks;
    const stationYs: number[] = [];
    const fans: { i: number; y: number; laneXs: number[] }[] = [];
    flow.stations.forEach((s, i) => {
     // a loop that would reach back into the previous block pushes its station down; one retry is enough
     let shift = 0;
     for (let pass = 0; pass < 2; pass++) {
      const lines: string[] = [];
      const marks: string[] = [];
      const own: Pt[] = [];
      const ownText: Box[] = [];
      const wip = s.queue?.state === "in-progress";
      if (s.lanes) y = Math.max(nextMin, prevBottom + N.firstStation + N.fan.leave) + shift;
      else y = Math.max(nextMin, y) + shift;
      const laneXs = s.lanes ? Array.from({ length: s.lanes.count }, (_, j) => N.lineX + j * N.lanePitch) : [N.lineX];
      const outer = laneXs[laneXs.length - 1];
      let textX: number = N.textX;
      let blockBottom = y + MARK.stationR;

      if (s.lanes) {
        // the fan is drawn once the next station's y is known: lanes rejoin at it
        const d = y + N.fan.leave;
        const dots = s.lanes.more ? N.laneDots[2] + MARK.laneDot.r : N.laneSquare[0] + MARK.square;
        textX = outer + dots + N.laneNameGap;
        blockBottom = d;
      }

      // name and count
      const count = showCount(s) ? countText(s) : null;
      const countW = count ? textWidth(count, T.count, true) + 12 : 0;
      const nameMax = N.width - textX - countW;
      const name = s.name.includes("\n") ? nameLines(s.name) : textWidth(s.name, T.name, false) > nameMax ? wrap(s.name, T.name, false) : [s.name];
      const ny = s.lanes ? y + N.nameDy - ((name.length - 1) * N.nameLine) / 2 : y + N.nameDy;
      marks.push(circle("st", N.lineX, y, MARK.stationR));
      own.push([N.lineX - 5, y - 5], [N.lineX + 5, y + 5]);
      marks.push(text("t-name", textX, ny, name, N.nameLine, "start"));
      name.forEach((l, k) => ownText.push(textBox(textX, ny + k * N.nameLine, textWidth(l, T.name, false), T.name, "start")));
      let lastBaseline = ny + (name.length - 1) * N.nameLine;
      if (count) marks.push(text("t-count", N.countRight, ny, [count], 0, "end"));
      // capacity text
      if (s.capacity?.label) {
        const capMax = N.width - textX;
        const cap = textWidth(s.capacity.label, T.cap, true) > capMax ? wrap(s.capacity.label, T.cap, true) : [s.capacity.label];
        const cy = lastBaseline + (N.capDy2 - N.nameDy);
        marks.push(text("t-cap", textX, cy, cap, N.capLine, "start"));
        cap.forEach((l, k) => ownText.push(textBox(textX, cy + k * N.capLine, textWidth(l, T.cap, true), T.cap, "start")));
        lastBaseline = cy + (cap.length - 1) * N.capLine;
      }
      blockBottom = Math.max(blockBottom, lastBaseline + T.cap * TYPE.descent);

      // queue
      if (s.queue && s.queue.count > 0) {
        const q: string[] = [];
        if (s.lanes) {
          const c = s.queue.count;
          laneXs.forEach((lx, j) => {
            for (let k = 0; k < c; k++) {
              // up and right of the lane station, as D drew them: cargo on the lane
              const sx = lx + N.laneSquare[0];
              const sy = y + N.laneSquare[1] - k * MARK.squarePitch;
              q.push(square(sx, sy, `${fig.id}:${f}:${i}:${j}:${k}`, wip));
              own.push(...boxPts({ x0: sx, y0: sy, x1: sx + MARK.square, y1: sy + MARK.square }));
            }
          });
        } else {
          const top = lastBaseline + N.squaresGap;
          const perRow = MARK.group * 2;
          for (let k = 0; k < s.queue.count; k++) {
            const col = k % perRow;
            const sx = N.textX + col * MARK.squarePitch + (col >= MARK.group ? N.groupGap : 0);
            const sy = top + Math.floor(k / perRow) * MARK.squarePitch;
            q.push(square(sx, sy, `${fig.id}:${f}:${i}:${k}`, wip));
            own.push(...boxPts({ x0: sx, y0: sy, x1: sx + MARK.square, y1: sy + MARK.square }));
            blockBottom = Math.max(blockBottom, sy + MARK.square);
          }
        }
        marks.push(`<g class="q">\n${q.join("\n")}\n</g>`);
      }
      for (const lx of laneXs.slice(1)) { marks.push(circle("st", lx, y, MARK.stationR)); own.push([lx - 5, y - 5], [lx + 5, y + 5]); }
      if (s.lanes?.more) {
        marks.push(`<g class="lane-more" aria-hidden="true">${N.laneDots.map((o) => `<circle cx="${n1(outer + o)}" cy="${n1(y)}" r="${MARK.laneDot.r}"/>`).join("")}</g>`);
      }
      // capacity circles, left of the line (the rotated "below")
      if (s.capacity?.count) {
        for (let k = 0; k < s.capacity.count; k++) {
          const cy = y + N.capDy + k * MARK.capPitch;
          marks.push(circle("cp", N.capX, cy, MARK.capR));
          own.push([N.capX - MARK.capR, cy - MARK.capR], [N.capX + MARK.capR, cy + MARK.capR]);
          blockBottom = Math.max(blockBottom, cy + MARK.capR);
        }
      }

      let next = blockBottom + (s.lanes ? N.fanClear : N.stationGap);
      if (s.constraint) {
        const l = loop(withNearbyText(own, ownText), `${fig.id}:${f}:loop:narrow`, N.width);
        const clear = prevBottom + N.loopClear / 2;
        if (pass === 0 && i > 0 && l.box.y0 < clear) { shift = clear - l.box.y0; y -= shift; continue; }
        const sg = signal(l, N.leader, T.sig, N.width);
        sigs.push(sg.markup);
        next = Math.max(next, sg.box.y1 + N.loopClear + T.name * TYPE.ascent - N.nameDy);
        blockBottom = Math.max(blockBottom, sg.box.y1);
      }
      flowLines.push(...lines);
      flowMarks.push(...marks);
      stationYs[i] = y;
      if (s.lanes) fans.push({ i, y, laneXs });
      prevBottom = blockBottom;
      nextMin = next;
      y = nextMin;
      break;
     }
    });

    for (const fan of fans) {
      const { leave, flat } = NARROW.fan;
      const a = fan.y - leave, b = fan.y - flat;
      const d = stationYs[fan.i + 1] ?? fan.y + leave; // rejoin at the next station
      const c = d - (leave - flat);
      for (const lx of fan.laneXs.slice(1)) {
        flowLines.push(`<path class="ln" d="M${N.lineX} ${n1(a)} C${N.lineX} ${n1(a + 16)} ${n1(lx)} ${n1(b - 18)} ${n1(lx)} ${n1(b)} V${n1(c)} C${n1(lx)} ${n1(c + 20)} ${N.lineX} ${n1(d - 16)} ${N.lineX} ${n1(d)}"/>`);
      }
    }
    let end: number;
    if (typeof flow.end === "object") {
      const sy = prevBottom + N.stationGap;
      lines.push(`<path class="ln" d="M${N.lineX} ${n1(lineStart)} V${n1(sy)}"/>`);
      lines.push(`<path class="ln" d="M${N.lineX - MARK.stopTick} ${n1(sy)} H${N.lineX + MARK.stopTick}"/>`);
      marks.push(text("t-note", N.textX, sy + 5, [flow.end.stop], 0, "start"));
      end = sy + 5 + T.note * TYPE.descent;
    } else {
      const le = prevBottom + N.lineTail;
      const { back, half, overshoot } = MARK.arrow;
      const tip = le + overshoot;
      lines.push(`<path class="ln" d="M${N.lineX} ${n1(lineStart)} V${n1(le)}"/>`);
      lines.push(`<path class="ln" d="M${N.lineX - half} ${n1(tip - back)} L${N.lineX} ${n1(tip)} L${N.lineX + half} ${n1(tip - back)}"/>`);
      end = tip;
    }
    out.push(...lines, ...marks);
    cursor = end + (f < fig.flows.length - 1 ? N.rowGap : N.edge);
  });

  return [
    `<svg class="fig-narrow" viewBox="0 0 ${N.width} ${Math.ceil(cursor)}" role="img" aria-labelledby="${titleId}" aria-describedby="${descId}" focusable="false">`,
    `<title id="${titleId}">${esc(title)}</title>`,
    ...out,
    ...sigs,
    `</svg>`,
  ].join("\n");
}

// ---------- words: title, text equivalent, table, sentence ----------

const constraintOf = (flow: Flow) => flow.stations.find((s) => s.constraint);

/** The SVG <title>: what the drawing is and where it waits. */
function svgTitle(fig: Figure): string {
  const rows = fig.flows.map((flow) => {
    const st = flow.stations;
    const c = constraintOf(flow);
    const tail = c ? `the constraint is ${plain(c.name)}` : typeof flow.end === "object" ? `it ends in ${flow.end.stop}` : "no constraint is marked";
    const s = `${word(st.length)} stations from ${plain(st[0].name)} to ${plain(st[st.length - 1].name)}; ${tail}`;
    return flow.label ? `${flow.label}: ${s}.` : `${s.charAt(0).toUpperCase()}${s.slice(1)}.`;
  });
  return `Figure ${fig.number}: ${lcFirst(fig.title)}. ${rows.join(" ")}`;
}

function queuePhrase(s: Station): string | null {
  if (!s.queue) return null;
  const n = s.queue.count;
  const base = n === 0 ? "none waiting" : s.queue.state === "in-progress" ? `${n} in progress` : `${n} waiting`;
  if (!s.lanes) return base;
  return `${base} in each of ${s.lanes.more ? "several" : word(s.lanes.count)} parallel lanes`;
}

/** "for 1 product owner", "unlimited capacity", "capacity every 2 weeks", "a capacity of 1". */
function capPhrase(s: Station, joinWith: "for" | "with"): string | null {
  const c = s.capacity;
  if (!c) return null;
  if (c.label && c.count !== undefined) return `${joinWith} ${c.label}`;
  if (c.label) return c.label.includes(" ") ? `capacity ${c.label}` : `${c.label} capacity`;
  return `a capacity of ${c.count}`;
}

/** One sentence per station that has a queue or a capacity. */
function stationFact(s: Station): string | null {
  const q = queuePhrase(s);
  const cap = capPhrase(s, "for");
  const name = plain(s.name);
  if (q && cap) return cap.startsWith("for ") ? `${name} has ${q} ${cap}.` : `${name} has ${q}, ${cap}.`;
  if (q) return `${name} has ${q}.`;
  if (cap) return `${name} has ${cap.replace(/^for /, "")}.`;
  return null;
}

const constraintSentence = (c: Station) => `The constraint is ${plain(c.name)}${c.capacity?.label ? `, ${c.capacity.label}` : ""}.`;

function describeFlow(flow: Flow): string {
  const names = flow.stations.map((s) => plain(s.name));
  const route = names.length === 1 ? `Work sits at ${names[0]}.` : `Work flows from ${names[0]}${names.length > 2 ? ` through ${listAnd(names.slice(1, -1))}` : ""} to ${names[names.length - 1]}.`;
  const parts = [route, ...flow.stations.map(stationFact).filter((x): x is string => !!x)];
  if (typeof flow.end === "object") parts.push(`The line ends in ${flow.end.stop}.`);
  const c = constraintOf(flow);
  parts.push(c ? constraintSentence(c) : `No station is the constraint: ${lcFirst(flow.noConstraint ?? "")}`);
  return (flow.label ? `${flow.label}: ` : "") + parts.join(" ");
}

const sameStations = (a: Flow, b: Flow) => a.stations.length === b.stations.length && a.stations.every((s, i) => plain(s.name) === plain(b.stations[i].name));
const sameQueue = (a: Station, b: Station) => (a.queue?.count ?? -1) === (b.queue?.count ?? -1) && (a.queue?.state ?? "waiting") === (b.queue?.state ?? "waiting");
const sameCap = (a: Station, b: Station) => a.capacity?.count === b.capacity?.count && a.capacity?.label === b.capacity?.label;

/** A later flow with the same stations as the first, told as what changed. */
function describeDiff(first: Flow, flow: Flow): string {
  const changed = flow.stations.filter((s, i) => !sameQueue(s, first.stations[i]) || !sameCap(s, first.stations[i]));
  const facts = changed.map((s, k) => {
    const before = first.stations[flow.stations.indexOf(s)];
    const q = queuePhrase(s) ?? "no queue";
    const cap = sameCap(s, before) ? null : capPhrase(s, "with") ?? "no stated capacity";
    return `${plain(s.name)} has ${q}${cap ? (cap.startsWith("with ") ? ` ${cap}` : `, ${cap}`) : ""}`;
  });
  const c0 = constraintOf(first), c = constraintOf(flow);
  const cap = (x: Station) => (x.capacity?.label ? `, ${x.capacity.label}` : "");
  const tail = !c ? `no station is the constraint: ${lcFirst(flow.noConstraint ?? "")}`
    : c0 && plain(c0.name) === plain(c.name) ? `the constraint stays at ${plain(c.name)}${cap(c)}.`
    : `the constraint moves to ${plain(c.name)}${cap(c)}.`;
  const body = facts.length ? `${listAnd(facts)}; ${tail}` : `nothing changes; ${tail}`;
  return `${flow.label ? `${flow.label}: ` : ""}${body.charAt(0).toUpperCase()}${body.slice(1)}`;
}

/**
 * The generated text equivalent. The first flow names every station in order with every count and capacity
 * and ends with its constraint sentence; a later flow with the same stations is told as a diff against it.
 */
export function generateText(fig: Figure): string {
  const [first, ...rest] = fig.flows;
  return [describeFlow(first), ...rest.map((fl) => (sameStations(first, fl) ? describeDiff(first, fl) : describeFlow(fl)))].join(" ");
}

function renderTable(fig: Figure): string {
  const cell = (s: string | null) => (s === null ? "–" : esc(s));
  const row = (s: Station) => {
    const cls = s.constraint ? ' class="constraint-row"' : "";
    const tag = s.constraint ? ' <span class="tag">constraint</span>' : "";
    const cap = s.capacity ? s.capacity.label ?? String(s.capacity.count) : null;
    return `<tr${cls}><th scope="row">${esc(plain(s.name))}${tag}</th><td class="num">${cell(queuePhrase(s)?.replace(/ waiting$/, "").replace(/^none$/, "0") ?? null)}</td><td>${cell(cap)}</td></tr>`;
  };
  const caption = `${esc(fig.title)}.${fig.note ? ` ${esc(fig.note)}` : ""}`;
  const groups = fig.flows.map((flow) => {
    const head = flow.label ? `<tr class="flow-head"><th scope="rowgroup" colspan="3">${esc(flow.label)}</th></tr>` : "";
    const notes: string[] = [];
    if (typeof flow.end === "object") notes.push(`Ends in ${esc(flow.end.stop)}.`);
    if (!constraintOf(flow)) notes.push(`No constraint marked: ${esc(lcFirst(flow.noConstraint ?? ""))}`);
    const foot = notes.length ? `<tr class="flow-foot"><td colspan="3">${notes.join(" ")}</td></tr>` : "";
    return `<tbody>${head}${flow.stations.map(row).join("")}${foot}</tbody>`;
  });
  return [
    `<table class="schedule">`,
    `<caption>${caption}</caption>`,
    `<thead><tr><th scope="col">Station</th><th scope="col" class="num">Waiting</th><th scope="col">Capacity</th></tr></thead>`,
    ...groups,
    `</table>`,
  ].join("\n");
}

function renderSentence(fig: Figure): string {
  const s = fig.sentence;
  if (!s) return "";
  const model = MODELS[s.model];
  if (!model) throw new Error(`${fig.id}: unknown sentence model "${s.model}"; add it to MODELS in render.ts`);
  const inputs = Object.fromEntries(Object.entries(s.inputs).map(([k, v]) => [k, v.value]));
  const outputs = model.compute(inputs);
  const paras = model.lines(inputs, outputs).map((segs) => {
    const live = segs.some((g) => g.output !== undefined) ? ' aria-live="polite"' : "";
    const html = segs.map((g) => {
      if (g.input !== undefined) {
        const d = s.inputs[g.input];
        return `<var class="v in" data-input="${g.input}" data-label="${esc(d.label)}" data-min="${d.min}" data-max="${d.max}">${d.value}</var>`;
      }
      if (g.output !== undefined) return `<span class="v out" data-output="${g.output}">${outputs[g.output]}</span>`;
      return esc(g.text ?? "");
    }).join("");
    return `<p${live}>${html}</p>`;
  });
  // the first paragraph only changes when its own inputs do, and both results matter; see NOTES.md
  return [
    `<div class="live" data-model="${esc(s.model)}" data-figure="${esc(fig.id)}">`,
    ...paras,
    model.note ? `<p class="live-model">${esc(model.note)}</p>` : "",
    `</div>`,
  ].filter(Boolean).join("\n");
}

// ---------- the whole thing ----------

export function render(fig: Figure): Rendered {
  const errors = validate(fig);
  if (errors.length) throw new Error(`${fig.id}: ${errors.join("; ")}`);
  COUNTS = countsOn(fig);
  const descId = `${fig.id}-text`;
  const title = svgTitle(fig);
  const wide = renderWide(fig, `${fig.id}-wide-title`, descId, title);
  const narrow = renderNarrow(fig, `${fig.id}-narrow-title`, descId, title);
  const text = `<p id="${descId}" class="equivalent">${sigWords(esc(fig.text ?? generateText(fig)))}</p>`;
  const table = renderTable(fig);
  const sentence = renderSentence(fig);
  const figure = [
    sentence,
    `<figure class="fig ${fig.id}" aria-labelledby="${fig.id}-caption">`,
    `<div class="fig-area">`,
    wide,
    narrow,
    `</div>`,
    `<figcaption id="${fig.id}-caption" class="fig-caption">`,
    `<span class="fig-no">Fig. ${fig.number} <span class="fig-name">${esc(fig.title)}</span></span>`,
    fig.pull
      ? `<blockquote class="pull"><p>${sigWords(esc(fig.caption))}</p></blockquote>`
      : `<span class="fig-text">${sigWords(esc(fig.caption))}</span>`,
    fig.note ? `<span class="fig-note">${esc(fig.note)}</span>` : "",
    `</figcaption>`,
    `</figure>`,
    `<div class="fig-detail">`,
    text,
    table,
    `</div>`,
  ].filter(Boolean).join("\n");
  return { wide, narrow, table, text, sentence, figure };
}
