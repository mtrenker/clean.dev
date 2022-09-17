import { NextPage } from 'next';
import { ProjectForm, ProjectFormData } from '../../../features/projects/components/ProjectForm';
import { useGetProjectsQuery, useUpdateProjectMutation } from '../../../graphql/generated';

import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from 'next/router';


const EditProjectPage: NextPage = () => {
  const [updateProject] = useUpdateProjectMutation();
  const router = useRouter();
  const id = router.query.id as string;
  const { data } = useGetProjectsQuery();
  const project = data?.projects.find((project) => project.id === id);

  const defaultValues: ProjectFormData = {
    project: {
      client: project?.client || '',
      position: project?.position || '',
      summary: project?.summary || '',
      location: project?.location || '',
      startDate: project?.startDate || '',
      endDate: project?.endDate || '',
      featured: project?.featured || false,
    },
    contact: {
      company: project?.contact?.company || '',
      firstName: project?.contact?.firstName || '',
      lastName: project?.contact?.lastName || '',
      email: project?.contact?.email || '',
      street: project?.contact?.street || '',
      city: project?.contact?.city || '',
      zip: project?.contact?.zip || '',
      country: project?.contact?.country || '',
    },
  };


  const onSubmit = (data: ProjectFormData) => {
    updateProject({
      variables: {
        id,
        ...data,
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
