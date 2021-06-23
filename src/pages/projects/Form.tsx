import { css } from '@emotion/react';
import { VFC } from 'react';
import { useFormContext } from 'react-hook-form';

interface FormProps {
  onSubmit: () => void
}

export interface FormData {
  client: string;
  contact: {
    city: string;
    email: string;
    firstName: string;
    lastName: string;
    street: string;
    zip: string;
  }
  description: string;
  endDate: string;
  industry: string;
  methodologies: string;
  startDate: string;
  technologies: string;
}

const formCss = () => css`
  display: grid;
  grid-template:
    "client industry" auto
    "description description" auto
    "startDate endDate" auto
    "methodologies methodologies" auto
    "technologies technologies" auto
    / 1fr 1fr
  ;
  div {
    label {
      display: inline-block;
      width: 200px;
    }
    input {
      height: 30px;
      display: inline-block;
    }
    textarea {
      height: 100px;
      width: 500px;
    }
  }
  .client {
    grid-area: client;
  }
  .industry {
    grid-area: industry;
  }
  .description {
    grid-area: description;
  }
  .startDate {
    grid-area: startDate;
  }
  .endDate {
    grid-area: endDate;
  }
  .methodologies {
    grid-area: methodologies;
  }
  .technologies {
    grid-area: technologies;
  }
`;

export const Form: VFC<FormProps> = ({ onSubmit }) => {
  const { register } = useFormContext<FormData>();
  return (
      <form onSubmit={onSubmit} css={formCss}>
        <div className="client">
          <label htmlFor="client">client</label>
          <input type="text" id="client" {...register('client')} />
        </div>

        <div className="industry">
          <label htmlFor="industry">industry</label>
          <input type="text" id="industry" {...register('industry')} />
        </div>

        <div className="description">
          <label htmlFor="description">description</label>
          <textarea id="description" {...register('description')} />
        </div>

        <div className="startDate">
          <label htmlFor="startDate">startDate</label>
          <input type="text" id="startDate" {...register('startDate')} />
        </div>

        <div className="endDate">
          <label htmlFor="endDate">endDate</label>
          <input type="text" id="endDate" {...register('endDate')} />
        </div>

        <div className="methodologies">
          <label htmlFor="methodologies">methodologies</label>
          <textarea id="methodologies" {...register('methodologies')} />
        </div>

        <div className="technologies">
          <label htmlFor="technologies">technologies</label>
          <textarea id="technologies" {...register('technologies')} />
        </div>
        <button type="submit">Submit</button>
      </form>
  );
};
