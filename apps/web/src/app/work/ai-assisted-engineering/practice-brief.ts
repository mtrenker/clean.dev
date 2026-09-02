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

export type ClaimMaturity = 'team' | 'pilot' | 'mine' | 'proposed';

/** Print budget for `sentences[0]`, in characters. Enforced by the module test. */
export const PRINT_SENTENCE_BUDGET = 120;

/**
 * The only sentences allowed to name a quantitative concept, and they name it
 * in order to deny it. The module test removes these exact strings before
 * scanning for unsupported quantitative claims, so the page can refuse to give
 * a productivity number without the guard rejecting the refusal.
 *
 * Adding an entry here is a deliberate, reviewable act.
 */
export const APPROVED_DISCLAIMERS = [
  'I have no productivity number.',
  'The teams I worked with did not measure one, and a percentage without a baseline is decoration.',
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
  role: string;
}

export interface PracticeBrief {
  eyebrow: string;
  title: string;
  subtitle: string;
  lead: string;
  meta: string;
  print: { action: string; hint: string; docLabel: string; footer: string };
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

export const practiceBrief: PracticeBrief = {
  eyebrow: 'Practice brief',
  title: 'AI-assisted engineering in practice',
  subtitle: 'From team adoption at Douglas to my daily agent workflow',
  lead: 'I use coding agents on real delivery work: first inside a client team at Douglas, now as the normal way I build, investigate, and review software. This is a short account of what that looks like in practice, what a team adopted, what stayed an experiment, and what I still will not claim.',
  meta: 'Martin Trenker · Technical Lead and Solutions Architect · September 2026',
  print: {
    action: 'Print or save as PDF',
    hint: 'One A4 page.',
    docLabel: 'Practice brief · September 2026',
    footer: 'Martin Trenker · clean.dev · info@clean.dev',
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
    intro: 'I joined Douglas to modernise the point-of-sale and CRM software used in more than 1,200 stores across 14 European countries, and stayed for two and a half years, ending as Solutions Architect. AI-assisted work grew inside that engagement. It started as editor assistance anyone could try and became shared tooling, guardrails, and a review habit. Adoption was real but uneven, so each item below says how far it actually got.',
    keyHeading: 'How far each item got',
    maturities: [
      { id: 'team', label: 'Team practice', definition: 'Part of how the team worked.', tone: 'green' },
      { id: 'pilot', label: 'Pilot', definition: 'Tried deliberately for a period, never settled into a standard.', tone: 'amber' },
      { id: 'mine', label: 'My own use', definition: 'How I worked. Not a team rollout.', tone: 'rust' },
      { id: 'proposed', label: 'Proposed', definition: 'Recommended at handover, not adopted before the engagement ended.', tone: 'muted' },
    ],
    claims: [
      {
        id: 'editor-first',
        maturity: 'team',
        label: 'Editor assistance came first.',
        sentences: [
          'We joined the GitHub Copilot evaluation in mid-2025 and used it in VS Code and Neovim, where the team already worked.',
          'It was easy to adopt, and it made the ceiling obvious: approving every suggested edit keeps a person in the loop by turning them into a confirmation dialog.',
        ],
      },
      {
        id: 'shared-resources',
        maturity: 'team',
        label: 'Shared agent resources, versioned like code.',
        sentences: [
          'Instructions, skills, and extensions lived in one versioned repository that several projects and tools could consume.',
          'The alternative was copying them into every repository and watching them drift apart, which is how a team ends up with five different definitions of how it works.',
        ],
      },
      {
        id: 'controlled-access',
        maturity: 'team',
        label: 'Controlled access, not open access.',
        sentences: [
          'I built a Node.js and TypeScript CLI that gave agents governed access to Jira, Confluence, and Azure DevOps.',
          'It covered only the delivery systems we were allowed to use, with one documented interface instead of ad hoc integrations, credentials handled outside the model, and human review of everything it produced.',
          'Guardrails sat alongside it: sensitive files and destructive shell commands are refused before a tool call runs, so autonomy inside a task never means autonomy over the machine.',
        ],
      },
      {
        id: 'learning-session',
        maturity: 'team',
        label: 'New practice went through a learning session first.',
        sentences: [
          'Full Stack Fridays, the team\'s recurring learning format, is where a change to how we worked was shown first.',
          'It was argued about there before it became routine, because tooling that arrives without that conversation gets used once and quietly abandoned.',
        ],
      },
      {
        id: 'terminal-agents',
        maturity: 'pilot',
        label: 'Terminal agents, beyond the editor.',
        sentences: [
          'From early 2026 we tried terminal agents that work for longer stretches under a different kind of oversight.',
          'Review moves from each edit to the intent, the run, and the result. It changed how I work permanently, and across the team it stayed an experiment rather than a standard.',
        ],
      },
      {
        id: 'planning-slicing',
        maturity: 'pilot',
        label: 'AI-assisted planning and task slicing.',
        sentences: [
          'We experimented with cutting work into slices an agent can finish and a person can still review honestly.',
          'Slicing for the agent alone is how a team loses its connection to its own codebase, so the slicing itself was something we walked through together.',
        ],
      },
      {
        id: 'agent-supported-delivery',
        maturity: 'mine',
        label: 'Agent-supported delivery on two production systems.',
        sentences: [
          'Agents supported the work on the in-house short-link and QR service and on the unified CRM API.',
          'I designed both, reviewed every change, and stayed responsible for what shipped. Both appear in my project record as delivery outcomes, and I am not claiming that AI caused them.',
        ],
      },
      {
        id: 'learning-dotnet',
        maturity: 'mine',
        label: 'Learning C# and .NET on the job, with help.',
        sentences: [
          'The unified API needed a stack I had not worked in, and I used agents to learn it while delivering.',
          'I say that plainly as part of how the work happened, not as a claim of accumulated depth or measured speed.',
        ],
      },
      {
        id: 'handover-proposals',
        maturity: 'proposed',
        label: 'Deterministic workflows and generated documentation.',
        sentences: [
          'At handover I recommended repeatable agent workflows and product documentation generated from browser tests.',
          'The first replaces ad hoc prompting with defined steps; the second turns user-story-driven tests into living documentation. Neither was adopted before my engagement ended, which is exactly why they are listed here as proposals.',
        ],
      },
    ],
    closing: 'In July 2026 I demonstrated my own agent setup and the workflow around it at Douglas. That was a demonstration, not a rollout, and the labels above are deliberate about the difference.',
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
        id: 'independent-review',
        label: 'The author is not the only reviewer.',
        sentences: [
          'A second, independent model reviews the change, and I make the call on what it found.',
          'The model that wrote a change is the worst available judge of whether it was a good idea.',
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
        role: 'Where the team started, inside VS Code and Neovim. It made assistance normal, and it showed the limit of approving every edit by hand.',
      },
      {
        id: 'opencode',
        name: 'OpenCode',
        context: '2026 · client team',
        role: 'The first step out of the editor and into a terminal agent. It moved review from each edit to the intent, the run, and the result, and it raised the question of how to share agent resources across repositories and tools.',
      },
      {
        id: 'pi',
        name: 'Pi',
        context: '2026 · my own work',
        role: 'A deliberately small harness with four default tools and extensions written in TypeScript. It is where I learned what a harness actually contributes, and where a guard can intercept a call.',
      },
      {
        id: 'claude-code',
        name: 'Claude Code',
        context: '2026 · my own work',
        role: 'What I use for design-owning and larger implementation work, with the design written down before any code and an explicit review pass afterwards.',
      },
      {
        id: 'codex',
        name: 'Codex',
        context: '2026 · my own work',
        role: 'A second implementation and review model, so the one that wrote a change is not the only one that judges it.',
      },
      {
        id: 'local-models',
        name: 'Local models',
        context: '2026 · my own work',
        role: 'Run on my own machine for privacy-sensitive experimentation and to evaluate what smaller local models can and cannot do. They are not what I reach for on client delivery.',
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
        sentences: ['I do not train, fine-tune, or evaluate models. I build software and use these tools to do it.'],
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
        id: 'partial-adoption',
        label: 'Adoption at Douglas was partial.',
        sentences: ['Some of this was daily team practice, some stayed a pilot, and some was mine alone. The labels above say which.'],
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
