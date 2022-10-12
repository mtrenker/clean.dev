import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { TimeTracking } from './TimeTracking';

describe('components/TimeTracking', () => {
  xit('renders', () => {

    // arrange

    render(<TimeTracking onSubmitTracking={() => {console.log('submit');}} projectId="1" />);

    // act

    const component = screen.getByRole('form');

    userEvent.click(component);

    // assert

    expect(component).toBeInTheDocument();
  });
});
