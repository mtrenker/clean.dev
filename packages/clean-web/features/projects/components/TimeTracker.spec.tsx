import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { TimeTracker } from './TimeTracker';

describe('components/TimeTracker', () => {
  it('renders', () => {

    // arrange

    render(<TimeTracker />);

    // act

    const component = screen.getByRole('button', {
      name: /🐦 . o 0 (do I look like a canary?) /i,
    });

    userEvent.click(component);

    // assert

    expect(component).toBeInTheDocument();
  });
});
