import React, { FC } from 'react';

import { Login } from '../components/auth/Login';
import { Header } from '../components/layout/Header';
import { Heading } from '../components/typography/Heading';
import { Container } from '../components/layout/Container';
import { Footer } from '../components/layout/Footer';
import { TimeTracker } from '../components/tracking/TimeTracker';

export const Track: FC = () => (
  <>
    <Header>
      <Heading as="h4" type="page-title">Time Tracking</Heading>
      <Login />
    </Header>
    <Container>
      <TimeTracker />
    </Container>
    <Footer />
  </>
);
