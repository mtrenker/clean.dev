import { NextPage } from 'next';
import clsx from 'clsx';
import Link from 'next/link';

import { Button } from '../../common/components/Button';

const ProjectsPage: NextPage = () => (
  <main className={clsx([
    'container mx-auto max-w-md p-4',
  ])}
  >
    <h1 className="text-3xl font-semibold uppercase">Projects</h1>
    <div className="my-2 flex justify-end p-2">
      <Link href="/projects/new" passHref>
        <Button>New Project</Button>
      </Link>
    </div>
    <table>
      <thead>
        <tr>
          <th>Project</th>
          <th>Actions</th>
        </tr>
      </thead>
    </table>
  </main>
);

export default ProjectsPage;
