import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { TrackingTable } from './TrackingTable';

describe('components/TimeSheet', () => {
  it('renders', () => {

    // arrange

    render(<TrackingTable />);

    // act

    const component = screen.getByRole('table');

    userEvent.click(component);

    // assert

    expect(component).toBeInTheDocument();
  });
});
