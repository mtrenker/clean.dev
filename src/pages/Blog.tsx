import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { css } from '@emotion/core';

import { useBlogQuery } from '../graphql/hooks';
import { Header } from '../components/Header';
import { Container } from '../components/Container';
import { Footer } from '../components/Footer';
import { mapWidgets } from '../lib/contentful';
import { Heading } from '../components/Heading';

export const Blog: FC = () => {
  const { title } = useParams();

  const { data } = useBlogQuery({ variables: { input: { post: title } } });
  if (!data) return <p>Loading</p>;
  const document = data?.blog?.content ?? '';

  const content = documentToReactComponents(JSON.parse(document), {
    renderNode: mapWidgets(),
  });

  const heroCss = css`
    height: 650px;
    color: #FFFFFF;
    img {
      object-fit: cover;
      position: absolute;
      top: 0;
    }
  `;

  return (
    <>
      <Header />
      <div css={heroCss}>
        <Container>
          <Heading>Hello World</Heading>
          <Heading as="h2">Something smart to say</Heading>
        </Container>
      </div>
      <Container>
        {content}
      </Container>
      <Footer />
    </>
  );
};
