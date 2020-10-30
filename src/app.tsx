import React, {
  FC, useState, useEffect, StrictMode,
} from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import 'typeface-roboto';

import { ThemeProvider } from 'emotion-theming';
import { Page } from './components/layout/Page';
import { GlobalStyle } from './components/layout/GlobalStyle';
import { client } from './lib/graphql';
import { UserContext } from './context/UserContext';
import { CleanUser, getUser, getCleanUser } from './lib/auth';
import { defaultTheme } from './themes/default';
import { Login } from './components/user/Login';

const container = document.createElement('div');

export const App: FC = () => {
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
        <StrictMode>
          <ThemeProvider theme={defaultTheme}>
            <GlobalStyle />
            <Router>
              <Switch>
                <Route path="/">
                  <Login />
                  <Page />
                </Route>
              </Switch>
            </Router>
          </ThemeProvider>
        </StrictMode>
      </ApolloProvider>
    </UserContext.Provider>
  );
};

render(<App />, document.body.appendChild(container));
