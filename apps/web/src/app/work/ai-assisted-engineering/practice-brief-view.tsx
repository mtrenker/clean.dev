import React from 'react';
import { ButtonLink, Card, Eyebrow, SectionHeader, SiteContainer, SiteSection, SiteShell, Tag } from '@/components/site/public-design';
import { Link } from '@/components/ui/link';
import { practiceBrief, type Claim, type LabelledItem, type MaturityDefinition } from './practice-brief';
import { WorkflowRail } from './workflow-rail';
import { PrintAction } from './print-action';

/**
 * Screen composition of the practice brief. Every fact comes from
 * `practice-brief.ts`; nothing here is hard-coded.
 *
 * The page deliberately opts out of the site's `.observe` scroll reveal. A
 * document people print, screenshot, and forward must be complete at first
 * paint, which also makes the reduced-motion behaviour correct by construction.
 */

const PROSE = 'max-w-[46rem]';

const maturityById = new Map<string, MaturityDefinition>(
  practiceBrief.client.maturities.map((maturity) => [maturity.id, maturity]),
);

const ItemSentences = ({ item }: { item: LabelledItem }) => (
  <>
    {item.sentences.map((sentence) => (
      <p key={sentence} className={`mt-2 text-base leading-7 text-[var(--site-ink-sec)] ${PROSE}`}>
        {sentence}
      </p>
    ))}
  </>
);

const ClaimEntry = ({ claim }: { claim: Claim }) => {
  const maturity = maturityById.get(claim.maturity);

  return (
    <li className="grid gap-3 border-t border-[var(--site-rule)] py-5 md:grid-cols-[9rem_1fr] md:gap-6">
      <div>
        <Tag tone={maturity?.tone ?? 'muted'}>{maturity?.label ?? claim.maturity}</Tag>
      </div>
      <div>
        <h3 className="text-base font-semibold leading-6 text-[var(--site-ink)]">{claim.label}</h3>
        <ItemSentences item={claim} />
      </div>
    </li>
  );
};

const LabelledRows = ({ items, columns }: { items: LabelledItem[]; columns: string }) => (
  <dl className={`grid ${columns}`}>
    {items.map((item) => (
      <div key={item.id} className="border-t border-[var(--site-rule)] py-5">
        <dt className="text-base font-semibold leading-6 text-[var(--site-ink)]">{item.label}</dt>
        <dd>
          <ItemSentences item={item} />
        </dd>
      </div>
    ))}
  </dl>
);

