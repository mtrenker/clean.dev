import React, { FC } from 'react';
import { css } from '@emotion/core';
import { useForm, Controller } from 'react-hook-form';
import { formatISO } from 'date-fns';

import { useParams } from 'react-router-dom';
import { Input } from '../controls/Input';
import { DatePicker } from '../controls/DatePicker';
import {
  useCreateProjectMutation, useGetProjectQuery, useUpdateProjectMutation,
} from '../../graphql/hooks';
import { TextArea } from '../TextArea';

interface FormInput {
  client: string;
  description: string;
  industry: string;
  startDate: string;
  endDate?: string;
  methodologies: string;
  technologies: string;
}

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
  } = useForm<FormInput>();
  const { projectId } = useParams<{projectId: string}>();

  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();

  useGetProjectQuery({
    skip: projectId === 'new',
    variables: {
      query: {
        projectId,
      },
    },
    onCompleted: ({ getProject }) => {
      if (getProject) {
        setValue('client', getProject.client);
        setValue('industry', getProject.industry);
        setValue('description', getProject.description);
        setValue('startDate', getProject.startDate);
        setValue('endDate', getProject.endDate ?? new Date().toISOString());
        setValue('methodologies', getProject.methodologies.join(', '));
        setValue('technologies', getProject.technologies.join(', '));
      }
    },
  });

  const renderDatePicker = ({ onBlur, onChange, value }: RenderProps) => (
    <DatePicker
      dateFormat="yyyy-MM-dd"
      onBlur={onBlur}
      onChange={(date: Date) => onChange(formatISO(date, { representation: 'date' }))}
      selected={value ? new Date(value) : new Date()}
    />
  );

  const onSubmit = ({
    client, description, industry, technologies, methodologies, startDate, endDate,
  }: FormInput) => {
    if (projectId === 'new') {
      createProject({
        variables: {
          input: {
            client,
            description,
            industry,
            technologies: technologies.split(', '),
            methodologies: methodologies.split(', '),
            startDate,
            endDate,
          },
        },
      });
    } else {
      updateProject({
        variables: {
          id: projectId,
          input: {
            client,
            description,
            industry,
            technologies: technologies.split(', '),
            methodologies: methodologies.split(', '),
            startDate,
            endDate,
          },
        },
      });
    }
  };

  return (
    <form action="#" css={formCss} onSubmit={handleSubmit(onSubmit)}>
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
