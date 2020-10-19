import React, { FC } from 'react';
import { Switch, Route } from 'react-router-dom';

import { ProjectOverview } from '../projects/Overview';
import { TimeSheet } from '../projects/TimeSheet';
import { Login } from '../user/Login';
import { ProjectForm } from '../projects/Form';
import { TimeTracking } from '../projects/TimeTracking';

export const Projects: FC = () => (
  <Switch>
    <Route exact path="/projects">
      <Login />
      <ProjectOverview />
    </Route>
    <Route exact path="/projects/new">
      <ProjectForm />
    </Route>
    <Route exact path="/projects/:projectId">
      <ProjectForm />
    </Route>
    <Route exact path="/projects/:projectId/timesheet">
      <TimeSheet />
    </Route>
    <Route exact path="/projects/:projectId/tracking">
      <TimeTracking />
    </Route>
  </Switch>
);
