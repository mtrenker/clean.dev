/**
 * Example documents that demonstrate the layout elements across different
 * document kinds. These are *samples for demos and tests* — the package core
 * stays content-agnostic. Import them only where you want ready-made content.
 */
import { b } from './builders';
import type { DocumentValue } from './types';

/** A project profile / CV — uses cover, key-value, columns, cards. */
export const sampleProfile: DocumentValue = [
  b.cover([
    b.eyebrow('Project Profile'),
    b.docTitle('Senior Delivery Consultant'),
    b.docSubtitle('Web platform modernisation · embedded technical leadership'),
  ]),
  b.columns([
    b.column(
      [
        b.p(
          'A short, punchy summary paragraph goes here. Describe the value delivered, the kinds of teams worked with, and the headline outcomes — kept generic so the same template serves any role or candidate.',
        ),
      ],
      2,
    ),
    b.column([
      b.keyValue([
        b.kv('Experience', '15+ years'),
        b.kv('Engagements', '19'),
        b.kv('Basis', 'Self-employed'),
      ]),
    ]),
  ]),
  b.section([
    b.h2('Selected Engagements'),
    b.card(
      [
        b.p(
          'Led a business-critical rewrite to a maintainable architecture, shipped in under a year with measurable delivery-quality gains.',
        ),
      ],
      {
        aside: '2024–26',
        title: 'Acme Retail',
        meta: 'Technical Lead',
        tags: ['react', 'typescript', 'next.js'],
      },
    ),
    b.card(
      [b.p('Owned the handover of a platform from an agency to a new in-house team.')],
      {
        aside: '2022–23',
        title: 'Globex Digital',
        meta: 'Solutions Architect',
        tags: ['graphql', 'cypress'],
      },
    ),
  ]),
];

/** A client report — uses sections, callouts, key-value, page break. */
export const sampleReport: DocumentValue = [
  b.cover([
    b.eyebrow('Quarterly Report'),
    b.docTitle('Platform Health · Q3'),
    b.docSubtitle('Prepared for Acme Inc.'),
  ]),
  b.section([
    b.h2('Executive Summary'),
    b.p(
      'Summarise the period in two or three sentences. Highlight the trend and the single most important decision the reader needs to make.',
    ),
    b.callout(
      [b.p('Uptime held at 99.96% while deploy frequency doubled quarter over quarter.')],
      { variant: 'success', title: 'Headline' },
    ),
  ]),
  b.section([
    b.h2('Key Metrics'),
    b.keyValue([
      b.kv('Availability', '99.96%'),
      b.kv('Deploys / week', '24'),
      b.kv('Mean lead time', '1.8 days'),
    ]),
    b.callout([b.p('Lead time regressed in week 9 — see the incident appendix.')], {
      variant: 'warning',
      title: 'Watch',
    }),
  ]),
  b.pageBreak(),
  b.section([
    b.h2('Recommendations'),
    b.p('Lay out next steps as ordinary paragraphs or cards, one decision per block.'),
  ]),
];

/** A proposal / offer — cover, columns, cards, key-value pricing. */
export const sampleProposal: DocumentValue = [
  b.cover([
    b.eyebrow('Proposal'),
    b.docTitle('Engagement Proposal'),
    b.docSubtitle('Discovery & delivery for the new customer portal'),
  ]),
  b.section([
    b.h2('Scope'),
    b.columns([
      b.column([
        b.h3('In scope'),
        b.p('Discovery workshops, architecture, and the first production slice.'),
      ]),
      b.column([
        b.h3('Out of scope'),
        b.p('Content migration and third-party integrations beyond the agreed list.'),
      ]),
    ]),
  ]),
  b.section([
    b.h2('Investment'),
    b.keyValue([
      b.kv('Discovery', '2 weeks'),
      b.kv('Delivery', '8 weeks'),
      b.kv('Rate basis', 'Fixed phase fee'),
    ]),
    b.callout([b.p('Pricing is valid for 30 days from the date of this proposal.')], {
      variant: 'info',
      title: 'Terms',
    }),
  ]),
];

/** A blog post — flow-friendly long-form prose with a quote and callout. */
export const sampleBlogPost: DocumentValue = [
  b.eyebrow('Engineering'),
  b.docTitle('Designing for the Page'),
  b.docSubtitle('Why paginated authoring still matters'),
  b.p(
    'Open with a hook. Long-form writing benefits from the same layout discipline as printed documents: predictable measure, deliberate rhythm, and clear hierarchy.',
  ),
  b.h2('The argument'),
  b.p('Develop the idea across a few paragraphs, using emphasis where it earns its place.'),
  b.blockquote('A pull-quote anchors the reader and breaks up a long stretch of prose.'),
  b.callout([b.p('Tip: switch to flow mode for distraction-free drafting, then to page mode to compose the final PDF.')], {
    variant: 'note',
    title: 'Workflow',
  }),
  b.p('Close with a takeaway the reader can act on.'),
];

export const samples = {
  profile: sampleProfile,
  report: sampleReport,
  proposal: sampleProposal,
  blogPost: sampleBlogPost,
} as const;
