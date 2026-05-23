import Image from 'next/image';
import type { IntlShape } from 'react-intl';
import { ButtonLink, Card, Eyebrow, PageHero, SectionHeader, SiteContainer, SiteSection, SiteShell, StatStrip, Tag } from '@/components/site/public-design';
import { SocialIcon } from '@/components/ui';
import { Link } from '@/components/ui/link';
import type { Project } from '@/app/projects';
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
const formatYearRange = (project: Project) => {
  const startYear = getYear(project.startDate);
  const endYear = getYear(project.endDate);
  return startYear === endYear ? `${startYear}` : `${startYear}-${String(endYear).slice(2)}`;
};
const projectName = (project: Project, locale: Locale) => project.company ?? project.industry?.[locale] ?? project.id;
const recentProjects = (projects: Project[]) =>
  projects
    .filter((project): project is EngagementProject => Boolean(project.company) && Boolean(project.featured))
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .slice(0, 8);
const projectSignal = (project: Project, locale: Locale) => project.highlights[locale][0] ?? project.description[locale];

const ProfileCard = ({ intl }: { intl: IntlShape }) => (
  <Card className="p-5">
    <div className="flex gap-4">
      <Image src="/me.png" alt={msg(intl, 'work.img.alt')} width={92} height={92} className="h-20 w-20 rounded-[4px] border border-[#2c2924] object-cover grayscale-[10%] md:h-[92px] md:w-[92px]" priority />
      <div>
        <p className="text-lg font-semibold tracking-[-0.01em] text-[#ede7d4]">Martin Trenker</p>
        <p className="mt-1 font-mono text-[0.7rem] leading-6 tracking-[0.04em] text-[#8a8474]">
          {msg(intl, 'home.profileCard.meta1')}<br />
          {msg(intl, 'home.profileCard.meta2')}<br />
          <span className="text-[#c4bda9]">{msg(intl, 'home.profileCard.meta3')}</span>
        </p>
      </div>
    </div>
    <p className="mt-4 border-t border-dashed border-[#2c2924] pt-4 font-mono text-xs leading-6 text-[#c4bda9]">
      {msg(intl, 'home.profileCard.note')}
    </p>
  </Card>
);

