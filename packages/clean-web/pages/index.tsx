import clsx from 'clsx';
import type { NextPage } from 'next';


const Home: NextPage = () => {
  return (
    <div className={clsx([
      'h-[calc(100vh-96px)]',
        'bg-gradient-to-b from-slate-900 to-slate-800',
      ])}
    >
      <main className="container mx-auto px-4">
        <section>
          <h1 className="text-4xl">
            Hi, my name is Martin.
            I&apos;m a consultant and cloud developer.
          </h1>
          <h2 className="text-3xl">
            I focus on cloud native development, DevOps and cloud security.
          </h2>
        </section>
        <section>
          <h2 className="text-2xl">
            What I do
          </h2>
        </section>
      </main>
    </div>
  );
};

export default Home;
