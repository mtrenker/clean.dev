import React from 'react';
import { render } from 'react-dom';

import { App } from './App';

const container = document.body.appendChild(document.createElement('div'));
render(<App />, container);

if (module.hot) {
  module.hot.accept('./App.tsx', () => {
    render(<App />, container);
  });
}
