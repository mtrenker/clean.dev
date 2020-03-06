import React, { FC } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { Frontpage } from "../pages/Frontpage";
import { Blog } from "../pages/Blog";
import { Contact } from "../pages/Contact";
import { CV } from "../pages/CV";

export const Root: FC = () => (
  <Router>
    <Switch>
      <Route path="/cv">
        <CV />
      </Route>
      <Route path="/blog">
        <Blog />
      </Route>
      <Route path="/contact" exact={true}>
        <Contact />
      </Route>
      <Route path="/" exact={true}>
        <Frontpage />
      </Route>
      <Route path="/*">
        <p>Not found</p>
      </Route>
    </Switch>
  </Router>
);