const AvailabilityCard = ({ intl }: { intl: IntlShape }) => (
  <Card className="border-l-4 border-l-[#d96e3f] p-5">
    <div className="mb-4 flex items-center justify-between border-b border-[#2c2924] pb-3">
      <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#8a8474]">{msg(intl, 'home.availability.label')}</span>
      <Tag tone="amber">{msg(intl, 'home.availability.status')}</Tag>
    </div>
    <div className="grid grid-cols-2 gap-5">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[#8a8474]">{msg(intl, 'home.availability.now.label')}</p>
        <p className="mt-1 text-2xl font-medium tracking-[-0.02em] text-[#ede7d4]">{msg(intl, 'home.availability.now.value')}</p>
      </div>
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[#8a8474]">{msg(intl, 'home.availability.next.label')}</p>
        <p className="mt-1 text-2xl font-medium tracking-[-0.02em] text-[#7eaf6a]">{msg(intl, 'home.availability.next.value')}</p>
      </div>
    </div>
  </Card>
);

const Hero = ({ intl }: { intl: IntlShape }) => (
  <PageHero
    eyebrow={msg(intl, 'home.hero.label')}
    title={<>{msg(intl, 'home.hero.h1.part1')}<br /><span className="text-[#8a8474]">{msg(intl, 'home.hero.h1.part2')}</span><br /><span className="text-[#8a8474]">{msg(intl, 'home.hero.h1.part3')}</span></>}
    lead={msg(intl, 'home.hero.lead')}
    aside={<><ProfileCard intl={intl} /><AvailabilityCard intl={intl} /></>}
  />
);

const Thesis = ({ intl }: { intl: IntlShape }) => (
  <SiteSection>
    <SiteContainer>
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <Eyebrow tone="amber">{msg(intl, 'home.hero.thesis.label')}</Eyebrow>
        <p className="text-2xl font-medium leading-10 tracking-[-0.02em] text-[#ede7d4] md:text-4xl md:leading-tight">
          {msg(intl, 'home.hero.thesis.body')}
        </p>
      </div>
      <div className="mt-9 flex flex-wrap gap-3">
        <ButtonLink href="/contact">{msg(intl, 'home.hero.cta.contact')}</ButtonLink>
        <ButtonLink href="/work" variant="secondary">{msg(intl, 'home.hero.cta.portfolio')}</ButtonLink>
        <ButtonLink href="/blog" variant="secondary">{msg(intl, 'home.hero.cta.writing')}</ButtonLink>
      </div>
    </SiteContainer>
  </SiteSection>
);

const Position = ({ intl }: { intl: IntlShape }) => (
  <SiteSection>
    <SiteContainer>
      <SectionHeader title={msg(intl, 'home.position.heading')} meta={msg(intl, 'home.position.meta')} />
      <div className="grid overflow-hidden rounded-[6px] border border-[#2c2924] bg-[#1c1a16] lg:grid-cols-2">
        <div className="p-6 md:p-8 lg:border-r lg:border-[#2c2924]">
          <Tag tone="green">{msg(intl, 'home.position.is.label')}</Tag>
          <ul className="mt-5 divide-y divide-[#2c2924]">
            {['1', '2', '3', '4'].map((item) => (
              <li key={item} className="flex gap-4 py-3 text-lg text-[#ede7d4]"><span className="font-mono text-[#7eaf6a]">+</span>{msg(intl, `home.position.is.${item}`)}</li>
            ))}
          </ul>
        </div>
        <div className="bg-[#221f1a] p-6 md:p-8">
          <Tag tone="rust">{msg(intl, 'home.position.not.label')}</Tag>
          <ul className="mt-5 divide-y divide-[#2c2924]">
            {['1', '2', '3', '4'].map((item) => (
              <li key={item} className="flex gap-4 py-3 text-lg text-[#8a8474]"><span className="font-mono text-[#d96e3f]">-</span>{msg(intl, `home.position.not.${item}`)}</li>
            ))}
          </ul>
        </div>
      </div>
    </SiteContainer>
  </SiteSection>
);

const WorkbenchCard = ({ intl }: { intl: IntlShape }) => (
  <Card className="p-5">
    <div className="mb-4 flex items-center justify-between border-b border-[#2c2924] pb-3">
      <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#8a8474]">{msg(intl, 'home.workbench.label')}</span>
      <Tag tone="amber">{msg(intl, 'home.workbench.status')}</Tag>
    </div>
    <div className="space-y-2 font-mono text-xs leading-6">
      {WORKBENCH_ROWS.map((row) => (
        <div key={row} className="grid grid-cols-[4.5rem_5rem_1fr] gap-2">
          <span className="text-[#5a564b]">{msg(intl, `home.workbench.${row}.time`)}</span>
          <span className="text-[#d96e3f]">{msg(intl, `home.workbench.${row}.verb`)}</span>
          <span className="text-[#c4bda9]">{msg(intl, `home.workbench.${row}.text`)}</span>
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
            <h3 className="mt-5 text-2xl font-medium tracking-[-0.02em] text-[#ede7d4]">{msg(intl, `home.operating.${practice}.title`)}</h3>
            <p className="mt-3 leading-7 text-[#c4bda9]">{msg(intl, `home.operating.${practice}.body`)}</p>
            <div className="mt-5 border-t border-dashed border-[#2c2924] pt-4 font-mono text-xs leading-6 text-[#8a8474]">
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
          <Link key={topic} href="/blog" className="group rounded-[6px] border border-[#2c2924] bg-[#1c1a16] p-6 no-underline transition hover:border-[#d96e3f]">
            <Tag tone={topic === 'aiDelivery' ? 'amber' : 'green'}>{msg(intl, `home.topics.${topic}.status`)}</Tag>
            <h3 className="mt-5 text-2xl font-medium tracking-[-0.02em] text-[#ede7d4] group-hover:text-[#d96e3f]">{msg(intl, `home.topics.${topic}.title`)}</h3>
            <p className="mt-3 leading-7 text-[#c4bda9]">{msg(intl, `home.topics.${topic}.body`)}</p>
            <div className="mt-5 flex justify-between border-t border-[#2c2924] pt-4 font-mono text-xs text-[#8a8474]">
              <span>{msg(intl, `home.topics.${topic}.count`)}</span>
              <span className="font-semibold text-[#ede7d4]">{msg(intl, 'home.topics.read')}</span>
            </div>
          </Link>
        ))}
      </div>
    </SiteContainer>
  </SiteSection>
);

const EngagementLog = ({ intl, locale, projects }: Pick<LandingPageProps, 'intl' | 'locale' | 'projects'>) => {
  const engagementProjects = recentProjects(projects);
  return (
    <SiteSection>
      <SiteContainer>
        <SectionHeader title={msg(intl, 'home.engagements.heading')} meta={msg(intl, 'home.engagements.meta')} />
        <div className="overflow-hidden rounded-[6px] border border-[#2c2924] bg-[#1c1a16]">
          <div className="hidden grid-cols-[8rem_13rem_1fr_12rem] bg-[#0e0d0a] px-5 py-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[#8a8474] md:grid">
            <span>{msg(intl, 'home.engagements.year')}</span>
            <span>{msg(intl, 'home.engagements.org')}</span>
            <span>{msg(intl, 'home.engagements.context')}</span>
            <span>{msg(intl, 'home.engagements.role')}</span>
          </div>
          {engagementProjects.map((project) => (
            <Link key={project.id} href="/work" className="grid gap-1 border-t border-[#2c2924] px-5 py-4 no-underline transition hover:bg-[#221f1a] md:grid-cols-[8rem_13rem_1fr_12rem] md:items-center md:gap-0">
              <span className="font-mono text-xs tracking-[0.04em] text-[#8a8474]">{formatYearRange(project)}</span>
              <span className="font-mono text-sm font-semibold text-[#ede7d4]">{projectName(project, locale)}</span>
              <span className="pr-6 text-sm leading-6 text-[#c4bda9]">{projectSignal(project, locale)}</span>
              <span className="font-mono text-xs text-[#d96e3f]">{project.title[locale]}</span>
            </Link>
          ))}
        </div>
      </SiteContainer>
    </SiteSection>
  );
};

const FitAndContact = ({ intl, socialLinks }: Pick<LandingPageProps, 'intl' | 'socialLinks'>) => (
  <SiteSection border={false} className="bg-[#0e0d0a] md:py-20">
    <SiteContainer className="grid gap-12 lg:grid-cols-[1fr_24rem]">
      <div>
        <SectionHeader title={msg(intl, 'home.contact.heading')} meta={msg(intl, 'home.contact.meta')} />
        <p className="max-w-4xl text-3xl font-medium leading-tight tracking-[-0.03em] text-[#ede7d4] md:text-5xl">
          {msg(intl, 'home.contact.lead')}
        </p>
        <div className="mt-8 grid overflow-hidden rounded-[6px] border border-[#2c2924] bg-[#1c1a16] md:grid-cols-2">
          {FIT.map((fit, index) => (
            <div key={fit} className={`p-5 ${index % 2 === 0 ? 'md:border-r md:border-[#2c2924]' : ''} ${index > 1 ? 'border-t border-[#2c2924]' : index > 0 ? 'border-t border-[#2c2924] md:border-t-0' : ''}`}>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[#8a8474]">{msg(intl, `home.fit.${fit}.label`)}</p>
              <p className="mt-2 leading-7 text-[#ede7d4]">{msg(intl, `home.fit.${fit}.body`)}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <ButtonLink href="/contact">{msg(intl, 'home.contact.cta')}</ButtonLink>
          <span className="font-mono text-xs leading-6 tracking-[0.04em] text-[#8a8474]">{msg(intl, 'home.contact.note')}</span>
        </div>
      </div>
      <aside className="space-y-4">
        <AvailabilityCard intl={intl} />
        <ProfileCard intl={intl} />
        <div className="flex flex-wrap gap-3">
          {socialLinks.map((profile) => (
            <Link key={profile.href} className="inline-flex h-11 w-11 items-center justify-center rounded-[3px] border border-[#2c2924] bg-[#1c1a16] text-[#ede7d4] transition hover:border-[#d96e3f] hover:text-[#d96e3f]" external href={profile.href} ariaLabel={profile.ariaLabel}>
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
    <Hero intl={intl} />
    <Thesis intl={intl} />
    <StatStrip stats={[
      { value: '20+', label: msg(intl, 'home.stats.years.label') },
      { value: String(projects.length), label: msg(intl, 'home.stats.engagements.label') },
      { value: String(new Set(projects.map((project) => projectName(project, locale))).size), label: msg(intl, 'home.stats.companies.label') },
      { value: String(Math.min(...projects.map((project) => getYear(project.startDate)))), label: msg(intl, 'work.stats.since.label') },
    ]} />
    <Position intl={intl} />
    <OperatingModel intl={intl} />
    <Topics intl={intl} />
    <EngagementLog intl={intl} locale={locale} projects={projects} />
    <FitAndContact intl={intl} socialLinks={socialLinks} />
  </SiteShell>
);
