import React, { FC } from 'react';

import { Login } from '../components/auth/Login';
import { TimeTracker } from '../components/widgets/TimeTracker/TimeTracker';
import { Header } from '../components/layout/Header';
import { Heading } from '../components/typography/Heading';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { Container } from '../components/layout/Container';
import { Footer } from '../components/layout/Footer';

export const Track: FC = () => (
  <>
    <Header>
      <Heading as="h4">Landing Page</Heading>
      <div>
        <Breadcrumbs />
      </div>
    </Header>
    <Container>
      <TimeTracker />
    </Container>
    <Footer />
  </>
);
