---
to: common/<%=h.capitalize(name)%>.spec.tsx
---
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { <%=h.capitalize(name)%> } from './<%=h.capitalize(name)%>';

describe('components/<%=h.capitalize(name)%>', () => {
  it('renders', () => {

    // arrange

    render(<<%=h.capitalize(name)%> />);

    // act

    const component = screen.getByRole('button', {
      name: /🐦 . o 0 (do I look like a canary?) /i,
    });

    userEvent.click(component);

    // assert

    expect(component).toBeInTheDocument();
  })
});
