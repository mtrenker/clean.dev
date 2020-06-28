import React, { FC } from 'react';
import { formatISO } from 'date-fns';

import { ProjectForm } from '../ProjectForm';
import { ProjectInput } from '../../../cdk/resources/lambda/mutations/graphql';
import { useAddProjectMutation } from '../../graphql/hooks';

export const ProjectEditor: FC = () => {
  const [mutate] = useAddProjectMutation();
  const onSubmit = (input: ProjectInput) => {
    mutate({
      variables: {
        input: {
          ...input,
          startDate: formatISO(new Date(input.startDate), { representation: 'date' }),
          endDate: input.endDate && formatISO(new Date(input.endDate), { representation: 'date' }),
        },
      },
    });
  };
  return (
    <div>
      <ProjectForm onSubmit={onSubmit} />
    </div>
  );
};
