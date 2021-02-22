import React, { FC } from 'react';
import { css } from '@emotion/react';
import { useForm, Controller } from 'react-hook-form';
import { formatISO } from 'date-fns';

import { useParams } from 'react-router-dom';
import { Input } from '../controls/Input';
import { DatePicker } from '../controls/DatePicker';
import {
  useCreateProjectMutation, useGetProjectQuery, useUpdateProjectMutation,
} from '../../graphql/hooks';
import { TextArea } from '../controls/TextArea';

interface FormInput {
  client: string;
  description: string;
  industry: string;
  startDate: string;
  endDate?: string;
  methodologies: string;
  technologies: string;
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  city: string;
  zip: string;
}

interface RenderProps {
  onChange: (...event: any[]) => void;
  onBlur: () => void;
  value: string;
}

const formCss = css`
  label span {
    display: none;
  }
  .company-info {
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
      id: projectId,
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
        setValue('firstName', getProject.contact.firstName);
        setValue('lastName', getProject.contact.lastName);
        setValue('email', getProject.contact.email);
        setValue('street', getProject.contact.street);
        setValue('city', getProject.contact.city);
        setValue('zip', getProject.contact.zip);
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
    client,
    description,
    industry,
    technologies,
    methodologies,
    startDate,
    endDate,
    firstName,
    lastName,
    email,
    street,
    city,
    zip,
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
            contact: {
              email,
              firstName,
              lastName,
              street,
              city,
              zip,
            },
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
            contact: {
              email,
              firstName,
              lastName,
              street,
              city,
              zip,
            },
          },
        },
      });
    }
  };

  return (
    <form action="#" css={formCss} onSubmit={handleSubmit(onSubmit)}>
      <fieldset className="company-info">
        <legend>Company Info</legend>
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
      </fieldset>
      <fieldset className="contact-info">
        <legend>Contact</legend>
        <label className="firstName" htmlFor="firstName">
          <span>First Name</span>
          <Input name="firstName" placeholder="First Name" id="firstName" register={register} />
        </label>
        <label className="lastName" htmlFor="lastName">
          <span>Last Name</span>
          <Input name="lastName" placeholder="Last Name" id="lastName" register={register} />
        </label>
        <label className="email" htmlFor="email">
          <span>E-Mail</span>
          <Input name="email" placeholder="E-Mail" id="email" register={register} />
        </label>
        <label className="street" htmlFor="street">
          <span>Street</span>
          <Input name="street" placeholder="Street" id="street" register={register} />
        </label>
        <label className="city" htmlFor="city">
          <span>City</span>
          <Input name="city" placeholder="City" id="city" register={register} />
        </label>
        <label className="zip" htmlFor="zip">
          <span>Zip Code</span>
          <Input name="zip" placeholder="Zip Code" id="zip" register={register} />
        </label>
      </fieldset>
      <button type="submit">Submit</button>
    </form>
  );
};
