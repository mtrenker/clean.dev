import React, { FC } from 'react';
import { css } from '@emotion/core';
import { useForm } from 'react-hook-form';

import { Input } from '../../components/form/Input';
import { DatePicker } from '../../components/form/DatePicker';
import { useAddProjectMutation } from '../../graphql/hooks';
import { ProjectInput } from '../../../cdk/resources/lambda/mutations/graphql';

const formCss = css`
  display: grid;
  grid-template:
    "client industry startDate endDate" auto
    "description description description description" auto
    "methodologies methodologies technologies technologies" auto
  ;

  .client {
    grid-area: client;
  }
  .industry {
    grid-area: industry;
  }
  .startDate {
    grid-area: startDate;
  }
  .endDate {
    grid-area: endDate;
  }
  .description {
    grid-area: description;
  }
  .methodologies {
    grid-area: methodologies;
  }
  .technologies {
    grid-area: technologies;
  }
`;

export const ProjectForm: FC = () => {
  const [mutate] = useAddProjectMutation();
  const { register, handleSubmit, setValue } = useForm<ProjectInput>();

  const onSubmit = (input: ProjectInput) => {
    console.log(input);
    mutate({
      variables: {
        input: {
          id: '',
          client: '',
          description: '',
          industry: '',
          methodologies: [''],
          technologies: [''],
          startDate: '',
          endDate: '',
        },
      },
    });
  };

  return (
    <form action="#" onSubmit={handleSubmit(onSubmit)} css={formCss}>
      <label className="client" htmlFor="client">
        <span>Client Name</span>
        <Input name="client" id="client" ref={register} />
      </label>
      <label className="industry" htmlFor="industry">
        <span>Client Name</span>
        <Input name="industry" id="industry" ref={register} />
      </label>
      <label className="startDate" htmlFor="startDate">
        <span>Start Date</span>
        <DatePicker onChange={(date) => setValue('startDate', date?.toISOString() ?? '')} />
      </label>
      <label className="endDate" htmlFor="endDate">
        <span>End Date</span>
        <DatePicker onChange={(date) => setValue('endDate', date?.toISOString())} />
      </label>
      <label className="description" htmlFor="description">
        <span>Description</span>
        <textarea name="description" id="description" ref={register} />
      </label>
      <label className="methodologies" htmlFor="methodologies">
        <span>methodologies</span>
        <textarea ref={register} />
      </label>
      <label className="technologies" htmlFor="technologies">
        <span>Technologies</span>
        <textarea ref={register} />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
};
