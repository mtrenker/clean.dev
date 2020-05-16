import React, { FC } from 'react';
import { lorem } from 'faker';
import { number } from '@storybook/addon-knobs';

import { Header } from './Header';
import { Container } from './Container';
import { Footer } from './Footer';
import { Heading } from '../typography/Heading';
import { Breadcrumbs } from './Breadcrumbs';
import { Text } from '../typography/Text';

export default { title: 'Design | Templates' };

export const landingPage: FC = () => {
  const paragraphCount = number('Paragraphs', 5);
  return (
    <>
      <Header>
        <Heading as="h4">Landing Page</Heading>
        <div>
          <Breadcrumbs />
        </div>
      </Header>
      <Container>
        <Heading as="h4">Welcome</Heading>
        {lorem.paragraphs(paragraphCount).split('\n').map((paragraph) => <Text>{paragraph}</Text>)}
      </Container>
      <Footer />
    </>
  );
};
