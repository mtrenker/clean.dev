import { VFC } from 'react';
import { Link, Route, Switch } from 'react-router-dom';
import { Example } from './Example';
import { Post } from './Post';
import { Posts } from './Posts';

export const Overview: VFC = () => (
  <div>
    <Switch>
      <Route exact path="/blog/example">
        <Example />
      </Route>
      <Route exact path="/blog/:slug">
        <Post />
      </Route>
      <Route path="/blog">
        <Posts />
        <Link to="/blog/example">Example</Link>
      </Route>
    </Switch>
  </div>
);
