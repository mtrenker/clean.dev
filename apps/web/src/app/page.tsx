import React from 'react'
import Image from 'next/image'
import clsx from 'clsx';
import { projects } from './projects';

const Home: React.FC = () => (
  <main className={clsx([
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
      <figure className={clsx([
        'm-0 text-center',
        'print:flex print:gap-16 print:text-start',
      ])}
      >
        <picture className={clsx([
          'inline-block h-[200px] overflow-hidden rounded-full ring ring-zinc-900 dark:ring-zinc-50',
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
          <h1
            className={clsx([
              'm-0 text-3xl font-semibold uppercase',
            ])}
          >
              Martin Trenker
          </h1>
          <h2 className={clsx([
            'm-0 text-2xl uppercase',
          ])}
          >
              Consultant, Web Developer
          </h2>
        </figcaption>
      </figure>
      <div className={clsx([
        'print:border-l-2 print:border-zinc-900 print:px-6',
      ])}
      >
        <h3 className="uppercase tracking-widest">About me</h3>
        <p className="my-1 font-medium tracking-wide">
            My passion for web development started in the 90s when free web hosting became popular.
            I became active in the community, helping aspiring developers with HTML, CSS, PHP, MySQL, and JS.
        </p>
        <p className="my-1 font-medium tracking-wide">
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
          <h3 className="my-0 uppercase tracking-widest">Contact</h3>
          <ul className="pl-4">
            <li className="my-0">info@clean.dev</li>
            <li className="my-0">https://clean.dev</li>
          </ul>
        </section>

        <section
          className={clsx([
            'prose px-6',
            'print:max-w-none print:flex-1 print:grow-0 print:px-0',
          ])}
        >
          <h3 className="my-0 uppercase tracking-widest">Skills</h3>
          <h4 className="uppercase tracking-widest">Programming</h4>
          <ul className="pl-4">
            <li className="my-0">Clean Code</li>
            <li className="my-0">TypeScript</li>
            <li className="my-0">Serverless</li>
            <li className="my-0">Web Components</li>
            <li className="my-0">REST / GraphQL</li>
          </ul>
          <h4 className="uppercase tracking-widest">Organizational</h4>
          <ul className="pl-4">
            <li className="my-0">Agile Mindset</li>
            <li className="my-0">Quality Management</li>
            <li className="my-0">Transparent Communication</li>
            <li className="my-0">Theory of Constraints</li>
          </ul>
        </section>
      </div>

      <section
        className={clsx([
          'prose px-6',
          'print:max-w-none print:flex-1 print:px-0',
        ])}
      >
        <h4 className="uppercase tracking-widest">
            Clean and Agile
        </h4>
        <p className="tracking-wide">
            I am privileged to have worked with many bright minds over the years and want to share my experience with my clients.
            With a better understanding of quality management, agile best practices, and a human-centric approach,
            we can build better products and create a healthier work environment for everyone.
        </p>
        <h4 className="uppercase tracking-widest">Learner and Mentor</h4>
        <p className="tracking-wide">
            Every project has its unique challenges.
            I love analyzing and understanding them from a cross-functional perspective to expand my horizon and, on the way, pass some of it to aspiring and seasoned developers alike.
        </p>
        <h4 className="uppercase tracking-widest">Automation</h4>
        <p className="tracking-wide">
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
      <h3 className="mt-6 break-before-page uppercase tracking-widest">
          Projects
      </h3>
      {projects.filter(p => p.featured).reverse().map((project) => {
        const startYear = new Date(project.startDate).getFullYear();
        const endYear = new Date(project.endDate).getFullYear();
        return (
          <article className="my-4 flex break-inside-avoid flex-col" key={project.id}>
            <div className="flex items-center justify-between gap-6">
              <h4 className="m-0 flex-initial font-semibold">{project.company ? project.company : project.industry}</h4>
              <hr className="my-0 block h-px w-full flex-1 border-b border-zinc-700 print:border-zinc-900" />
              <time dateTime={`${new Date(project.startDate).getFullYear()}`}>
                {startYear === endYear ? startYear : `${startYear} - ${endYear}`}
              </time>
            </div>
            <h5 className="m-0 font-semibold uppercase tracking-widest">{project.title}</h5>
            <p className="m-0 flex-1 tracking-wide">{project.description}</p>
            <ul className="m-2 pl-4">
              {project.highlights.length > 0 && project.highlights.map((highlight) => (
                <li className="my-0 tracking-wide" key={highlight}>{highlight}</li>
              ))}
            </ul>
            {project.technologies.length > 0 && (
              <>
                <h6 className="font-bold">Technologies</h6>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((technology) => (
                    <span className="rounded-md bg-zinc-900 px-2 py-1 text-sm text-zinc-50 print:px-1" key={technology}>{technology}</span>
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
