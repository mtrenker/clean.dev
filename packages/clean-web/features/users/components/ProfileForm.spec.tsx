import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ProfileForm } from './ProfileForm';

describe('components/ProfileForm', () => {
  xit('renders', () => {

    // arrange

    render(<ProfileForm />);

    // act

    const component = screen.getByRole('form');

    userEvent.click(component);

    // assert

    expect(component).toBeInTheDocument();
  });
});
