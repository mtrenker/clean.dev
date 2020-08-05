import React, { FC } from 'react';
import { css } from '@emotion/core';
import { useForm, Controller } from 'react-hook-form';

import { useParams } from 'react-router-dom';
import { Input } from '../Input';
import { DatePicker } from '../DatePicker';
import { ProjectInput, useAddProjectMutation, useGetProjectQuery } from '../../graphql/hooks';
import { TextArea } from '../TextArea';

interface RenderProps {
  onChange: (...event: any[]) => void;
  onBlur: () => void;
  value: string;
}

const formCss = css`
  display: grid;
  grid-template:
    "client industry startDate endDate" auto
    "description description description description" auto
    "methodologies methodologies technologies technologies" auto
  ;

  label span {
    display: none;
  }

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
  const {
    register, handleSubmit, control, setValue,
  } = useForm<ProjectInput>();
  const { projectId } = useParams();

  const [updateProject] = useAddProjectMutation();

  const { data } = useGetProjectQuery({
    variables: {
      query: { project: projectId },
    },
    onCompleted: ({ project }) => {
      setValue('client', project.client);
      setValue('industry', project.industry);
      setValue('startDate', project.startDate);
      setValue('endDate', project.endDate);
      setValue('description', project.description);
      setValue('methodologies', project.methodologies.join(', '));
      setValue('technologies', project.technologies.join(', '));
      // WEITERMACHEN! :)
    },
  });

  const onSubmit = (values: ProjectInput) => {
    updateProject({
      variables: {
        input: {
          id: projectId,
          ...values,
        },
      },
    });
  };

  const renderDatePicker = ({ onBlur, onChange, value }: RenderProps) => (
    <DatePicker onBlur={onBlur} onChange={(date) => onChange(date)} selected={value ? new Date(value) : new Date()} />
  );

  const project = data?.project;

  if (!project) {
    return <p>Loading</p>;
  }

  return (
    <form action="#" onSubmit={handleSubmit(onSubmit)} css={formCss}>
      <label className="client" htmlFor="client">
        <span>Client Name</span>
        <Input name="client" placeholder="Client" id="client" register={register} />
      </label>
      <label className="industry" htmlFor="industry">
        <span>Industry</span>
        <Input name="industry" placeholder="Industry" id="industry" register={register} />
      </label>
      <label className="startDate" htmlFor="startDate">
        <span>Start Date</span>
        <Controller
          name="startDate"
          control={control}
          render={renderDatePicker}
        />
      </label>
      <label className="endDate" htmlFor="endDate">
        <span>End Date</span>
        <Controller
          name="endDate"
          control={control}
          render={renderDatePicker}
        />
      </label>
      <label className="description" htmlFor="description">
        <span>Description</span>
        <TextArea
          name="description"
          placeholder="Description"
          id="description"
          register={register}
        />
      </label>
      <label className="methodologies" htmlFor="methodologies">
        <span>methodologies</span>
        <TextArea
          name="methodologies"
          placeholder="Methodologies"
          register={register}
        />
      </label>
      <label className="technologies" htmlFor="technologies">
        <span>Technologies</span>
        <TextArea
          name="technologies"
          placeholder="Technologies"
          register={register}
        />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
};
