import Image from 'next/image';
import type { IntlShape } from 'react-intl';
import { ButtonLink, Card, Eyebrow, SectionHeader, SiteContainer, SiteSection, SiteShell, Tag } from '@/components/site/public-design';
import { SocialIcon } from '@/components/ui';
import { Link } from '@/components/ui/link';
import type { Project } from '@/app/projects';
import { buildDouglasWorkCase, isDouglasProject } from '@/app/work/douglas-case';
import { getConsultingAvailability } from '@/lib/availability';
import type { Locale } from '@/lib/locale';

const PRACTICES = ['embed', 'system', 'ai'] as const;
const TOPICS = ['cleanCode', 'agile', 'aiDelivery', 'leadership'] as const;
const FIT = ['buyer', 'shape', 'mode', 'not'] as const;
const WORKBENCH_ROWS = ['one', 'two', 'three', 'four'] as const;

type SocialLink = {
  key: 'xing' | 'linkedin' | 'github';
  href: string;
  label: string;
  ariaLabel: string;
};

interface LandingPageProps {
  intl: IntlShape;
  locale: Locale;
  projects: Project[];
  socialLinks: SocialLink[];
}

type EngagementProject = Project & { company: string };

const msg = (intl: IntlShape, id: string) => intl.formatMessage({ id });
const getYear = (date: string) => new Date(`${date}-01T00:00:00Z`).getUTCFullYear();
const formatDateRange = (startDate: string, endDate: string) => {
  const startYear = getYear(startDate);
  const endYear = getYear(endDate);
  return startYear === endYear ? `${startYear}` : `${startYear}-${String(endYear).slice(2)}`;
};
const formatYearRange = (project: Project) => formatDateRange(project.startDate, project.endDate);
const projectName = (project: Project, locale: Locale) => project.company ?? project.industry?.[locale] ?? project.id;
const recentProjects = (projects: Project[]) =>
  projects
    .filter((project): project is EngagementProject => Boolean(project.company) && Boolean(project.featured))
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
const projectSignal = (project: Project, locale: Locale) => project.highlights[locale][0] ?? project.description[locale];

const ProfileCard = ({ intl, locale }: Pick<LandingPageProps, 'intl' | 'locale'>) => {
  const availability = getConsultingAvailability(locale);

  return (
    <Card className="p-5">
      <div className="flex gap-4">
        <Image src="/me.png" alt={msg(intl, 'work.img.alt')} width={92} height={92} className="h-20 w-20 rounded-[4px] border border-[var(--site-rule)] object-cover grayscale-[10%] md:h-[92px] md:w-[92px]" priority />
        <div>
          <p className="text-lg font-semibold tracking-[-0.01em] text-[var(--site-ink)]">Martin Trenker</p>
          <p className="mt-1 font-mono text-[0.7rem] leading-6 tracking-[0.04em] text-[var(--site-ink-mute)]">
            {msg(intl, 'home.profileCard.meta1')}<br />
            {availability.location} / {availability.languages}<br />
            <span className="text-[var(--site-ink-sec)]">{msg(intl, 'home.profileCard.meta3')}</span>
          </p>
        </div>
      </div>
      <p className="mt-4 border-t border-dashed border-[var(--site-rule)] pt-4 font-mono text-xs leading-6 text-[var(--site-ink-sec)]">
        {msg(intl, 'home.profileCard.note')}
      </p>
    </Card>
  );
};

const AvailabilityCard = ({ locale }: { locale: Locale }) => {
  const availability = getConsultingAvailability(locale);

  return (
    <Card className="border-l-4 border-l-[var(--site-rust)] p-5">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">{availability.label}</p>
      <p className="mt-3 text-sm leading-6 text-[var(--site-ink)]">{availability.dossierSummary}</p>
    </Card>
  );
};

