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
  it('grades every client claim and uses every maturity level it declares', () => {
    const allowed = practiceBrief.client.maturities.map((maturity) => maturity.id);

    expect(practiceBrief.client.claims).toHaveLength(8);
    for (const claim of practiceBrief.client.claims) {
      expect(allowed).toContain(claim.maturity);
    }
    for (const maturity of allowed) {
      expect(practiceBrief.client.claims.some((claim) => claim.maturity === maturity)).toBe(true);
    }
  });

  it('declares only maturity levels the account actually supports', () => {
    const { maturities } = practiceBrief.client;

    // Martin's firsthand account is that this was team adoption throughout, so
    // the earlier "Martin-only demonstration" and "future idea" levels describe
    // nothing on the page and were removed rather than kept for symmetry.
    expect(maturities.map((maturity) => maturity.id)).toEqual(['adopted', 'tried', 'shipped']);
    expect(new Set(maturities.map((maturity) => maturity.label)).size).toBe(3);
    expect(new Set(maturities.map((maturity) => maturity.tone)).size).toBe(3);
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

  it('keeps every maturity level visible on the sheet', () => {
    const printed = new Set(print.client.claims.map((claim) => claim.maturityLabel));

    expect(printed.size).toBe(practiceBrief.client.maturities.length);
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

describe('the corrected Douglas account', () => {
  it('claims team adoption and says plainly that it was not company-wide', () => {
    const { intro, closing } = practiceBrief.client;

    expect(intro).toContain('I drove the adoption of AI-assisted engineering inside my team');
    expect(intro).toContain('not Douglas as a whole');
    expect(closing).toContain('inside my team rather than across Douglas');
  });

  it('separates the two production outcomes and keeps ownership with the team', () => {
    const byId = new Map(practiceBrief.client.claims.map((claim) => [claim.id, claim]));
    const gateway = byId.get('api-gateway');

    expect(byId.get('short-link-service')?.maturity).toBe('shipped');
    expect(gateway?.maturity).toBe('shipped');
    expect(gateway?.sentences[0]).toContain('Our team designed');
    expect(gateway?.sentences[1]).toContain('stayed with the team');
  });

  it('places Pi in the team progression rather than in Martin-only use', () => {
    const pi = practiceBrief.tools.entries.find((entry) => entry.name === 'Pi');

    expect(pi?.context).toContain('client team');
    expect(pi?.sentences[1]).toContain('The team settled on it');
  });

  it('names the current multi-harness setup without inventing a mandatory reviewer', () => {
    const item = practiceBrief.practice.items.find((candidate) => candidate.id === 'multi-harness');

    expect(item?.sentences[0]).toContain('Claude Code does most of the coding');
    expect(item?.sentences[1]).toContain('per change rather than a ritual');
  });

  it('makes no organisation-wide adoption claim, and says so in the limits block', () => {
    // The scope limit names "company-wide" in order to rule it out, so strip
    // the approved denials first and hold the remainder to the rule. "across
    // Douglas" likewise appears only inside negations.
    const asserted = APPROVED_DISCLAIMERS.reduce(
      (text, disclaimer) => text.split(disclaimer).join(' '),
      JSON.stringify(practiceBrief),
    );
    expect(asserted).not.toMatch(/\b(company-wide|organisation-wide|organization-wide|rolled out across|throughout Douglas|Douglas adopted)\b/i);

    const scope = practiceBrief.limits.items.find((item) => item.id === 'team-not-company');
    expect(scope?.label).toBe('One team, not a company-wide rollout.');
    expect(scope?.sentences[0]).toContain('Nothing here claims adoption across the wider organisation');
  });
});
