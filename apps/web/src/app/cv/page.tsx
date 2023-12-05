/* eslint-disable -- deploy */
import type { NextPage } from 'next';
import clsx from 'clsx';
import Image from 'next/image';
import { getProjects, getTechnologies } from '../../lib/hygraph/client';
import type { SlateNode} from '../../components/SlateRender';
import { SlateRender } from '../../components/SlateRender';
import { Icon } from './Icon';
import type { GetTechnologiesQuery } from '@/lib/hygraph/generated';

type Technology = GetTechnologiesQuery['technologies'][0];

const sortByProficiency = (a: Technology, b: Technology): number => {
  const order = ['expert', 'advanced', 'intermediate', 'beginner'];
  return order.indexOf(a.proficiency?.toLowerCase() ?? '') - order.indexOf(b.proficiency?.toLowerCase() ?? '');
}

const CVPage: NextPage = async () => {
  const projects = await getProjects();
  const technologies = await getTechnologies();
  return (
    <div className="prose container mx-auto [&_h2]:m-0 [&_h3]:m-0 [&_p]:m-0">
      <section className="flex break-inside-avoid flex-wrap gap-4">
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
                'm-0 text-3xl font-semibold',
              ])}
            >
              Hi, my name is Martin.
            </h1>
            <h2 className={clsx([
              'm-0 text-2xl',
            ])}
            >
              I&apos;m a web development expert based in Munich.
            </h2>
          </figcaption>
        </figure>
        <p>
        As a teenager, I became interested in creating websites and engaging with the developer community. This was during the early stages of the Internet and the Web. In those days, table designs and frames were the norm, and I became an advocate for accessible and semantic markup and CSS.
        </p>
        <p>
        Shortly after successfully finishing my apprenticeship for IT-System-Kaufmann at Deutsche Telekom, I decided to take the leap and start my own consulting business.
        </p>
        <p>
        Since 2008, I have had the pleasure of working with a diverse mix of teams on various products, and I strive to share my insights and experiences with clients and their teams. My goal is to enable developers to create web solutions that are quick to deliver, easy to maintain, and fun to work with.
        </p>
        <article>
          <h3>Clean Code</h3>
          <p>
          Technical debt costs time, money, talent, motivation, and morale. Clean code is the foundation for a maintainable and sustainable codebase, and I can help teams identify the right tools and processes to achieve this.
          </p>
        </article>
        <article>
          <h3>Agile Mindset</h3>
          <p>
          Allowing teams to self-organize and become autonomous is the secret of high performers. With my experience in agile methodologies, I can help teams to overcome obstacles and excel in their work.
          </p>
        </article>
        <article>
          <h3>Automation</h3>
          <p>
          Knowing what and when to automate can sometimes be the difference between success and failure. I have experienced many successes and failures and want to share the lessons with my peers.
          </p>
        </article>
        <article>
          <h3>Coach and Mentor</h3>
          <p>
          There are no shortcuts to experience, but there are ways to accelerate the learning process. I can support teams in adopting a learning culture that allows personal and team growth without sacrificing output.
          </p>
        </article>
      </section>
      <section className="break-inside-avoid break-after-page py-10">
        <h2 className="!mb-5">Methodologies</h2>
        <h3>Scrum / Kanban</h3>
        <p className="!mb-5">
          Having worked with Scrum since 2008, I often filled in for scrum-master or was a valued sparing partner for scrum-masters.
          Optimizing processes and observing the theory of constraints play out in various ways depending on project and team dynamics is something I genuinely enjoy and am eager to continue developing with my clients.
        </p>
        <h2 className="!mb-5">Technologies</h2>
        <div className="flex flex-wrap items-center justify-evenly gap-2">
          {technologies?.sort(sortByProficiency).map((technology) => (
            <div
              className="flex grow items-center gap-2 rounded border border-zinc-900 px-2 py-1 print:p-1"
              key={technology.name}
            >
              <Icon name={technology.iconName!} />
              <div>
                <h4 className="m-0 flex-initial font-semibold">
                  {technology.name}
                </h4>
                <p className="m-0 flex-initial text-sm">
                  {technology.proficiency}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2>Projects</h2>
        {projects?.reverse().map((project) => {
          const overview: SlateNode[] = project.overview?.raw.children ?? [];
          const details: SlateNode[] = project.details?.raw.children ?? [];
          const startYear = new Date(project.startDate as string).getFullYear();
          const endYear = new Date(project.endDate as string).getFullYear();
          return (
            <article
              className={clsx(
                'my-4 flex break-inside-avoid flex-col p-10',
              )}
              key={project.id }
            >
              <h3 className="m-0 flex-initial font-semibold">
                {project.title}
              </h3>
              <div className="flex items-center justify-between gap-6">
                <h4 className="m-0 flex-initial font-semibold">
                  {project.client?.name}
                </h4>
                <hr className="my-0 block h-px w-full flex-1 border-b border-zinc-700 print:border-zinc-900" />
                <time dateTime={`${new Date(project.startDate as string).getFullYear()}`}>
                  {startYear === endYear ? startYear : `${startYear} - ${endYear}`}
                </time>
              </div>
              <h5 className="m-0 font-semibold uppercase tracking-widest">
                {project.role}
              </h5>
              <SlateRender value={overview} />
              <SlateRender value={details} />
              {project.technologies.length > 0 && (
                <>
                  <h6 className="font-bold">Technologies</h6>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((technology) => (
                      <span
                        className={clsx(
                          'flex items-center gap-2',
                          'rounded-md bg-zinc-900 px-2 py-1 text-sm text-zinc-50',
                          'print:px-1 print:text-black'
                        )}
                        key={technology.name}
                      >
                        <Icon name={technology.iconName as string} />
                        {technology.name}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </article>
          );
        })}
      </section>
    </div>
  )
}

export default CVPage;
