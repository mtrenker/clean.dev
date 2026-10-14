// The publishing check. Zero dependencies; Node runs this file directly.
//
//   node check.ts figures/*.ts samples/*.md
//
// Figure modules (*.ts, *.js): every exported object with a `flows` array is validated against the
// rules in BRIEF.md "The data format". Essays (*.md): need a ```figure block holding the figure's
// JSON, or front matter `figure: none` with `figure_reason: <words>`.
// Prints one line per figure or essay, "ok" or the violations. Exit code 1 on any failure.

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import type { Figure } from "./types.ts";

const here = dirname(fileURLToPath(import.meta.url));
const nonEmpty = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";
const count = (v: unknown) => Number.isInteger(v) && (v as number) >= 0;

/** Returns the violations of one figure; an empty list means ok. */
export async function validate(fig: any): Promise<string[]> {
  const errors: string[] = [];
  if (!fig || typeof fig !== "object") return ["figure is not an object"];
  if (!nonEmpty(fig.id)) errors.push("id is missing");
  if (!Number.isInteger(fig.number) || fig.number < 1) errors.push("number must be a positive integer");
  if (!nonEmpty(fig.title)) errors.push("title is missing");
  if (!nonEmpty(fig.caption)) errors.push("caption is missing; the argument is authored, never generated");
  if (!Array.isArray(fig.flows) || fig.flows.length === 0) return [...errors, "flows must list at least one flow"];

  fig.flows.forEach((flow: any, f: number) => {
    const where = fig.flows.length > 1 ? `flow ${f + 1}${flow.label ? ` (${flow.label})` : ""}` : "flow";
    if (!Array.isArray(flow.stations) || flow.stations.length === 0) {
      errors.push(`${where} has no stations`);
      return;
    }
    if (!(flow.end === "arrow" || (flow.end && nonEmpty(flow.end.stop))))
      errors.push(`${where}: end must be "arrow" or { stop: "<words>" }`);
    flow.stations.forEach((s: any, i: number) => {
      const at = `${where}, station ${i + 1}${nonEmpty(s?.name) ? ` "${s.name}"` : ""}`;
      if (!nonEmpty(s?.name)) errors.push(`${at}: name is missing`);
      if (s.queue !== undefined) {
        if (!count(s.queue.count)) errors.push(`${at}: queue.count must be a whole number, 0 or more`);
        if (s.queue.state !== undefined && !["waiting", "in-progress"].includes(s.queue.state))
          errors.push(`${at}: queue.state must be "waiting" or "in-progress"`);
      }
      if (s.capacity !== undefined) {
        // round 2: the label is optional when a count is given; one of the two is required
        if (!nonEmpty(s.capacity.label) && s.capacity.count === undefined) errors.push(`${at}: capacity needs a count or a label`);
        if (s.capacity.label !== undefined && !nonEmpty(s.capacity.label)) errors.push(`${at}: capacity.label is empty; omit it or say who`);
        if (s.capacity.count !== undefined && !count(s.capacity.count))
          errors.push(`${at}: capacity.count must be a whole number, 0 or more`);
      }
      if (s.constraint !== undefined && s.constraint !== true) errors.push(`${at}: constraint must be true or absent`);
      if (s.lanes !== undefined && !(Number.isInteger(s.lanes.count) && s.lanes.count >= 1))
        errors.push(`${at}: lanes.count must be 1 or more`);
    });
    const constraints = flow.stations.filter((s: any) => s.constraint === true);
    if (constraints.length > 1)
      errors.push(`${where} has ${constraints.length} constraints (${constraints.map((s: any) => s.name).join(", ")}); a flow has exactly one`);
    else if (constraints.length === 0 && !nonEmpty(flow.noConstraint))
      errors.push(`${where} has no constraint; mark one station or give the reason in noConstraint`);
    else if (constraints.length === 1 && flow.noConstraint !== undefined)
      errors.push(`${where} marks a constraint and also gives noConstraint; keep one`);
  });

  if (fig.text !== undefined) {
    if (!nonEmpty(fig.text)) errors.push("text is empty; remove it to use the generated text");
    else {
      const text = fig.text.toLowerCase();
      const names = [...new Set(fig.flows.flatMap((f: any) => (f.stations ?? []).map((s: any) => s?.name)).filter(nonEmpty).map((n: string) => n.replace(/\s*\n\s*/g, " ")))] as string[]; // a "\n" line break in a name is a space outside the drawing
      const missing = names.filter((n) => !text.includes(n.toLowerCase()));
      if (missing.length) errors.push(`text does not name ${missing.map((n) => `"${n}"`).join(", ")}`);
      const reasons = fig.flows.map((f: any) => f.noConstraint).filter(nonEmpty) as string[];
      const anyConstraint = fig.flows.some((f: any) => f.stations?.some((s: any) => s.constraint === true));
      const saysIt = text.includes("constraint") || (!anyConstraint && reasons.every((r) => text.includes(r.toLowerCase())));
      if (!saysIt) errors.push(`text does not say "constraint"${anyConstraint ? "" : " or give the noConstraint reason"}`);
    }
  }

  if (fig.sentence !== undefined) errors.push(...(await validateSentence(fig.sentence)));
  return errors;
}

