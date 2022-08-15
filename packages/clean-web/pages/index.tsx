import type { NextPage } from 'next';


const Home: NextPage = () => {
  return (
    <div className="container mx-auto">
      <div>
        <h1 className="text-6xl">
          Let&apos;s build something together!
        </h1>
      </div>

      <h1 className="after:block after:h-10 after:border-l after:border-l-red-900">
        About me
      </h1>

    </div>
  );
};

export default Home;
