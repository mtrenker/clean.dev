import { NextPage } from 'next';
import { useRouter } from 'next/router';

import 'react-datepicker/dist/react-datepicker.css';
import { useGetProjectsQuery } from '../../../graphql/generated';

const ProjectDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data } = useGetProjectsQuery();
  const project = data?.projects.find(project => project.id === id);

  return (
    <main className="container mx-auto">
      detail:
      {' '}
      {project?.client}
    </main>
  );
};

export default ProjectDetailPage;
