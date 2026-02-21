import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { projects } from '../projects';

const Home: React.FC = () => (
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
            alt="Profile picture of Martin Trenker, consultant and web developer"
            className="m-0"
            height={200}
            src="/me.png"
            unoptimized
            width={200}
          />
        </picture>
        <figcaption className="flex flex-col gap-4">
          <h1 className={clsx(['m-0 font-serif text-3xl font-bold uppercase tracking-tight text-foreground'])}>
            Martin Trenker
          </h1>
          <h2 className={clsx(['m-0 text-label text-2xl text-muted-foreground'])}>
            Consultant, Web Developer
          </h2>
        </figcaption>
      </figure>
      <div
        className={clsx([
          'print:border-l-2 print:border-foreground print:px-6',
        ])}
      >
        <h3 className="text-label text-foreground">About me</h3>
        <p className="my-1 font-medium tracking-wide text-muted-foreground">
          My passion for web development started in the 90s when free web hosting became popular.
          I became active in the community, helping aspiring developers with HTML, CSS, PHP, MySQL, and JS.
        </p>
        <p className="my-1 font-medium tracking-wide text-muted-foreground">
          Today, I love building things in the cloud and creating user-oriented,
          interactive experiences while spreading awareness for clean code and authentic agile practices.
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
          <h3 className="text-label my-0 text-foreground">Contact</h3>
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
          <h3 className="text-label my-0 text-foreground">Skills</h3>
          <h4 className="text-label text-sm text-foreground">Programming</h4>
          <ul className="pl-4">
            <li className="my-0 text-muted-foreground">Clean Code</li>
            <li className="my-0 text-muted-foreground">TypeScript</li>
            <li className="my-0 text-muted-foreground">Serverless</li>
            <li className="my-0 text-muted-foreground">Web Components</li>
            <li className="my-0 text-muted-foreground">REST / GraphQL</li>
          </ul>
          <h4 className="text-label text-sm text-foreground">Organizational</h4>
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
        <h4 className="text-label text-foreground">Clean and Agile</h4>
        <p className="tracking-wide text-muted-foreground">
          I am privileged to have worked with many bright minds over the years and want to share my experience with my clients.
          With a better understanding of quality management, agile best practices, and a human-centric approach,
          we can build better products and create a healthier work environment for everyone.
        </p>
        <h4 className="text-label text-foreground">Learner and Mentor</h4>
        <p className="tracking-wide text-muted-foreground">
          Every project has its unique challenges.
          I love analyzing and understanding them from a cross-functional perspective to expand my horizon and, on the way, pass some of it to aspiring and seasoned developers alike.
        </p>
        <h4 className="text-label text-foreground">Automation</h4>
        <p className="tracking-wide text-muted-foreground">
          As an automation nerd, I can help identify and implement automation of repetitive tasks that waste time and energy teams could use for new features instead.
        </p>
      </section>
    </div>

    <section
      className={clsx([
        'prose px-6',
        'print:max-w-none print:px-0',
      ])}
    >
      <h3 className="text-label mt-6 break-before-page text-foreground">Projects</h3>
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
                  {project.company ? project.company : project.industry?.en}
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
                {project.title.en}
              </h5>
              <p className="m-0 flex-1 tracking-wide text-muted-foreground">
                {project.description.en}
              </p>
              <ul className="m-2 pl-4">
                {project.highlights.en.length > 0 &&
                  project.highlights.en.map((highlight) => (
                    <li className="my-0 tracking-wide text-muted-foreground" key={highlight}>
                      {highlight}
                    </li>
                  ))}
              </ul>
              {project.technologies.length > 0 && (
                <>
                  <h6 className="font-bold text-foreground">Technologies</h6>
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

export default Home;
