import React, { FC } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/react-hooks';

import { Page } from '../pages/Page';
import { client } from '../graphql/client';

export const Root: FC = () => (
  <ApolloProvider client={client}>
    <Router>
      <Switch>
        <Route path="/">
          <Page />
        </Route>
      </Switch>
    </Router>
  </ApolloProvider>
);
