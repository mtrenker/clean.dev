import React, { FC } from 'react';

import { ProjectForm } from '../../components/projects/ProjectForm';
import { useAddProjectMutation } from '../../graphql/hooks';
import { mockClient } from '../../lib/graphql';
import { ProjectInput } from '../../../cdk/resources/lambda/mutations/graphql';

export default ({ title: 'Blueprints | Project/ProjectEditor' });

export const Blueprint: FC = () => {
  const [mutate] = useAddProjectMutation({ client: mockClient });
  const onSubmit = (input: ProjectInput) => {
    console.log(mutate);

    mutate({
      variables: {
        input,
      },
    });
  };
  return (
    <ProjectForm onSubmit={onSubmit} />
  );
};
