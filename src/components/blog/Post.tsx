import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

import { HeroImage } from '../layout/HeroImage';

import { useGetBlogPostQuery } from '../../graphql/hooks';

import { mapWidgets } from '../../lib/contentful';
import { css } from '../../lib/style';
import { Theme } from '../../themes/default';

const postCss = (theme: Theme) => css`
  ${theme.css.containerCss.styles}
`;

export const Post: FC = () => {
  const { title } = useParams<{title: string}>();

  const { data } = useGetBlogPostQuery({ variables: { blogPostQuery: { post: title } } });
  if (!data) return <p>Loading</p>;
  const { content, heroImage } = data?.blog?.post;

  const post = documentToReactComponents(JSON.parse(content), {
    renderNode: mapWidgets(),
  });

  return (
    <>
      <HeroImage url={heroImage?.url} />
      <article css={postCss}>
        {post}
      </article>
    </>
  );
};
