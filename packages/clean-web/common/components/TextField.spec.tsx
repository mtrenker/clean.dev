import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { TextField } from './TextField';

describe('components/TextField', () => {
  xit('renders', () => {

    // arrange

    render(<TextField />);

    // act

    const component = screen.getByRole('input');


    expect(component).toBeInTheDocument();
  });
});
