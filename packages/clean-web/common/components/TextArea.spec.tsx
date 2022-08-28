import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { TextArea } from './TextArea';

describe('components/TextArea', () => {
  it('renders', () => {

    // arrange

    render(<TextArea id="comment" label="comment" />);

    // act

    const component = screen.getByLabelText('comment');

    userEvent.click(component);

    // assert

    expect(component).toBeInTheDocument();
  });
});
