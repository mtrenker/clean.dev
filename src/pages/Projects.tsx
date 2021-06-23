/* eslint-disable react/jsx-props-no-spreading */
import { VFC } from 'react';
import { css } from '@emotion/react';
import { FormProvider, useForm } from 'react-hook-form';

import { useGetProjectsQuery } from '../graphql/hooks';
import { Form, FormData } from './projects/Form';

const projectsCss = css`
  section {
    background-color: var(--surface3);
  }
`;

export const Projects: VFC = () => {
  const { data } = useGetProjectsQuery({});
  const methods = useForm();
  const { handleSubmit } = methods;

  const onSubmit = (formData: FormData) => {
    console.log(formData);

  }

  return (
    <div css={projectsCss}>
      <h1>Projects</h1>
      <section>
        {data?.getProjects.items.map((project) => (
          <div>
            {project.id}
          </div>
        ))}
      </section>
      <section>
        <FormProvider {...methods}>
          <Form onSubmit={handleSubmit(onSubmit)} />
        </FormProvider>
      </section>
    </div>
  );
};
