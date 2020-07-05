import React, { FC } from 'react';
import { css } from '@emotion/core';
import { useForm, Controller } from 'react-hook-form';

import { Input } from './Input';
import { DatePicker } from './DatePicker';
import { ProjectInput } from '../graphql/hooks';
import { TextArea } from './TextArea';

interface ProjectFormProps {
  onSubmit: (values: ProjectInput) => void;
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

export const ProjectForm: FC<ProjectFormProps> = ({ onSubmit }) => {
  const { register, handleSubmit, control } = useForm<ProjectInput>();

  const renderDatePicker = (value: Date) => () => (
    <DatePicker
      onChange={(selected) => selected}
      selected={value}
    />
  );

  return (
    <form action="#" onSubmit={handleSubmit(onSubmit)} css={formCss}>
      <label className="client" htmlFor="client">
        <span>Client Name</span>
        <Input name="client" placeholder="Client" id="client" inputRef={register} />
      </label>
      <label className="industry" htmlFor="industry">
        <span>Industry</span>
        <Input name="industry" placeholder="Industry" id="industry" inputRef={register} />
      </label>
      <label className="startDate" htmlFor="startDate">
        <span>Start Date</span>
        <Controller
          name="startDate"
          control={control}
          render={renderDatePicker(new Date())}
        />
      </label>
      <label className="endDate" htmlFor="endDate">
        <span>End Date</span>
        <Controller
          name="endDate"
          control={control}
          render={renderDatePicker(new Date())}
        />
      </label>
      <label className="description" htmlFor="description">
        <span>Description</span>
        <TextArea name="description" placeholder="Description" id="description" inputRef={register} />
      </label>
      <label className="methodologies" htmlFor="methodologies">
        <span>methodologies</span>
        <TextArea name="methodologies" placeholder="Methodologies" inputRef={register} />
      </label>
      <label className="technologies" htmlFor="technologies">
        <span>Technologies</span>
        <TextArea name="technologies" placeholder="Technologies" inputRef={register} />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
};
