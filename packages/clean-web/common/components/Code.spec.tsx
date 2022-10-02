import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Code } from './Code';

describe('components/Code', () => {
  it('renders', () => {

    // arrange

    render(<Code />);

    // act

    const component = screen.getByRole('button', {
      name: /🐦 . o 0 (do I look like a canary?) /i,
    });

    userEvent.click(component);

    // assert

    expect(component).toBeInTheDocument();
  });
});
