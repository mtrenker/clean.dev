import { NextPage } from 'next';
import { ProjectData, ProjectForm } from '../../../features/projects/components/ProjectForm';
import { useGetProjectsQuery, useUpdateProjectMutation } from '../../../graphql/generated';

import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from 'next/router';


const EditProjectPage: NextPage = () => {
  const [updateProject] = useUpdateProjectMutation();
  const router = useRouter();
  const id = router.query.id as string;
  const { data } = useGetProjectsQuery();
  const project = data?.projects.find((project) => project.id === id);

  const defaultValues: ProjectData = {
    client: project?.client || '',
    position: project?.position || '',
    summary: project?.summary || '',
    location: project?.location || '',
    startDate: project?.startDate || '',
    endDate: project?.endDate || '',
    highlights: project?.highlights || [],
    featured: project?.featured || false,
  };


  const onSubmit = (data: ProjectData) => {
    console.log({ data });
    updateProject({
      variables: {
        id,
        project: data,
      },
    });
  };

  return (
    <main className="container mx-auto max-w-md p-4">
      <h1>Edit Project</h1>
      <ProjectForm defaultValues={defaultValues} onSubmit={onSubmit} />
    </main>
  );
};

export default EditProjectPage;
