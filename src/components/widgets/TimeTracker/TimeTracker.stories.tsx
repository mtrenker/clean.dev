import React from 'react';
import { ApolloProvider } from '@apollo/react-hooks';

import { TimeTracker } from './TimeTracker';
import { client } from '../../../graphql/client';

export default { title: 'TimeTracker' };

export const normal = () => {
  const foo = 'bar';
  return (
    <ApolloProvider client={client}>
      <TimeTracker />
    </ApolloProvider>
  );
};
