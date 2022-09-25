import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { ProjectForm, ProjectFormData } from '../../../features/projects/components/ProjectForm';
import { useGetProjectsQuery, useUpdateProjectMutation } from '../../../graphql/generated';

const EditProjectPage: NextPage = () => {
  const [updateProject] = useUpdateProjectMutation();
  // devaultValues state
  const [defaultValues, setDefaultValues] = useState<ProjectFormData>();
  const router = useRouter();
  const id = router.query.id as string;
  const { data, loading } = useGetProjectsQuery();

  useEffect(() => {
    const project = data?.projects.find((project) => project.id === id);
    if (project) {
      setDefaultValues({
        ...project,
        location: project.location || '',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        highlights: project.highlights.map((highlight) => ({
          description: highlight.description ?? '',
        })),
        categories: project.categories.map((category) => ({
          ...category,
          name: category?.name || '',
          color: category?.color ?? '',
          rate: category?.rate ?? undefined,
        })),
        contact: {
          company: project.contact?.company || '',
          firstName: project.contact?.firstName || '',
          lastName: project.contact?.lastName || '',
          email: project.contact?.email || '',
          street: project.contact?.street || '',
          city: project.contact?.city || '',
          zip: project.contact?.zip || '',
          country: project.contact?.country || '',
        },
      });
    }
  }, [data, id]);

  const onSubmit = (data: ProjectFormData) => {
    updateProject({
      variables: {
        id,
        input: data,
      },
    });
  };

  return (
    <main className="container mx-auto max-w-md p-4">
      <h1>Edit Project</h1>
      {!loading && defaultValues && (
        <ProjectForm defaultValues={defaultValues} onSubmit={onSubmit} />
      )}
    </main>
  );
};

export default EditProjectPage;
