import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Code } from './Code';

describe('components/Code', () => {
  it('renders', () => {

    // arrange

    const { container: component } = render(<Code language="jsx" />);

    // assert

    expect(component).toBeInTheDocument();
  });
});
