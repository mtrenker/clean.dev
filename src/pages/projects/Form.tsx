import { VFC } from 'react';
import { useFormContext } from 'react-hook-form';
import { css } from '@emotion/react';

interface FormProps {
  onSubmit: () => void
}

export interface ProjectData {
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
  const { register } = useFormContext<ProjectData>();
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

      <div className="city">
        <label htmlFor="city">city</label>
        <input type="text" id="endDate" {...register('contact.city')} />
      </div>

      <div className="email">
        <label htmlFor="email">email</label>
        <input type="text" id="endDate" {...register('contact.email')} />
      </div>

      <div className="firstName">
        <label htmlFor="firstName">firstName</label>
        <input type="text" id="endDate" {...register('contact.firstName')} />
      </div>

      <div className="lastName">
        <label htmlFor="lastName">lastName</label>
        <input type="text" id="endDate" {...register('contact.lastName')} />
      </div>

      <div className="street">
        <label htmlFor="street">street</label>
        <input type="text" id="endDate" {...register('contact.street')} />
      </div>

      <div className="zip">
        <label htmlFor="zip">zip</label>
        <input type="text" id="endDate" {...register('contact.zip')} />
      </div>

      <button type="submit">Submit</button>
    </form>
  );
};

// city: String!
// email: String!
// firstName: String!
// lastName: String!
// street: String!
// zip: String!
