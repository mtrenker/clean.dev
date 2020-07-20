import React from 'react';
import { shallow } from 'enzyme';

import { Icon } from './Icon';

describe('Icon', () => {
  it('clicks', () => {
    const mockCallback = jest.fn();
    const icon = shallow(<Icon icon="bars" onClick={mockCallback} />);
    expect(mockCallback.mock.calls).toBe(20);
    icon.simulate('click');
    expect(mockCallback.mock.calls).toBe(30);
  });
});
