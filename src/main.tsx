import React from 'react';
import { render } from 'react-dom';

import { App } from './app/App';

const container = document.body.appendChild(document.createElement('div'));
container.classList.add('root');
render(<App />, container);


if (module.hot) {
  module.hot.accept('./app/App.tsx', () => {
    render(<App />, container);
  });
}
