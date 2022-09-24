import { NextPage } from 'next';

import { useCreateProjectMutation } from '../../graphql/generated';
import { ProjectForm, ProjectFormData } from '../../features/projects/components/ProjectForm';
const NewProjectPage: NextPage = () => {

  const [createProject] = useCreateProjectMutation();

  const onSubmit = (data: ProjectFormData) => {
    console.log({ data });
    createProject({
      variables: {
        input: data,
       },
    });
  };

  return (
    <main className="container mx-auto max-w-md p-4">
      <h1>New Project</h1>
      <ProjectForm onSubmit={onSubmit} />
    </main>
  );
};

export async function getStaticProps () {
  return { props: {} };
}

export default NewProjectPage;
