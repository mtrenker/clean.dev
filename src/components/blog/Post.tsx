import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

import { useGetBlogPostQuery } from '../../graphql/hooks';
import { mapWidgets } from '../../lib/contentful';
import { HeroImage } from '../HeroImage';

export const Post: FC = () => {
  const { title } = useParams<{title: string}>();

  const { data } = useGetBlogPostQuery({ variables: { blogPostQuery: { post: title } } });
  if (!data) return <p>Loading</p>;
  const { content, heroImage } = data?.blog?.post;

  const post = documentToReactComponents(JSON.parse(content), {
    renderNode: mapWidgets(),
  });

  return (
    <article>
      <HeroImage url={heroImage?.url} />
      {post}
    </article>
  );
};