const Hero = ({ intl, locale }: Pick<LandingPageProps, 'intl' | 'locale'>) => {
  const availability = getConsultingAvailability(locale);

  return (
    <SiteSection className="py-8 md:py-16 lg:py-20">
      <SiteContainer>
        <Eyebrow>{availability.eyebrow}</Eyebrow>
        <h1 className="mt-4 max-w-[72rem] text-[clamp(2.25rem,6.2vw,5.75rem)] font-medium leading-[0.98] tracking-[-0.05em] text-[var(--site-ink)] md:mt-7">
          {msg(intl, 'home.hero.heading')}
        </h1>
        <p className="mt-4 max-w-4xl text-[0.95rem] leading-[1.45] text-[var(--site-ink-sec)] sm:text-base md:mt-7 md:text-xl md:leading-8">
          {msg(intl, 'home.hero.lead')}
        </p>
        <p className="mt-3 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-[var(--site-green)] md:mt-5 md:text-sm">
          {msg(intl, 'home.hero.supporting')}
        </p>
        <p className="mt-3 max-w-4xl text-sm font-semibold leading-6 text-[var(--site-ink)] md:mt-5 md:text-base">
          {availability.summary}
        </p>
        <div className="mt-5 flex flex-wrap gap-3 md:mt-7">
          <ButtonLink href="/contact" className="min-h-[44px] px-4 py-3 text-xs sm:px-6 sm:py-4 sm:text-sm">{msg(intl, 'home.hero.cta.contact')}</ButtonLink>
          <ButtonLink href="/work" variant="secondary" className="min-h-[44px] px-4 py-3 text-xs sm:px-6 sm:py-4 sm:text-sm">{msg(intl, 'home.hero.cta.work')}</ButtonLink>
        </div>
      </SiteContainer>
    </SiteSection>
  );
};

