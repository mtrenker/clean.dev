import { NextPage } from 'next';

import 'react-datepicker/dist/react-datepicker.css';
import { useCreateProjectMutation } from '../../graphql/generated';
import { ProjectData, ProjectForm } from '../../features/projects/components/ProjectForm';


const NewProjectPage: NextPage = () => {

  const [createProject] = useCreateProjectMutation();

  const onSubmit = (data: ProjectData) => {
    console.log({ data });
    createProject({
      variables: {
        project: data,
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
