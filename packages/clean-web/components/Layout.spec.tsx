import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Layout } from './Layout';

describe('components/Layout', () => {
  it('renders', () => {

    // arrange

    render(
      <Layout>
        <button type='button' >
          Hello World
        </button>
      </Layout>);

    // act

    const component = screen.getByRole('button', {
      name: /hello world/i,
    });

    userEvent.click(component);

    // assert

    expect(component).toBeInTheDocument();
  })
});
