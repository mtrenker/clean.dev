/**
 * The single structured factual source for the AI-assisted engineering practice
 * brief, rendered by both the screen composition (`practice-brief-view.tsx`)
 * and the one-page A4 print composition (`practice-brief-print.tsx`).
 *
 * Neither composition may hard-code a fact. Print renders a deterministic
 * subset: for claims, practice items, and lessons it shows the label and
 * `sentences[0]` only, which is why every first sentence is authored to stand
 * alone within PRINT_SENTENCE_BUDGET characters.
 *
 * The copy is approved and client-safety reviewed. See
 * `apps/web/docs/ai-assisted-engineering-brief-spec.md` sections 5 and 6 before
 * changing any sentence: every claim about the client engagement is graded, and
 * an ungraded or upgraded claim is a claim change, not an edit.
 *
 * English only in this delivery (issue #116). Strings are plain, not locale
 * maps, so the module does not pretend to a translation it does not have.
 */

export type ClaimMaturity = 'adopted' | 'tried' | 'shipped';

/** Print budget for `sentences[0]`, in characters. Enforced by the module test. */
export const PRINT_SENTENCE_BUDGET = 120;

/**
 * The only strings allowed to name a quantitative or organisation-wide concept,
 * and they name it in order to deny it. The module tests remove these exact
 * strings before scanning, so the page can refuse to give a productivity number
 * and can rule out a company-wide rollout without the guards rejecting the
 * refusals themselves.
 *
 * Adding an entry here is a deliberate, reviewable act.
 */
export const APPROVED_DISCLAIMERS = [
  'I have no productivity number.',
  'The teams I worked with did not measure one, and a percentage without a baseline is decoration.',
  'One team, not a company-wide rollout.',
  'I drove adoption within our Douglas team. Nothing here claims adoption across the wider organisation.',
] as const;

export interface MaturityDefinition {
  id: ClaimMaturity;
  label: string;
  definition: string;
  tone: 'green' | 'amber' | 'rust' | 'muted';
}

export interface LabelledItem {
  id: string;
  label: string;
  /** Print renders the first entry only; screen renders all of them. */
  sentences: [string, ...string[]];
}

export interface Claim extends LabelledItem {
  maturity: ClaimMaturity;
}

export interface WorkflowStage {
  number: string;
  label: string;
  caption: string;
  /** The deterministic gate. Exactly one stage carries it. */
  gate?: true;
}

export interface ToolEntry {
  id: string;
  name: string;
  context: string;
  /** Print renders the first entry only; screen renders all of them. */
  sentences: [string, ...string[]];
}

export interface PracticeBrief {
  eyebrow: string;
  title: string;
  subtitle: string;
  lead: string;
  meta: string;
  print: { action: string; hint: string; docLabel: string; footer: string; subsetNote: string };
  principle: { heading: string; body: string; items: LabelledItem[] };
  workflow: { heading: string; intro: string; stages: WorkflowStage[]; loopNote: string };
  client: {
    heading: string;
    meta: string;
    intro: string;
    keyHeading: string;
    maturities: MaturityDefinition[];
    claims: Claim[];
    closing: string;
  };
  practice: { heading: string; meta: string; intro: string; items: LabelledItem[] };
  tools: { heading: string; intro: string; entries: ToolEntry[]; evidenceLink: { label: string; href: string } };
  lessons: { heading: string; items: LabelledItem[] };
  limits: { heading: string; items: LabelledItem[] };
  colophon: string;
  close: { body: string; links: Array<{ label: string; href: string; variant: 'primary' | 'secondary' }> };
}

/**
 * Print projection.
 *
 * A4 holds roughly 267mm of content; the full brief needs about 425mm at
 * readable sizes, so the printed sheet carries a curated selection rather than
 * everything. The selection is declared here as ids and projected by
 * `buildPrintBrief`, so the print composition can never introduce a sentence of
 * its own: every string it renders is lifted verbatim from `practiceBrief`.
 * `practice-brief.test.ts` asserts exactly that, which is what keeps screen and
 * print from drifting apart silently.
 *
 * Why these items, from `apps/web/docs/ai-assisted-engineering-brief-spec.md`
 * section 11: the five client claims are the five moves the adoption story
 * turns on, which is securing access, the weekly learning loop, the move to
 * terminal agents and the progression through them, and the two systems that
 * reached production. Together they cover all three maturity levels. The four
 * practice items are the ones the workflow rail cannot already state. The three
 * lessons are the ones that appear nowhere else on the sheet.
 */