async function validateSentence(sentence: any): Promise<string[]> {
  const errors: string[] = [];
  const inputs = sentence.inputs ?? {};
  for (const [name, i] of Object.entries<any>(inputs)) {
    if (![i.value, i.min, i.max].every(Number.isInteger)) errors.push(`sentence input "${name}": value, min and max must be whole numbers`);
    else if (i.min > i.max || i.value < i.min || i.value > i.max) errors.push(`sentence input "${name}": value ${i.value} is outside ${i.min}..${i.max}`);
    if (!nonEmpty(i.label)) errors.push(`sentence input "${name}": label is missing (it names the control)`);
  }
  const file = join(here, "models", `${sentence.model}.js`);
  if (!nonEmpty(sentence.model) || !existsSync(file)) return [...errors, `sentence model "${sentence.model}" not found in models/`];
  if (errors.length) return errors;
  const model = await import(pathToFileURL(file).href);
  const values = Object.fromEntries(Object.entries<any>(inputs).map(([k, v]) => [k, v.value]));
  const outputs = model.compute(values);
  const used = new Set<string>();
  for (const seg of model.lines(values, outputs).flat()) {
    if ("input" in seg) used.add(seg.input);
    if ("input" in seg && !(seg.input in inputs)) errors.push(`sentence uses input "${seg.input}", which the figure does not declare`);
    if ("output" in seg && !(seg.output in outputs)) errors.push(`sentence uses output "${seg.output}", which the model does not compute`);
  }
  for (const name of Object.keys(inputs)) if (!used.has(name)) errors.push(`sentence input "${name}" never appears in the sentence`);
  return errors;
}

async function checkModule(path: string): Promise<[string, string[]][]> {
  const mod = await import(pathToFileURL(resolve(path)).href);
  const figures = Object.entries<any>(mod).filter(([, v]) => v && typeof v === "object" && Array.isArray(v.flows));
  if (figures.length === 0) return [[path, ["exports no figure (an object with flows)"]]];
  return Promise.all(figures.map(async ([name, fig]): Promise<[string, string[]]> => [`${path} ${name}`, await validate(fig as Figure)]));
}

function frontMatter(source: string): Record<string, string> {
  const m = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) return {};
  return Object.fromEntries(m[1].split(/\r?\n/).map((l) => l.match(/^([\w-]+):\s*(.*)$/)).filter(Boolean).map((m) => [m![1], m![2].trim()]));
}

async function checkEssay(path: string): Promise<[string, string[]][]> {
  const source = await readFile(path, "utf8");
  const meta = frontMatter(source);
  const blocks = [...source.matchAll(/^```figure[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/gm)].map((m) => m[1]);
  if (blocks.length === 0) {
    if (meta.figure === "none" && nonEmpty(meta.figure_reason)) return [[path, []]];
    return [[path, ["no figure. Add a figure block or state a reason in front matter (figure: none, figure_reason: …)."]]];
  }
  if (meta.figure === "none") return [[path, ["has a figure block and also front matter figure: none; keep one"]]];
  return Promise.all(blocks.map(async (json, i): Promise<[string, string[]]> => {
    const label = blocks.length > 1 ? `${path} figure ${i + 1}` : path;
    let fig: unknown;
    try { fig = JSON.parse(json); } catch (e) { return [label, [`figure block is not valid JSON (${(e as Error).message})`]]; }
    return [label, await validate(fig)];
  }));
}

if (import.meta.main) await main();

async function main() {
  const paths = process.argv.slice(2);
  if (paths.length === 0) {
    console.error("usage: node check.ts <figures/*.ts | essays/*.md>…");
    process.exit(2);
  }
  let failed = false;
  for (const path of paths) {
    let results: [string, string[]][];
    try {
      results = path.endsWith(".md") ? await checkEssay(path) : await checkModule(path);
    } catch (e) {
      results = [[path, [`could not read: ${(e as Error).message}`]]];
    }
    for (const [label, errors] of results) {
      if (errors.length) failed = true;
      console.log(errors.length ? `${label}: ${errors.join("; ")}` : `${label}: ok`);
    }
  }
  process.exit(failed ? 1 : 0);
}
