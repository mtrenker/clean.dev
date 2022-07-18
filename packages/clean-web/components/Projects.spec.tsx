import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Projects } from './Projects';
import { exampleProjectsData } from './Projects.stories';

describe('components/Projects', () => {
  it('renders', () => {

    // arrange
    const projects = exampleProjectsData(5);
    projects[2].title = 'Example Project';
    render(<Projects projects={projects} />);

    // act

    const component = screen.getByText('Example Project');

    // assert

    expect(component).toBeInTheDocument();
  });
});
