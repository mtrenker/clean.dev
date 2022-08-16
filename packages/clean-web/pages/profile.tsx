import clsx from 'clsx';
import { NextPage } from 'next';
import Image from 'next/image';

export const Profile: NextPage = () => (
  <>
    <section>
      <div className="prose dark:prose-invert container mx-auto">
        <h1
          className={clsx([
          'text-center text-2xl font-semibold text-green-700',
          'after:mx-auto after:block after:h-10 after:w-min',
          'after:border-l-2 after:border-l-green-900',
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
        <div className="mx-auto flex max-w-max">
          <div className="w-96 text-center">
            <Image alt="Dummy" height="288" src="/dummy.jpg" width="192" />
          </div>
          <div className="flex w-96 flex-col">
            I&apos;m a passionate web engineer with over 15 years of experience in various
            industries. Over those years, I specialized on:
            <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-1">
              <div className="border-l bg-slate-700 pl-1">
                Developer Experience
              </div>
              <div className="border-l bg-slate-700 pl-1">
                Automation
              </div>
              <div className="border-l bg-slate-700 pl-1">
                Agility
              </div>
              <div className="border-l bg-slate-700 pl-1">
                Serverless
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section>
      <div className="prose dark:prose-invert container mx-auto">
        <h2
          className={clsx([
          'text-center text-2xl font-semibold text-green-700',
          'before:mx-auto before:block before:h-10 before:w-min',
          'before:border-l-2 before:border-l-green-900',
          'after:mx-auto after:block after:h-10 after:w-min',
          'after:border-l-2 after:border-l-green-900',
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
      </div>
    </section>
  </>
);

export default Profile;
