import React, { FC, useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/react-hooks';

import { Page } from '../pages/Page';
import { GlobalStyle } from './GlobalStyle';
import { client } from '../lib/graphql';
import { UserContext } from '../context/UserContext';
import { CleanUser, getUser, getCleanUser } from '../lib/auth';
import { Blog } from '../pages/Blog';

export const Root: FC = () => {
  const [user, setUser] = useState<CleanUser|null>(null);

  const refreshUser = async () => {
    const authenticatedUser = await getUser();
    if (authenticatedUser) {
      setUser(getCleanUser(authenticatedUser));
    }
  };

  useEffect(() => {
    refreshUser();
  }, [user?.username]);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      <ApolloProvider client={client}>
        <GlobalStyle />
        <Router>
          <Switch>
            <Route path="/blog/:title">
              <Blog />
            </Route>
            <Route path="/">
              <Page />
            </Route>
          </Switch>
        </Router>
      </ApolloProvider>
    </UserContext.Provider>
  );
};
