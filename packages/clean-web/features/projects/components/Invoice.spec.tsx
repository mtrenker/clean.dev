import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Invoice } from './Invoice';

describe('components/Invoice', () => {
  it('renders', () => {

    // arrange

    render(<Invoice />);

    // act

    const component = screen.getByRole('button', {
      name: /🐦 . o 0 (do I look like a canary?) /i,
    });

    userEvent.click(component);

    // assert

    expect(component).toBeInTheDocument();
  });
});
