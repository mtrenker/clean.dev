import React, { FC } from 'react';
import { lorem } from 'faker';

import { Header } from './Header';
import { Container } from './Container';

export default { title: 'Design | Templates' };

export const landingPage: FC = () => (
  <>
    <Header>
      <h2>Subtitle</h2>
    </Header>
    <Container>
      {lorem.paragraphs(5).split('\n').map((text) => <p>{text}</p>)}
    </Container>
  </>
);
