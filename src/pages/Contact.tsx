import React, { FC } from 'react';
import Helmet from 'react-helmet';

import { Header } from '../components/layout/Header';
import { Grid } from '../components/layout/Grid';

export const Contact: FC = () => (
  <Grid>
    <Header>
      <Helmet>
        <title>Contact</title>
      </Helmet>
    </Header>
    <main>
      <h2>Contact</h2>
      <form action="">
        <input type="text" />
      </form>
    </main>
    <footer>
      Footer
    </footer>
  </Grid>
);
