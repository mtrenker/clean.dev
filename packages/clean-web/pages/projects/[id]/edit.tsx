import { NextPage } from 'next';
import { useRouter } from 'next/router';

import { ProjectForm, ProjectFormData } from '../../../features/projects/components/ProjectForm';
import { useGetProjectsQuery, useUpdateProjectMutation } from '../../../graphql/generated';

const EditProjectPage: NextPage = () => {
  const [updateProject] = useUpdateProjectMutation();
  const router = useRouter();
  const id = router.query.id as string;
  const { data } = useGetProjectsQuery();
  const project = data?.projects.find((project) => project.id === id);

  const defaultValues: ProjectFormData = {
    project: {
      client: project?.client ?? '',
      position: project?.position ?? '',
      summary: project?.summary ?? '',
      location: project?.location ?? undefined,
      startDate: project?.startDate ?? undefined,
      endDate: project?.endDate ?? undefined,
      featured: project?.featured ?? undefined,
      highlights: project?.highlights?.map((highlight) => ({ text: highlight ?? '' })),
    },
    contact: {
      company: project?.contact?.company ?? undefined,
      firstName: project?.contact?.firstName ?? undefined,
      lastName: project?.contact?.lastName ?? undefined,
      email: project?.contact?.email ?? undefined,
      street: project?.contact?.street ?? undefined,
      city: project?.contact?.city ?? undefined,
      zip: project?.contact?.zip ?? undefined,
      country: project?.contact?.country ?? undefined,
    },
  };

  const onSubmit = (data: ProjectFormData) => {
    updateProject({
      variables: {
        id,
        input: {
          ...data.project,
          highlights: data.project.highlights?.map((highlight) => highlight.text),
          contact: data.contact,
        },
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
