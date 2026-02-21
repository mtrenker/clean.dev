import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { headers, cookies } from 'next/headers';
import { createIntl } from 'react-intl';
import { projects } from '../projects';
import { getLocale, loadMessages, type Locale } from '@/lib/locale';

const Home: React.FC = async () => {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);
  const intl = createIntl({ locale, messages });
  const lang = locale as Locale;

  return (
    <main
    className={clsx([
      'mx-auto flex flex-col items-center gap-5',
      'print:mx-14 print:items-start',
    ])}
  >
    <section
      className={clsx([
        'prose flex-1 px-6',
        'w-full print:max-w-none print:px-0',
      ])}
    >
      <figure
        className={clsx([
          'm-0 text-center',
          'print:flex print:gap-16 print:text-start',
        ])}
      >
        <picture
          className={clsx([
            'inline-block h-[200px] overflow-hidden rounded-full ring-2 ring-border',
            'print:h-auto print:rounded-none print:ring-0',
          ])}
        >
          <Image
            alt={intl.formatMessage({ id: 'me.img.alt' })}
            className="m-0"
            height={200}
            src="/me.png"
            unoptimized
            width={200}
          />
        </picture>
        <figcaption className="flex flex-col gap-4">
          <h1 className={clsx(['m-0 font-serif text-3xl font-bold uppercase tracking-tight text-foreground'])}>
            {intl.formatMessage({ id: 'me.title' })}
          </h1>
          <h2 className={clsx(['m-0 text-label text-2xl text-muted-foreground'])}>
            {intl.formatMessage({ id: 'me.subtitle' })}
          </h2>
        </figcaption>
      </figure>
      <div
        className={clsx([
          'print:border-l-2 print:border-foreground print:px-6',
        ])}
      >
        <h3 className="text-label text-foreground">{intl.formatMessage({ id: 'me.about.heading' })}</h3>
        <p className="my-1 font-medium tracking-wide text-muted-foreground">
          {intl.formatMessage({ id: 'me.about.p1' })}
        </p>
        <p className="my-1 font-medium tracking-wide text-muted-foreground">
          {intl.formatMessage({ id: 'me.about.p2' })}
        </p>
      </div>
    </section>

    <div className="print:flex print:gap-5">
      <div className="hidden print:flex print:flex-col print:justify-between print:gap-5">
        <section
          className={clsx([
            'prose px-6',
            'print:max-w-none print:flex-1 print:grow-0 print:px-0',
          ])}
        >
          <h3 className="text-label my-0 text-foreground">{intl.formatMessage({ id: 'me.contact.heading' })}</h3>
          <ul className="pl-4">
            <li className="my-0 text-muted-foreground">info@clean.dev</li>
            <li className="my-0 text-muted-foreground">https://clean.dev</li>
          </ul>
        </section>

        <section
          className={clsx([
            'prose px-6',
            'print:max-w-none print:flex-1 print:grow-0 print:px-0',
          ])}
        >
          <h3 className="text-label my-0 text-foreground">{intl.formatMessage({ id: 'me.skills.heading' })}</h3>
          <h4 className="text-label text-sm text-foreground">{intl.formatMessage({ id: 'me.skills.programming.heading' })}</h4>
          <ul className="pl-4">
            <li className="my-0 text-muted-foreground">Clean Code</li>
            <li className="my-0 text-muted-foreground">TypeScript</li>
            <li className="my-0 text-muted-foreground">Serverless</li>
            <li className="my-0 text-muted-foreground">Web Components</li>
            <li className="my-0 text-muted-foreground">REST / GraphQL</li>
          </ul>
          <h4 className="text-label text-sm text-foreground">{intl.formatMessage({ id: 'me.skills.org.heading' })}</h4>
          <ul className="pl-4">
            <li className="my-0 text-muted-foreground">Agile Mindset</li>
            <li className="my-0 text-muted-foreground">Quality Management</li>
            <li className="my-0 text-muted-foreground">Transparent Communication</li>
            <li className="my-0 text-muted-foreground">Theory of Constraints</li>
          </ul>
        </section>
      </div>

      <section
        className={clsx([
          'prose px-6',
          'print:max-w-none print:flex-1 print:px-0',
        ])}
      >
        <h4 className="text-label text-foreground">{intl.formatMessage({ id: 'me.section.cleanAgile.heading' })}</h4>
        <p className="tracking-wide text-muted-foreground">
          {intl.formatMessage({ id: 'me.section.cleanAgile.p' })}
        </p>
        <h4 className="text-label text-foreground">{intl.formatMessage({ id: 'me.section.learner.heading' })}</h4>
        <p className="tracking-wide text-muted-foreground">
          {intl.formatMessage({ id: 'me.section.learner.p' })}
        </p>
        <h4 className="text-label text-foreground">{intl.formatMessage({ id: 'me.section.automation.heading' })}</h4>
        <p className="tracking-wide text-muted-foreground">
          {intl.formatMessage({ id: 'me.section.automation.p' })}
        </p>
      </section>
    </div>

    <section
      className={clsx([
        'prose px-6',
        'print:max-w-none print:px-0',
      ])}
    >
      <h3 className="text-label mt-6 break-before-page text-foreground">{intl.formatMessage({ id: 'me.projects.heading' })}</h3>
      {projects
        .filter((p) => p.featured)
        .reverse()
        .map((project) => {
          const startYear = new Date(project.startDate).getFullYear();
          const endYear = new Date(project.endDate).getFullYear();
          return (
            <article className="my-4 flex break-inside-avoid flex-col" key={project.id}>
              <div className="flex items-center justify-between gap-6">
                <h4 className="m-0 flex-initial font-serif font-semibold text-foreground">
                  {project.company ? project.company : project.industry?.[lang]}
                </h4>
                <hr className="my-0 block h-px w-full flex-1 border-b border-muted print:border-foreground" />
                <time
                  className="text-muted-foreground"
                  dateTime={`${new Date(project.startDate).getFullYear()}`}
                >
                  {startYear === endYear ? startYear : `${startYear} - ${endYear}`}
                </time>
              </div>
              <h5 className="text-label m-0 text-foreground">
                {project.title[lang]}
              </h5>
              <p className="m-0 flex-1 tracking-wide text-muted-foreground">
                {project.description[lang]}
              </p>
              <ul className="m-2 pl-4">
                {project.highlights[lang].length > 0 &&
                  project.highlights[lang].map((highlight) => (
                    <li className="my-0 tracking-wide text-muted-foreground" key={highlight}>
                      {highlight}
                    </li>
                  ))}
              </ul>
              {project.technologies.length > 0 && (
                <>
                  <h6 className="font-bold text-foreground">{intl.formatMessage({ id: 'me.projects.technologies' })}</h6>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((technology) => (
                      <span
                        className="rounded-md bg-foreground px-2 py-1 text-sm text-background print:px-1"
                        key={technology}
                      >
                        {technology}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </article>
          );
        })}
    </section>
  </main>
  );
};

export default Home;
