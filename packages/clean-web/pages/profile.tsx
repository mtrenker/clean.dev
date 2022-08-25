import clsx from 'clsx';
import { NextPage } from 'next';
import { projects } from '../data/projects';

export const Profile: NextPage = () => {
  return (
    <main className="container mx-auto flex flex-col items-center gap-5">
      <section className="prose dark:prose-invert px-6">
        <h1
          className={clsx([
            'text-center text-2xl font-semibold',
          ])}
        >
          Who I am
        </h1>
        <p>
          My passion for coding began in the early 90s while playing Street Fighter 2 and realizing I could create something similar.
        </p>
        <p>
          During my teenage years, I became active in the web-development community, helping people with HTML, CSS, Javascript, PHP, and MySQL-related questions on IRC.
        </p>
        <p>
          After completing my apprenticeship as an IT systems sales professional, I took an opportunity in 2008 and became a full-time self-employed web developer.
        </p>
      </section>
      <section className="prose dark:prose-invert px-6">
        <h2
          className={clsx([
            'text-center text-2xl font-semibold',
          ])}
        >
          What I do
        </h2>
        <p>
          Solving problems for the user and creating maintainable developer experiences are at the core of my work. To achieve this, I use a holistic approach built on these three pillars:
        </p>
        <h3>Coaching</h3>
        <p>
          As a consultant, I am fortunate to experience dozens of projects, teams, processes, and successes/failures. Sharing this information and helping teams understand the &ldquo;why&rdquo; behind all the buzzwords has become one of my primary goals when consulting. Knowledge!
        </p>
        <h3>Automating</h3>
        <p>
          Way too many teams still rely on manual tasks like testing or deploying. As an automation nerd, I can help identify and implement automation of repetitive tasks that waste time and energy teams could use for new features instead.
        </p>
        <h3>Identifying and eliminating constraints</h3>
        <p>
          Nothing kills more productivity than untreated or invisible constraints. Continuously improving the process by eliminating bottlenecks is key to becoming a top performer and improving the overall quality of a project.
        </p>
      </section>
      <section className="prose dark:prose-invert px-6">
        <h2
          className={clsx([
            'text-center text-2xl font-semibold',
          ])}
        >
          Projects
        </h2>
        {projects.filter(p => p.featured).reverse().map((project) => (
          <article className="flex flex-col" key={project.id}>
            <h3 className="m-0">{project.title}</h3>
            <div className="flex items-center justify-between">
              <h4 className="m-0">{project.company ? project.company : project.industry}</h4>
              <time dateTime={project.startDate}>
                {project.startDate}
                -
                {project.endDate}
              </time>
            </div>
            <p className="flex-1">{project.description}</p>
            <ul>
              {project.highlights.length > 0 && project.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
};

export default Profile;
