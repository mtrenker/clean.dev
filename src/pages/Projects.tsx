import { VFC } from 'react';
import { css } from '@emotion/react';

import { useGetProjectsQuery } from '../graphql/hooks';
import { Form } from './projects/Form';

const projectsCss = css`
  section {
    background-color: var(--surface3);
  }
`;

export const Projects: VFC = () => {
  const { data } = useGetProjectsQuery({});
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
        <Form />
      </section>
    </div>
  );
};
