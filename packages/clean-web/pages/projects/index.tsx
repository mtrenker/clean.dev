import { NextPage } from 'next';
import Link from 'next/link';

import { Button } from '../../common/components/Button';
import { useGetProjectsQuery } from '../../graphql/generated';

const ProjectsPage: NextPage = () => {
  const { data } = useGetProjectsQuery();
  return (
    <main className="container mx-auto">
      <h1 className="text-3xl font-semibold uppercase">Projects</h1>
      <div className="my-2 flex justify-end p-2">
        <Link href="/projects/new" passHref>
          <Button>New Project</Button>
        </Link>
      </div>
      <div className="flex flex-wrap justify-between gap-4">
        {data?.projects.map((project) => (
          <Link href={`projects/${project.id}`} key={project.id}>
            <div className="w-64 flex-initial cursor-pointer rounded border border-stone-300 p-4">
              <h3>{project.client}</h3>
              <h4>{project.position}</h4>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
};

export async function getStaticProps () {
  return { props: {} };
}

export default ProjectsPage;
