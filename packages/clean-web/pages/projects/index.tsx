import { NextPage } from 'next';
import Link from 'next/link';

import { Button } from '../../common/components/Button';
import { useGetProjectsQuery, useRemoveProjectMutation } from '../../graphql/generated';
import { IconTrash } from '@tabler/icons';

const ProjectsPage: NextPage = () => {
  const { data } = useGetProjectsQuery();
  const [removeProject] = useRemoveProjectMutation();
  return (
    <main className="container mx-auto">
      <h1 className="text-3xl font-semibold uppercase">Projects</h1>
      <div className="my-2 flex justify-end p-2">
        <Link href="/projects/new" passHref>
          <Button>New Project</Button>
        </Link>
      </div>
      <div className="flex flex-wrap gap-4 justify-between">
        {data?.projects.map((project) => (
          <div className="flex-initial w-64 p-4 rounded border border-stone-300" key={project.id}>
            <h3><Link href={`projects/${project.id}`}>{project.client}</Link></h3>
            <h4>{project.position}</h4>
          </div>
        ))}
      </div>
    </main>
  );
};

export async function getStaticProps () {
  return { props: {} };
}

export default ProjectsPage;
