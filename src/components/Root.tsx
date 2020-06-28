import React, { FC, useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/react-hooks';
import { ThemeProvider } from 'emotion-theming';

import { Page } from '../pages/Page';
import { GlobalStyle } from './GlobalStyle';
import { theme } from '../themes/default';
import { client } from '../lib/graphql';
import { UserContext } from '../context/UserContext';
import { CleanUser, getUser, getCleanUser } from '../lib/auth';

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
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <Router>
            <Switch>
              <Route path="/">
                <Page />
              </Route>
            </Switch>
          </Router>
        </ThemeProvider>
      </ApolloProvider>
    </UserContext.Provider>
  );
};
