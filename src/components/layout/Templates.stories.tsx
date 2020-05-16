import React, { FC } from 'react';
import { lorem } from 'faker';
import { text, number } from '@storybook/addon-knobs';

import { Header } from './Header';
import { Container } from './Container';
import { Footer } from './Footer';

export default { title: 'Design | Templates' };

export const landingPage: FC = () => {
  const title = text('headline', 'Welcome to clean.dev');
  const paragraphCount = number('Paragraphs', 5);
  return (
    <>
      <Header>
        <h2 css={{ height: '160px', lineHeight: '160px' }}>{title}</h2>
      </Header>
      <Container>
        {lorem.paragraphs(paragraphCount).split('\n').map((paragraph) => <p>{paragraph}</p>)}
      </Container>
      <Footer>
        Martin Trenker
      </Footer>
    </>
  );
};