export const PracticeBriefView: React.FC = () => {
  const brief = practiceBrief;

  return (
    <SiteShell className="print:hidden" lang="en">
      <SiteSection className="py-10 md:py-14">
        <SiteContainer narrow>
          <Eyebrow>{brief.eyebrow}</Eyebrow>
          <h1 className="mt-6 max-w-4xl text-[clamp(2.4rem,5.5vw,4rem)] font-medium leading-[0.98] tracking-[-0.045em] text-[var(--site-ink)]">
            {brief.title}
          </h1>
          <p className="mt-5 max-w-3xl text-xl leading-8 text-[var(--site-ink-sec)] md:text-2xl md:leading-9">
            {brief.subtitle}
          </p>
          <p className={`mt-7 text-lg leading-8 text-[var(--site-ink-sec)] ${PROSE}`}>{brief.lead}</p>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--site-rule)] pt-6">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--site-ink-sec)]">{brief.meta}</p>
            <PrintAction hint={brief.print.hint} label={brief.print.action} />
          </div>
        </SiteContainer>
      </SiteSection>

      <SiteSection>
        <SiteContainer narrow>
          <SectionHeader title={brief.principle.heading} />
          <p className={`text-base leading-7 text-[var(--site-ink-sec)] ${PROSE}`}>{brief.principle.body}</p>
          <LabelledRows columns="mt-6 gap-x-8 md:grid-cols-3" items={brief.principle.items} />
        </SiteContainer>
      </SiteSection>

      <SiteSection>
        <SiteContainer narrow>
          <SectionHeader title={brief.workflow.heading} />
          <p className={`mb-8 text-base leading-7 text-[var(--site-ink-sec)] ${PROSE}`}>{brief.workflow.intro}</p>
          <WorkflowRail stages={brief.workflow.stages} />
          <p className={`mt-6 text-sm leading-6 text-[var(--site-ink-sec)] ${PROSE}`}>{brief.workflow.loopNote}</p>
        </SiteContainer>
      </SiteSection>

      <SiteSection>
        <SiteContainer narrow>
          {/* The client meta is a full role progression, too long for
              SectionHeader's inline slot: sharing the row squeezes the heading
              into four stacked lines. It gets its own line instead. */}
          <SectionHeader title={brief.client.heading} />
          <p className="-mt-4 mb-6 font-mono text-xs uppercase tracking-[0.14em] text-[var(--site-ink-sec)]">
            {brief.client.meta}
          </p>
          <p className={`text-base leading-7 text-[var(--site-ink-sec)] ${PROSE}`}>{brief.client.intro}</p>

          <Card className="mt-8 p-5">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[var(--site-ink-sec)]">
              {brief.client.keyHeading}
            </p>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {brief.client.maturities.map((maturity) => (
                <div key={maturity.id}>
                  <dt>
                    <Tag tone={maturity.tone}>{maturity.label}</Tag>
                  </dt>
                  <dd className="mt-2 text-sm leading-6 text-[var(--site-ink-sec)]">{maturity.definition}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <ul className="mt-8">
            {brief.client.claims.map((claim) => (
              <ClaimEntry key={claim.id} claim={claim} />
            ))}
          </ul>

          <p className={`mt-6 border-t border-[var(--site-rule)] pt-6 text-base leading-7 text-[var(--site-ink-sec)] ${PROSE}`}>
            {brief.client.closing}
          </p>
        </SiteContainer>
      </SiteSection>

      <SiteSection>
        <SiteContainer narrow>
          <SectionHeader meta={brief.practice.meta} title={brief.practice.heading} />
          <p className={`text-base leading-7 text-[var(--site-ink-sec)] ${PROSE}`}>{brief.practice.intro}</p>
          <LabelledRows columns="mt-6 gap-x-10 md:grid-cols-2" items={brief.practice.items} />
        </SiteContainer>
      </SiteSection>

      <SiteSection>
        <SiteContainer narrow>
          <SectionHeader title={brief.tools.heading} />
          <p className={`text-base leading-7 text-[var(--site-ink-sec)] ${PROSE}`}>{brief.tools.intro}</p>
          <ol className="mt-6">
            {brief.tools.entries.map((entry) => (
              <li
                key={entry.id}
                className="grid gap-1 border-t border-[var(--site-rule)] py-5 md:grid-cols-[11rem_9rem_1fr] md:gap-6"
              >
                <span className="text-base font-semibold text-[var(--site-ink)]">{entry.name}</span>
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--site-ink-sec)] md:mt-1">
                  {entry.context}
                </span>
                <span className="text-base leading-7 text-[var(--site-ink-sec)]">{entry.sentences.join(' ')}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm leading-6 text-[var(--site-ink-sec)]">
            {/* `variant="inline"` resolves to --accent, which is the dark-theme
                rust and fails AA on the light page background. The public site
                uses --site-rust, which passes in both themes. */}
            <Link
              ariaLabel={`${brief.tools.evidenceLink.label} (opens in a new tab)`}
              className="text-[var(--site-rust)] underline underline-offset-4 hover:text-[var(--site-ink)] focus-visible:ring-[var(--site-rust)] focus-visible:ring-offset-[var(--site-bg)]"
              external
              href={brief.tools.evidenceLink.href}
              variant="unstyled"
            >
              {brief.tools.evidenceLink.label}
            </Link>
          </p>
        </SiteContainer>
      </SiteSection>

      <SiteSection>
        <SiteContainer narrow>
          <SectionHeader title={brief.lessons.heading} />
          <ol className="grid gap-x-10 lg:grid-cols-2">
            {brief.lessons.items.map((item, index) => (
              <li key={item.id} className="border-t border-[var(--site-rule)] py-5">
                <p aria-hidden="true" className="font-mono text-sm text-[var(--site-rust)]">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-2 text-base font-semibold leading-6 text-[var(--site-ink)]">{item.label}</h3>
                <ItemSentences item={item} />
              </li>
            ))}
          </ol>
        </SiteContainer>
      </SiteSection>

      <SiteSection>
        <SiteContainer narrow>
          <SectionHeader title={brief.limits.heading} />
          <Card className="border-l-4 border-l-[var(--site-rust)] p-6">
            <dl className="grid gap-5">
              {brief.limits.items.map((item) => (
                <div key={item.id}>
                  <dt className="text-base font-semibold leading-6 text-[var(--site-ink)]">{item.label}</dt>
                  <dd className={`mt-1 text-base leading-7 text-[var(--site-ink-sec)] ${PROSE}`}>
                    {item.sentences.join(' ')}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        </SiteContainer>
      </SiteSection>

      <SiteSection border={false}>
        <SiteContainer narrow>
          <p className={`font-mono text-sm leading-6 text-[var(--site-ink-sec)] ${PROSE}`}>{brief.colophon}</p>
          <p className={`mt-6 text-base leading-7 text-[var(--site-ink-sec)] ${PROSE}`}>{brief.close.body}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {brief.close.links.map((link) => (
              <ButtonLink key={link.href} href={link.href} variant={link.variant}>
                {link.label}
              </ButtonLink>
            ))}
          </div>
        </SiteContainer>
      </SiteSection>
    </SiteShell>
  );
};
