import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Projects } from './Projects';
import { exampleProjects } from './Projects.stories';

describe('components/Projects', () => {
  it('renders', () => {

    // arrange

    render(<Projects projects={exampleProjects} />);

    // act

    const component = screen.getByRole('heading');

    // assert

    expect(component).toHaveTextContent('Example Project');
  });
});
