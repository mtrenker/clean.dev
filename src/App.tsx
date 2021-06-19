import {
  FC, StrictMode, useEffect, useState,
} from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';

import { Construction } from './pages/Construction';
import { GlobalStyle } from './components/GlobalStyle';

import { getCurrentUser } from './lib/auth';
import { UserContext } from './context/UserContext';

export const App: FC = () => {
  const [user, setUser] = useState();

  useEffect(() => {
    const getUser = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    };
    getUser();
  }, []);

  return (
    <StrictMode>
      <ThemeProvider theme={{}}>
        <GlobalStyle />
        <link rel="stylesheet" href="https://use.typekit.net/ure2jht.css" />
        <UserContext.Provider value={user}>
          <Router>
            <Switch>
              <Route path="/">
                <Construction />
              </Route>
            </Switch>
          </Router>
        </UserContext.Provider>
      </ThemeProvider>
    </StrictMode>
  );
};
