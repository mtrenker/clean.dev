import { VFC } from 'react';
import { css } from '@emotion/react';
import { FormProvider, useForm } from 'react-hook-form';

import { Link, useRouteMatch } from 'react-router-dom';
import { useCreateProjectMutation, useGetProjectsQuery } from '../../graphql/hooks';
import { Form, ProjectData } from './Form';

const projectsCss = css`
  section {
    padding: 24px;
    background-color: var(--surface3);
  }
  section:nth-child(2n) {
    background-color: var(--surface2);
  }
`;

export const Projects: VFC = () => {
  const [createProject] = useCreateProjectMutation();
  const { data } = useGetProjectsQuery();
  const methods = useForm();
  const { path } = useRouteMatch();
  const { handleSubmit } = methods;

  const onSubmit = (formData: ProjectData) => {
    createProject({
      variables: {
        input: {
          ...formData,
          methodologies: formData.methodologies.split(','),
          technologies: formData.technologies.split(','),
        },
      },
    });
  };

  return (
    <div css={projectsCss}>
      <h1>Projects</h1>
      <section>
        <h2>Existing Projects</h2>
        <table>
          <thead>
            <tr>
              <td>Client</td>
              <td>Actions</td>
            </tr>
          </thead>
          <tbody>
            {data?.getProjects.items.map((project) => (
              <tr>
                <td>{project.client}</td>
                <td>
                  <Link to={`${path}/${project.id}/tracking`}>Tracking</Link>
                  <Link to={`${path}/${project.id}/timesheet`}>Timesheet</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h2>New Projects</h2>
        <FormProvider {...methods}>
          <Form onSubmit={handleSubmit(onSubmit)} />
        </FormProvider>
      </section>
    </div>
  );
};
