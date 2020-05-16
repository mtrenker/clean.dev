import React from 'react';
import { ApolloProvider } from '@apollo/react-hooks';

import { TimeTracker } from './TimeTracker';
import { client } from '../../../graphql/client';

export default { title: 'TimeTracker' };

export const normal = () => (
  <ApolloProvider client={client({ user: { username: 'test', jwtToken: 'test' } })}>
    <TimeTracker />
  </ApolloProvider>
);
