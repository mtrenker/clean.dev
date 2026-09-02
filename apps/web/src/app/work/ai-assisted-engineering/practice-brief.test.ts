import { describe, expect, it } from 'vitest';
import {
  APPROVED_DISCLAIMERS,
  buildPrintBrief,
  PRINT_SELECTION,
  PRINT_SENTENCE_BUDGET,
  practiceBrief,
  type LabelledItem,
} from './practice-brief';

const serialised = JSON.stringify(practiceBrief);

/**
 * Everything print renders as a standalone line. The print composition shows
 * `sentences[0]` only, so that sentence has to carry the item on its own and
 * fit the one-page budget.
 */
const printedItems: LabelledItem[] = [
  ...practiceBrief.client.claims,
  ...practiceBrief.practice.items,
  ...practiceBrief.lessons.items,
  ...practiceBrief.principle.items,
  ...practiceBrief.limits.items,
];

describe('practice brief content', () => {
  it('grades every client claim and uses all four maturity levels', () => {
    const allowed = practiceBrief.client.maturities.map((maturity) => maturity.id);

    expect(practiceBrief.client.claims).toHaveLength(9);
    for (const claim of practiceBrief.client.claims) {
      expect(allowed).toContain(claim.maturity);
    }
    for (const maturity of allowed) {
      expect(practiceBrief.client.claims.some((claim) => claim.maturity === maturity)).toBe(true);
    }
  });

  it('defines four maturity levels with distinct labels and tones', () => {
    const { maturities } = practiceBrief.client;

    expect(maturities).toHaveLength(4);
    expect(new Set(maturities.map((maturity) => maturity.label)).size).toBe(4);
    expect(new Set(maturities.map((maturity) => maturity.tone)).size).toBe(4);
    for (const maturity of maturities) {
      expect(maturity.definition.length).toBeGreaterThan(0);
    }
  });

  it('keeps every printed first sentence inside the one-page budget', () => {
    const tooLong = printedItems
      .filter((item) => item.sentences[0].length > PRINT_SENTENCE_BUDGET)
      .map((item) => `${item.id}: ${item.sentences[0].length} chars`);

    expect(tooLong).toEqual([]);
  });

  it('describes the workflow as five stages with one deterministic gate', () => {
    const { stages, loopNote } = practiceBrief.workflow;

    expect(stages.map((stage) => stage.number)).toEqual(['01', '02', '03', '04', '05']);
    for (const stage of stages) {
      expect(stage.label.length).toBeGreaterThan(0);
      expect(stage.caption.length).toBeGreaterThan(0);
    }
    expect(stages.filter((stage) => stage.gate)).toHaveLength(1);
    expect(stages.find((stage) => stage.gate)?.number).toBe('03');
    // The rework loop is a written statement, not only a drawn line.
    expect(loopNote).toContain('stage 02');
  });

  it('names the six tools in order, each with a role', () => {
    expect(practiceBrief.tools.entries.map((entry) => entry.name)).toEqual([
      'GitHub Copilot',
      'OpenCode',
      'Pi',
      'Claude Code',
      'Codex',
      'Local models',
    ]);
    for (const entry of practiceBrief.tools.entries) {
      expect(entry.sentences[0].length).toBeGreaterThan(0);
      expect(entry.context.length).toBeGreaterThan(0);
    }
  });

  it('makes no unsupported quantitative claim, while keeping the approved denial expressible', () => {
    for (const disclaimer of APPROVED_DISCLAIMERS) {
      expect(serialised).toContain(disclaimer);
    }

    // Strip the sentences that are allowed to name a quantitative concept in
    // order to deny it, then hold the remainder to the no-numbers rule.
    const asserted = APPROVED_DISCLAIMERS.reduce(
      (text, disclaimer) => text.split(disclaimer).join(' '),
      serialised,
    );

    expect(asserted).not.toMatch(/\d+\s*%/);
    expect(asserted).not.toMatch(/\b\d+\s*x\b/i);
    expect(asserted).not.toMatch(/\b(productivity|efficiency|velocity|throughput|faster|quicker|time saved)\b/i);
  });

  it('uses only the scale figures already published in the project record', () => {
    expect(practiceBrief.client.intro).toContain('more than 1,200 stores');
    expect(practiceBrief.client.intro).toContain('14 European countries');
    expect(serialised).not.toMatch(/1,800|26 (European )?countries/);
  });

  it('claims no privacy for an unlisted route', () => {
    expect(practiceBrief.colophon).toContain('That is not privacy.');
    expect(practiceBrief.colophon).not.toMatch(/\b(private|confidential|hidden|protected)\b/i);
  });
});

/** Every string the print projection renders, flattened. */
const printStrings = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(printStrings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(printStrings);
  return [];
};

describe('print projection', () => {
  const print = buildPrintBrief();

  it('curates the selection the A4 sheet has room for', () => {
    expect(print.client.claims).toHaveLength(5);
    expect(print.practice.items).toHaveLength(4);
    expect(print.lessons.items).toHaveLength(3);
    expect(print.tools.entries).toHaveLength(6);
    expect(print.limits.labels).toHaveLength(4);
    expect(print.workflow.stages).toHaveLength(5);
    expect(print.principle.items).toHaveLength(3);
  });

  it('keeps all four maturity levels visible on the sheet', () => {
    const printed = new Set(print.client.claims.map((claim) => claim.maturityLabel));

    expect(printed.size).toBe(4);
    for (const maturity of practiceBrief.client.maturities) {
      expect(printed).toContain(maturity.label);
    }
  });

  it('keeps Douglas as the lead: more printed client claims than practice items', () => {
    expect(print.client.claims.length).toBeGreaterThan(print.practice.items.length);
  });

  it('selects only items that exist, and every tool carries a purpose', () => {
    for (const [key, ids] of Object.entries(PRINT_SELECTION)) {
      const source = {
        claims: practiceBrief.client.claims,
        practice: practiceBrief.practice.items,
        lessons: practiceBrief.lessons.items,
      }[key as keyof typeof PRINT_SELECTION];

      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) expect(source.map((item) => item.id)).toContain(id);
    }
    for (const entry of print.tools.entries) expect(entry.purpose.length).toBeGreaterThan(0);
  });

  it('cannot drift from the screen: every printed string comes verbatim from the source', () => {
    const source = JSON.stringify(practiceBrief);
    const invented = printStrings(print).filter((value) => !source.includes(JSON.stringify(value).slice(1, -1)));

    expect(invented).toEqual([]);
  });
});
