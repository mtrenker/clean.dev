import { NextPage } from 'next';
import { ProjectData, ProjectForm } from '../../../features/projects/components/ProjectForm';
import { useCreateProjectMutation } from '../../../graphql/generated';

import 'react-datepicker/dist/react-datepicker.css';


const EditProjectPage: NextPage = () => {

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
      <h1>Edit Project</h1>
      <ProjectForm onSubmit={onSubmit} />
    </main>
  );
};

export default EditProjectPage;
