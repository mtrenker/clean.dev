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
      setDefaultValues(() => ({
        client: project.client,
        position: project.position,
        summary: project.summary,
        startDate: project.startDate ?? '',
        endDate: project.endDate ?? '',
        categories: [...project.categories],
        contact: { ...project.contact },
        featured: project.featured,
        highlights: [...project.highlights],
        location: project.location ?? '',
      }));
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