export const PRINT_SELECTION = {
  claims: ['whole-team-access', 'weekly-workshop', 'terminal-agents', 'short-link-service', 'api-gateway'],
  practice: ['multi-harness', 'small-harness', 'guardrails', 'design-owner'],
  lessons: ['context', 'slicing', 'ownership'],
} as const;

export interface PrintItem {
  id: string;
  label: string;
  sentence: string;
}

export interface PrintClaim extends PrintItem {
  maturityLabel: string;
}

export interface PrintTool {
  id: string;
  name: string;
  context: string;
  purpose: string;
}

export interface PrintBrief {
  docLabel: string;
  title: string;
  subtitle: string;
  lead: string;
  principle: { heading: string; items: PrintItem[] };
  workflow: { heading: string; stages: WorkflowStage[]; loopNote: string };
  client: {
    heading: string;
    maturities: MaturityDefinition[];
    claims: PrintClaim[];
    closing: string;
  };
  practice: { heading: string; items: PrintItem[] };
  limits: { heading: string; labels: string[] };
  tools: { heading: string; entries: PrintTool[] };
  lessons: { heading: string; items: PrintItem[] };
  colophon: string;
  subsetNote: string;
  footer: string;
}

const select = <T extends { id: string }>(items: T[], ids: readonly string[]): T[] =>
  ids.map((id) => {
    const item = items.find((candidate) => candidate.id === id);
    if (!item) throw new Error(`Print selection references a missing item: ${id}`);
    return item;
  });

const toPrintItem = (item: LabelledItem): PrintItem => ({
  id: item.id,
  label: item.label,
  sentence: item.sentences[0],
});

export const buildPrintBrief = (brief: PracticeBrief = practiceBrief): PrintBrief => ({
  docLabel: brief.print.docLabel,
  title: brief.title,
  subtitle: brief.subtitle,
  lead: brief.lead,
  principle: {
    heading: brief.principle.heading,
    items: brief.principle.items.map(toPrintItem),
  },
  workflow: {
    heading: brief.workflow.heading,
    stages: brief.workflow.stages,
    loopNote: brief.workflow.loopNote,
  },
  client: {
    heading: brief.client.heading,
    maturities: brief.client.maturities,
    claims: select(brief.client.claims, PRINT_SELECTION.claims).map((claim) => ({
      ...toPrintItem(claim),
      maturityLabel:
        brief.client.maturities.find((maturity) => maturity.id === claim.maturity)?.label ?? claim.maturity,
    })),
    closing: brief.client.closing,
  },
  practice: {
    heading: brief.practice.heading,
    items: select(brief.practice.items, PRINT_SELECTION.practice).map(toPrintItem),
  },
  limits: {
    heading: brief.limits.heading,
    labels: brief.limits.items.map((item) => item.label),
  },
  tools: {
    heading: brief.tools.heading,
    entries: brief.tools.entries.map((entry) => ({
      id: entry.id,
      name: entry.name,
      context: entry.context,
      purpose: entry.sentences[0],
    })),
  },
  lessons: {
    heading: brief.lessons.heading,
    items: select(brief.lessons.items, PRINT_SELECTION.lessons).map(toPrintItem),
  },
  colophon: brief.colophon,
  subsetNote: brief.print.subsetNote,
  footer: brief.print.footer,
});

