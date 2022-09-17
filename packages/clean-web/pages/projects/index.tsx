import { NextPage } from 'next';
import clsx from 'clsx';
import Link from 'next/link';

import { Button } from '../../common/components/Button';
import { useGetProjectsQuery, useRemoveProjectMutation } from '../../graphql/generated';
import { IconTrash } from '@tabler/icons';

const ProjectsPage: NextPage = () => {
  const { data } = useGetProjectsQuery();
  const [removeProject] = useRemoveProjectMutation();
  return (
    <main className={clsx([
      'container mx-auto',
    ])}
    >
      <h1 className="text-3xl font-semibold uppercase">Projects</h1>
      <div className="my-2 flex justify-end p-2">
        <Link href="/projects/new" passHref>
          <Button>New Project</Button>
        </Link>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th>Project</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.projects.map(project => (
            <tr key={project.id}>
              <td>
                <Link href={`/projects/${project.id}`} passHref>
                  <a className="text-blue-500">{project.client}</a>
                </Link>
              </td>
              <td className="w-40">
                <div className="flex w-full justify-end gap-4">
                  <Link href={`/projects/${project.id}/edit`} passHref>
                    <a className="text-blue-500">edit</a>
                  </Link>
                  <Button onClick={() => removeProject({ variables: { id: project.id } })}>
                    <IconTrash />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
};

export async function getStaticProps () {
  return { props: {} };
}

export default ProjectsPage;
