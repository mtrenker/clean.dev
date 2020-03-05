import React, { FC } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { Frontpage } from "../pages/Frontpage";

export const Root: FC = () => (
  <Router>
    <Switch>
      <Route path="/">
        <Frontpage />
      </Route>
    </Switch>
  </Router>
);