export const practiceBrief: PracticeBrief = {
  eyebrow: 'Practice brief',
  title: 'AI-assisted engineering in practice',
  subtitle: 'From driving team adoption at Douglas to my current multi-harness workflow',
  lead: 'I use coding agents on real delivery work: first driving adoption inside a client team at Douglas, now as the normal way I build, investigate, and review software. This is a short account of what that looks like in practice, what a team adopted, what stayed an experiment, and what I still will not claim.',
  meta: 'Martin Trenker · Technical Lead and Solutions Architect · September 2026',
  print: {
    action: 'Print or save as PDF',
    hint: 'One A4 page.',
    docLabel: 'Practice brief · September 2026',
    footer: 'Martin Trenker · clean.dev · info@clean.dev',
    subsetNote: 'This sheet carries a selection. The full brief, with every item, is at clean.dev/work/ai-assisted-engineering.',
  },

  principle: {
    heading: 'The principle I work by',
    body: 'An agent can produce a change. It cannot be accountable for one. So the work is arranged around the part that does not transfer: a task small enough to state, context narrow enough to check, checks that fail without a human opinion, and a person who reads the diff before it merges.',
    items: [
      {
        id: 'bounded',
        label: 'Bounded, not autonomous',
        sentences: ['An agent gets one stated task at a time, in its own checkout, with the scope written down before it starts.'],
      },
      {
        id: 'checkable',
        label: 'Checkable, not trusted',
        sentences: ['Types, lint, tests, and the build run before anyone reads the result. A failing gate ends the run.'],
      },
      {
        id: 'owned',
        label: 'Owned, not delegated',
        sentences: ['Whoever merges a change answers for it. Review capacity, not model output, is what limits how fast this goes.'],
      },
    ],
  },

  workflow: {
    heading: 'One change, end to end',
    intro: 'This is the loop, whether the work is mine or a team\'s. It is deliberately boring, and every stage exists because skipping it produced something nobody could stand behind.',
    stages: [
      {
        number: '01',
        label: 'Bounded task and context',
        caption: 'One issue with stated scope, constraints, and acceptance criteria, plus the part of the system it is allowed to touch.',
      },
      {
        number: '02',
        label: 'Agent work in isolation',
        caption: 'The agent works in its own checkout, so a bad run costs a discarded worktree instead of a working copy.',
      },
      {
        number: '03',
        label: 'Deterministic checks',
        caption: 'Types, lint, tests, and the build run first. A failing gate ends the run before a human spends attention on it.',
        gate: true,
      },
      {
        number: '04',
        label: 'Human review',
        caption: 'I read the diff. A change I cannot explain goes back to stage 02, and that loop is normal rather than a failure.',
      },
      {
        number: '05',
        label: 'Integration',
        caption: 'A pull request, a merge, and a named person who answers for the result.',
      },
    ],
    loopNote: 'Review sends unclear work back to stage 02. Agents do not merge, approve, or publish reviews.',
  },

  client: {
    heading: 'Client application: Douglas, 2024 to 2026',
    meta: 'React expert to Technical Lead to Solutions Architect · POS and CRM platform',
    intro: 'I joined Douglas to modernise the point-of-sale and CRM software used in more than 1,200 stores across 14 European countries, and stayed for two and a half years, ending as Solutions Architect. I drove the adoption of AI-assisted engineering inside my team: securing access, introducing terminal agents, setting up the weekly slot where we compared tools, and connecting all of it to what we shipped. That was my team, not Douglas as a whole, and this section is about what the team did rather than what the company did.',
    keyHeading: 'How far each item got',
    maturities: [
      { id: 'adopted', label: 'Adopted', definition: 'Settled into how the team worked.', tone: 'green' },
      { id: 'tried', label: 'Tried', definition: 'Tested deliberately in the weekly workshop. Not everything was kept.', tone: 'amber' },
      { id: 'shipped', label: 'Shipped', definition: 'Went to production with the team accountable for it.', tone: 'rust' },
    ],
    claims: [
      {
        id: 'whole-team-access',
        maturity: 'adopted',
        label: 'I secured Copilot access for the whole team.',
        sentences: [
          'When Douglas announced its Copilot pilot, I secured licences for everyone on my team, including the product owner.',
          'Tooling that only some people have is not adoption. It stays a pocket of practice and it leaves when that person leaves.',
        ],
      },
      {
        id: 'weekly-workshop',
        maturity: 'adopted',
        label: 'A weekly workshop is where adoption actually happened.',
        sentences: [
          'We kept two hours a week to compare tools, workflows, and whatever was new, together rather than alone.',
          'That standing slot is what turned scattered experiments into a shared way of working, and it is the first thing I would set up again.',
        ],
      },
      {
        id: 'terminal-agents',
        maturity: 'tried',
        label: 'Out of the editor and into the terminal.',
        sentences: [
          'I introduced terminal agents; we moved from Copilot in VS Code to OpenCode, then settled on Pi for that period.',
          'Moving out of the editor changes review from approving each edit to judging the intent, the run, and the result. Not everything we tried in those sessions survived them.',
        ],
      },
      {
        id: 'settled-on-pi',
        maturity: 'adopted',
        label: 'We settled on Pi for that period.',
        sentences: [
          'It was the most flexible of the three and the one that left us feeling we understood what we owned.',
          'A harness small enough to read is a harness a team can argue about, extend, and be responsible for.',
        ],
      },
      {
        id: 'shared-resources',
        maturity: 'adopted',
        label: 'Shared agent resources, versioned like code.',
        sentences: [
          'Instructions, skills, and extensions lived in one versioned repository that several projects and tools could consume.',
          'The alternative was copying them into every repository and watching them drift apart, which is how a team ends up with five different definitions of how it works.',
        ],
      },
      {
        id: 'controlled-access',
        maturity: 'adopted',
        label: 'Controlled access, not open access.',
        sentences: [
          'I built a Node.js and TypeScript CLI that gave agents governed access to Jira, Confluence, and Azure DevOps.',
          'It covered only the delivery systems we were allowed to use, with one documented interface instead of ad hoc integrations, credentials handled outside the model, and human review of everything it produced.',
          'Guardrails sat alongside it: sensitive files and destructive shell commands are refused before a tool call runs, so autonomy inside a task never means autonomy over the machine.',
        ],
      },
      {
        id: 'short-link-service',
        maturity: 'shipped',
        label: 'The short-link and QR service, in weeks.',
        sentences: [
          'We used agents to learn unfamiliar parts of the stack and take the service from request to production in weeks.',
          'It replaced a third-party service that no longer fitted the business need. It is in my project record as a delivery outcome, not as an AI result.',
        ],
      },
      {
        id: 'api-gateway',
        maturity: 'shipped',
        label: 'A team-designed, agent-written CRM API.',
        sentences: [
          'Our team designed the REST and GraphQL gateway; agents wrote its implementation end to end.',
          'It unified access to the microservices. Architecture, review, and production accountability stayed with the team.',
        ],
      },
    ],
    closing: 'All of this happened inside my team rather than across Douglas. It is also where I learned C# and .NET with agent help while delivering the API, which I mention as part of how the work happened rather than as a claim of accumulated depth.',
  },

  practice: {
    heading: 'How I work now',
    meta: 'Independent practice, 2026',
    intro: 'Since the engagement ended, this has become the normal way I work, on my own products and on client work. It is my setup rather than a client\'s, and it is where the practice went deeper than a team could reasonably be asked to go.',
    items: [
      {
        id: 'issue-worktree-pr',
        label: 'One issue, one worktree, one pull request.',
        sentences: [
          'Work is admitted from a GitHub issue that states scope and acceptance criteria, and gets its own isolated checkout.',
          'A script creates it, so parallel work never shares a working copy. That is what makes it safe to let a run go wrong.',
        ],
      },
      {
        id: 'small-harness',
        label: 'A harness small enough to read.',
        sentences: [
          'Four tools by default, read, write, edit, and shell, extended with my own TypeScript.',
          'Knowing what the harness actually contributes, from the system prompt to the tool-call loop, is what makes the output judgeable instead of magic.',
        ],
      },
      {
        id: 'guardrails',
        label: 'Guardrails instead of permission prompts.',
        sentences: [
          'A guard inspects tool calls and refuses secrets files and destructive shell commands before they run.',
          'I am not clicking approve all day in order to feel safe, because a prompt you approve two hundred times a day is not a control.',
        ],
      },
      {
        id: 'visible-sessions',
        label: 'Sessions I can watch.',
        sentences: [
          'Agents run in visible terminal sessions I can focus, interrupt, and take over.',
          'An agent that is blocked is something to look at, not something to wait out.',
        ],
      },
      {
        id: 'multi-harness',
        label: 'More than one harness, on purpose.',
        sentences: [
          'Pi is the harness I extend, Claude Code does most of the coding, and Codex covers general work.',
          'When a change matters I have a different model look at it, because the one that wrote it is a poor judge of whether it was a good idea. That is a decision per change rather than a ritual.',
        ],
      },
      {
        id: 'design-owner',
        label: 'Design has a named owner.',
        sentences: [
          'Product, interaction, and architecture decisions are written down before implementation starts.',
          'They are assigned deliberately, and an implementing agent that reaches an unresolved design question stops and hands it back rather than inventing one. That is the single rule that keeps this from producing confident nonsense.',
        ],
      },
      {
        id: 'nothing-irreversible',
        label: 'Nothing irreversible without me.',
        sentences: [
          'Agents do not merge, approve, delete branches, or take any other protected remote action on their own.',
          'The local permissions are relaxed so that routine reads and tests do not interrupt me. The remote ones are not.',
        ],
      },
    ],
  },

  tools: {
    heading: 'The tools, and what each one was for',
    intro: 'I have used these in real work rather than evaluated them for a comparison. Each one is here because it changed something, and each entry is dated because this landscape does not hold still.',
    entries: [
      {
        id: 'copilot',
        name: 'GitHub Copilot',
        context: '2025 · client team',
        sentences: [
          'Where the team started, inside VS Code, after I had already been using it on my own projects.',
          'It made assistance normal, and it showed the limit of approving every edit by hand.',
        ],
      },
      {
        id: 'opencode',
        name: 'OpenCode',
        context: '2026 · client team',
        sentences: [
          'The first step out of the editor and into a terminal agent.',
          'It moved review from each edit to the intent, the run, and the result, and it raised the question of how to share agent resources across repositories and tools.',
        ],
      },
      {
        id: 'pi',
        name: 'Pi',
        context: '2026 · client team, then mine',
        sentences: [
          'A deliberately small harness with four default tools and extensions written in TypeScript.',
          'The team settled on it because it was the most flexible of the three, and it is still the harness I extend.',
        ],
      },
      {
        id: 'claude-code',
        name: 'Claude Code',
        context: '2026 · my own work',
        sentences: [
          'My main coding agent, and where larger implementation work happens.',
          'The design is written down before any code, with an explicit review pass afterwards.',
        ],
      },
      {
        id: 'codex',
        name: 'Codex',
        context: '2026 · my own work',
        sentences: [
          'General work, and a second environment and model when a different angle helps.',
          'Sometimes that angle is a review of something another agent wrote, which is a choice per change rather than a rule.',
        ],
      },
      {
        id: 'local-models',
        name: 'Local models',
        context: '2026 · my own work',
        sentences: [
          'Run on my own machine for privacy-sensitive experimentation and to evaluate what smaller local models can and cannot do.',
          'They are not what I reach for on client delivery.',
        ],
      },
    ],
    evidenceLink: {
      label: 'My own harness extensions are public: github.com/mtrenker/pi-clean',
      href: 'https://github.com/mtrenker/pi-clean',
    },
  },

  lessons: {
    heading: 'What I take from it',
    items: [
      {
        id: 'context',
        label: 'Context beats prompting.',
        sentences: [
          'Most bad agent output is missing context, not a weak model.',
          'The work that pays off is deciding what the agent is allowed to see and telling it what already exists.',
        ],
      },
      {
        id: 'slicing',
        label: 'Slice for the reviewer, not the agent.',
        sentences: [
          'If a change is too large for a person to review honestly, it was cut for the wrong reader.',
          'An agent will happily accept a task nobody can check.',
        ],
      },
      {
        id: 'review-capacity',
        label: 'Review capacity is the real limit.',
        sentences: [
          'Generating more changes than a team can review moves the queue, not the work.',
          'Two pull requests waiting on a human is already a full pipeline.',
        ],
      },
      {
        id: 'deterministic-tooling',
        label: 'Deterministic tooling is what makes any of this checkable.',
        sentences: [
          'Types, tests, and a command-line interface with a documented contract turn "looks right" into "passes".',
          'Without them there is nothing to disagree with.',
        ],
      },
      {
        id: 'ownership',
        label: 'Ownership does not transfer.',
        sentences: [
          'The person who merges a change answers for it, in review, in an incident, and a year later.',
          'That does not become less true because a model wrote the first draft.',
        ],
      },
    ],
  },

  limits: {
    heading: 'What I don\'t claim',
    items: [
      {
        id: 'not-a-researcher',
        label: 'I am not an ML researcher.',
        sentences: ['I do not train or fine-tune models. I build software and evaluate how these tools fit engineering work.'],
      },
      {
        id: 'no-number',
        label: APPROVED_DISCLAIMERS[0],
        sentences: [APPROVED_DISCLAIMERS[1]],
      },
      {
        id: 'nothing-unattended',
        label: 'Nothing here merged unattended.',
        sentences: ['Every change went through deterministic checks and a person before it merged.'],
      },
      {
        id: 'team-not-company',
        label: 'One team, not a company-wide rollout.',
        sentences: ['I drove adoption within our Douglas team. Nothing here claims adoption across the wider organisation.'],
      },
    ],
  },

  colophon: 'This page is not in the site navigation and asks search engines not to index it. That is not privacy. The URL, this site, and its source history are public, so everything here is written to be safe in the open.',

  close: {
    body: 'The engagement record behind this page, with the projects, dates, and outcomes it refers to, is on the work page.',
    links: [
      { label: 'See the engagement record', href: '/work#douglas', variant: 'secondary' },
      { label: 'Get in touch', href: '/contact', variant: 'primary' },
    ],
  },
};
