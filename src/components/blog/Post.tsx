import React, { FC } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

import { HeroImage } from '../layout/HeroImage';

import { useGetPostQuery } from '../../graphql/hooks';

import { mapWidgets } from '../../lib/contentful';
import { css } from '../../lib/style';
import { Theme } from '../../themes/default';

const postCss = (theme: Theme) => css`
  ${theme.css.containerCss.styles}
`;

export const Post: FC = () => {
  const { slug } = useParams<{slug: string}>();

  const { data } = useGetPostQuery({ variables: { slug } });
  if (!data?.getPost) return <p>Loading</p>;

  const {
    content, title, heroImage,
  } = data.getPost;

  const post = documentToReactComponents(JSON.parse(content ?? ''), {
    renderNode: mapWidgets(),
  });

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <HeroImage url={heroImage?.file.url} />
      <article css={postCss}>
        <h2>{title}</h2>
        {post}
      </article>
    </>
  );
};
