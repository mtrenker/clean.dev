import React, { FC, StrictMode } from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';

const container = document.createElement('div');

export const App: FC = () => (
  <StrictMode>
    <ThemeProvider theme={{}}>
      <link rel="stylesheet" href="https://use.typekit.net/ure2jht.css" />
      <Router>
        <Switch>
          <Route path="/">
            Hello World
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>
  </StrictMode>
);

render(<App />, document.body.appendChild(container));
