/* eslint-disable import/no-import-module-exports */
import Auth from '@aws-amplify/auth';
import React from 'react';
import { render } from 'react-dom';

import { App } from './app/App';

const awsConfig = {
  Auth: {
    region: process.env.AWS_REGION,
    userPoolId: process.env.COGNITO_POOL_ID,
    userPoolWebClientId: process.env.COGNITO_CLIENT_ID,
  },
};

Auth.configure(awsConfig);

const container = document.body.appendChild(document.createElement('div'));
container.classList.add('root');
render(<App />, container);

if (module.hot) {
  module.hot.accept('./app/App.tsx', () => {
    render(<App />, container);
  });
}