const EvidenceStrip = ({ intl, locale, projects }: Pick<LandingPageProps, 'intl' | 'locale' | 'projects'>) => {
  const douglasCase = buildDouglasWorkCase(projects, locale);
  const outcomes = [
    douglasCase.teamContribution[0],
    douglasCase.teamContribution[1],
    douglasCase.personalOwnership[0],
    douglasCase.personalOwnership[2],
  ];

  return (
    <section aria-labelledby="home-proof-heading" className="border-b border-[var(--site-rule)] bg-[var(--site-panel)]">
      <div className="grid border-b border-[var(--site-rule)] md:grid-cols-4">
        {[
          { value: '20+', label: msg(intl, 'home.proof.years') },
          { value: String(projects.length), label: msg(intl, 'home.proof.engagements') },
          { value: douglasCase.role, label: msg(intl, 'home.proof.roles') },
          { value: msg(intl, 'home.proof.enterprise.value'), label: msg(intl, 'home.proof.enterprise') },
        ].map((proof) => (
          <div key={proof.label} className="border-b border-r border-[var(--site-rule)] px-5 py-6 md:border-b-0 md:px-8">
            <p className="text-2xl font-medium tracking-[-0.03em] text-[var(--site-ink)] md:text-3xl">{proof.value}</p>
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] text-[var(--site-ink-sec)]">{proof.label}</p>
          </div>
        ))}
      </div>
      <SiteContainer className="py-8 md:py-10">
        <div className="grid gap-5 lg:grid-cols-[15rem_1fr]">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em]">
              <Link href="/work#douglas" className="text-[var(--site-ink)] no-underline hover:text-[var(--site-rust)]">Douglas</Link>
            </p>
            <h2 id="home-proof-heading" className="mt-4 text-2xl font-medium tracking-[-0.03em] text-[var(--site-ink)]">{msg(intl, 'home.proof.heading')}</h2>
          </div>
          <ul className="grid gap-x-8 gap-y-3 md:grid-cols-2">
            {outcomes.map((outcome) => (
              <li key={outcome} className="grid grid-cols-[1rem_1fr] gap-2 text-sm leading-6 text-[var(--site-ink-sec)]">
                <span className="font-mono text-[var(--site-ink)]">+</span>
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      </SiteContainer>
    </section>
  );
};

const Thesis = ({ intl }: { intl: IntlShape }) => (
  <SiteSection>
    <SiteContainer>
      <Card className="relative overflow-hidden border-l-4 border-l-[var(--site-amber)] p-6 md:p-8 lg:p-10">
        <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 border-b border-l border-[var(--site-rule)] bg-[var(--site-rule-soft)]" aria-hidden="true" />
        <div className="grid gap-7 lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start">
          <div>
            <Eyebrow tone="amber">{msg(intl, 'home.hero.thesis.label')}</Eyebrow>
            <p className="mt-4 max-w-[11rem] font-mono text-xs leading-6 text-[var(--site-ink-mute)]">
              {msg(intl, 'home.hero.thesis.meta')}
            </p>
          </div>
          <p className="max-w-4xl text-2xl font-medium leading-10 tracking-[-0.02em] text-[var(--site-ink)] md:text-4xl md:leading-tight">
            {msg(intl, 'home.hero.thesis.body')}
          </p>
        </div>
        <div className="mt-9 lg:ml-[15rem]">
          <ButtonLink href="/contact">{msg(intl, 'home.hero.cta.contact')}</ButtonLink>
        </div>
      </Card>
    </SiteContainer>
  </SiteSection>
);

const Position = ({ intl }: { intl: IntlShape }) => (
  <SiteSection>
    <SiteContainer>
      <SectionHeader title={msg(intl, 'home.position.heading')} meta={msg(intl, 'home.position.meta')} />
      <div className="grid overflow-hidden rounded-[6px] border border-[var(--site-rule)] bg-[var(--site-panel)] lg:grid-cols-2">
        <div className="p-6 md:p-8 lg:border-r lg:border-[var(--site-rule)]">
          <Tag tone="green">{msg(intl, 'home.position.is.label')}</Tag>
          <ul className="mt-5 divide-y divide-[var(--site-rule)]">
            {['1', '2', '3', '4'].map((item) => (
              <li key={item} className="flex gap-4 py-3 text-lg text-[var(--site-ink)]"><span className="font-mono text-[var(--site-green)]">+</span>{msg(intl, `home.position.is.${item}`)}</li>
            ))}
          </ul>
        </div>
        <div className="bg-[var(--site-panel-alt)] p-6 md:p-8">
          <Tag tone="rust">{msg(intl, 'home.position.not.label')}</Tag>
          <ul className="mt-5 divide-y divide-[var(--site-rule)]">
            {['1', '2', '3', '4'].map((item) => (
              <li key={item} className="flex gap-4 py-3 text-lg text-[var(--site-ink-mute)]"><span className="font-mono text-[var(--site-rust)]">-</span>{msg(intl, `home.position.not.${item}`)}</li>
            ))}
          </ul>
        </div>
      </div>
    </SiteContainer>
  </SiteSection>
);

const WorkbenchCard = ({ intl }: { intl: IntlShape }) => (
  <Card className="p-5">
    <div className="mb-4 flex items-center justify-between border-b border-[var(--site-rule)] pb-3">
      <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[var(--site-ink-mute)]">{msg(intl, 'home.workbench.label')}</span>
      <Tag tone="amber">{msg(intl, 'home.workbench.status')}</Tag>
    </div>
    <div className="space-y-2 font-mono text-xs leading-6">
      {WORKBENCH_ROWS.map((row) => (
        <div key={row} className="grid grid-cols-[4.5rem_5rem_1fr] gap-2">
          <span className="text-[var(--site-ink-faint)]">{msg(intl, `home.workbench.${row}.time`)}</span>
          <span className="text-[var(--site-rust)]">{msg(intl, `home.workbench.${row}.verb`)}</span>
          <span className="text-[var(--site-ink-sec)]">{msg(intl, `home.workbench.${row}.text`)}</span>
        </div>
      ))}
    </div>
  </Card>
);

const OperatingModel = ({ intl }: { intl: IntlShape }) => (
  <SiteSection>
    <SiteContainer>
      <SectionHeader title={msg(intl, 'home.operating.heading')} meta={msg(intl, 'home.operating.meta')} />
      <div className="grid gap-4 xl:grid-cols-[repeat(3,minmax(0,1fr))_24rem]">
        {PRACTICES.map((practice) => (
          <Card key={practice} className="p-6">
            <Tag>{msg(intl, 'home.operating.practice')}</Tag>
            <h3 className="mt-5 text-2xl font-medium tracking-[-0.02em] text-[var(--site-ink)]">{msg(intl, `home.operating.${practice}.title`)}</h3>
            <p className="mt-3 leading-7 text-[var(--site-ink-sec)]">{msg(intl, `home.operating.${practice}.body`)}</p>
            <div className="mt-5 border-t border-dashed border-[var(--site-rule)] pt-4 font-mono text-xs leading-6 text-[var(--site-ink-mute)]">
              {msg(intl, `home.operating.${practice}.measure`)}
            </div>
          </Card>
        ))}
        <WorkbenchCard intl={intl} />
      </div>
    </SiteContainer>
  </SiteSection>
);

const Topics = ({ intl }: { intl: IntlShape }) => (
  <SiteSection>
    <SiteContainer>
      <SectionHeader title={msg(intl, 'home.topics.heading')} meta={msg(intl, 'home.topics.meta')} />
      <div className="grid gap-4 md:grid-cols-2">
        {TOPICS.map((topic) => (
          <Card key={topic} className="p-6">
            <Tag tone={topic === 'aiDelivery' ? 'amber' : 'green'}>{msg(intl, `home.topics.${topic}.status`)}</Tag>
            <h3 className="mt-5 text-2xl font-medium tracking-[-0.02em] text-[var(--site-ink)]">{msg(intl, `home.topics.${topic}.title`)}</h3>
            <p className="mt-3 leading-7 text-[var(--site-ink-sec)]">{msg(intl, `home.topics.${topic}.body`)}</p>
            <p className="mt-5 border-t border-[var(--site-rule)] pt-4 font-mono text-xs text-[var(--site-ink-mute)]">
              {msg(intl, `home.topics.${topic}.count`)}
            </p>
          </Card>
        ))}
      </div>
    </SiteContainer>
  </SiteSection>
);

const EngagementLog = ({ intl, locale, projects }: Pick<LandingPageProps, 'intl' | 'locale' | 'projects'>) => {
  const douglasCase = buildDouglasWorkCase(projects, locale);
  const newestDouglasProjectId = douglasCase.sourceProjectIds.at(-1);
  const engagementProjects = recentProjects(projects)
    .filter((project) => !isDouglasProject(project) || project.id === newestDouglasProjectId)
    .slice(0, 8);

  return (
    <SiteSection>
      <SiteContainer>
        <SectionHeader title={msg(intl, 'home.engagements.heading')} meta={msg(intl, 'home.engagements.meta')} />
        <div className="overflow-hidden rounded-[6px] border border-[var(--site-rule)] bg-[var(--site-panel)]">
          <div className="hidden grid-cols-[8rem_13rem_1fr_12rem] bg-[var(--site-panel-deep)] px-5 py-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[var(--site-ink-mute)] md:grid">
            <span>{msg(intl, 'home.engagements.year')}</span>
            <span>{msg(intl, 'home.engagements.org')}</span>
            <span>{msg(intl, 'home.engagements.context')}</span>
            <span>{msg(intl, 'home.engagements.role')}</span>
          </div>
          {engagementProjects.map((project) => {
            const isDouglas = isDouglasProject(project);
            return (
              <Link key={project.id} href={isDouglas ? '/work#douglas' : '/work'} className="grid gap-1 border-t border-[var(--site-rule)] px-5 py-4 no-underline transition hover:bg-[var(--site-panel-alt)] md:grid-cols-[8rem_13rem_1fr_12rem] md:items-center md:gap-0">
                <span className="font-mono text-xs tracking-[0.04em] text-[var(--site-ink-mute)]">
                  {isDouglas ? formatDateRange(douglasCase.startDate, douglasCase.endDate) : formatYearRange(project)}
                </span>
                <span className="font-mono text-sm font-semibold text-[var(--site-ink)]">{projectName(project, locale)}</span>
                <span className="pr-6 text-sm leading-6 text-[var(--site-ink-sec)]">
                  {isDouglas ? douglasCase.teamContribution[1] : projectSignal(project, locale)}
                </span>
                <span className="font-mono text-xs text-[var(--site-rust)]">{isDouglas ? douglasCase.role : project.title[locale]}</span>
              </Link>
            );
          })}
        </div>
      </SiteContainer>
    </SiteSection>
  );
};

const FitAndContact = ({ intl, locale, socialLinks }: Pick<LandingPageProps, 'intl' | 'locale' | 'socialLinks'>) => (
  <SiteSection border={false} className="bg-[var(--site-panel-deep)] md:py-20">
    <SiteContainer className="grid gap-12 lg:grid-cols-[1fr_24rem]">
      <div>
        <SectionHeader title={msg(intl, 'home.contact.heading')} meta={msg(intl, 'home.contact.meta')} />
        <p className="max-w-4xl text-3xl font-medium leading-tight tracking-[-0.03em] text-[var(--site-ink)] md:text-5xl">
          {msg(intl, 'home.contact.lead')}
        </p>
        <div className="mt-8 grid overflow-hidden rounded-[6px] border border-[var(--site-rule)] bg-[var(--site-panel)] md:grid-cols-2">
          {FIT.map((fit, index) => (
            <div key={fit} className={`p-5 ${index % 2 === 0 ? 'md:border-r md:border-[var(--site-rule)]' : ''} ${index > 1 ? 'border-t border-[var(--site-rule)]' : index > 0 ? 'border-t border-[var(--site-rule)] md:border-t-0' : ''}`}>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[var(--site-ink-mute)]">{msg(intl, `home.fit.${fit}.label`)}</p>
              <p className="mt-2 leading-7 text-[var(--site-ink)]">{msg(intl, `home.fit.${fit}.body`)}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <ButtonLink href="/contact">{msg(intl, 'home.contact.cta')}</ButtonLink>
          <span className="font-mono text-xs leading-6 tracking-[0.04em] text-[var(--site-ink-mute)]">{msg(intl, 'home.contact.note')}</span>
        </div>
      </div>
      <aside className="space-y-4">
        <AvailabilityCard locale={locale} />
        <ProfileCard intl={intl} locale={locale} />
        <div className="flex flex-wrap gap-3">
          {socialLinks.map((profile) => (
            <Link key={profile.href} className="inline-flex h-11 w-11 items-center justify-center rounded-[3px] border border-[var(--site-rule)] bg-[var(--site-panel)] text-[var(--site-ink)] transition hover:border-[var(--site-rust)] hover:text-[var(--site-rust)]" external href={profile.href} ariaLabel={profile.ariaLabel}>
              <span className="sr-only">{profile.label}</span>
              <SocialIcon profile={profile.key} className="h-5 w-5" />
            </Link>
          ))}
        </div>
      </aside>
    </SiteContainer>
  </SiteSection>
);

export const LandingPage = ({ intl, locale, projects, socialLinks }: LandingPageProps) => (
  <SiteShell>
    <Hero intl={intl} locale={locale} />
    <EvidenceStrip intl={intl} locale={locale} projects={projects} />
    <Thesis intl={intl} />
    <Position intl={intl} />
    <OperatingModel intl={intl} />
    <Topics intl={intl} />
    <EngagementLog intl={intl} locale={locale} projects={projects} />
    <FitAndContact intl={intl} locale={locale} socialLinks={socialLinks} />
  </SiteShell>
);
