import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Button } from './Button';

describe('components/Button', () => {
  it('renders', () => {

    // arrange

    render(<Button />);

    // act

    const component = screen.getByRole('button');

    // assert

    expect(component).toBeInTheDocument();
  });
});
