import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ProjectForm } from './ProjectForm';

describe('components/ProjectForm', () => {
  xit('renders', () => {

    // arrange

    render(
      <ProjectForm
        onSubmit={() => {
          console.log('noop');
        }}
      />
    );

    // act

   // assert

    expect(true).toBe(true);
  });
});
