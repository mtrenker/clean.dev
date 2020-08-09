import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

import { useGetBlogPostQuery } from '../../graphql/hooks';
import { mapWidgets } from '../../lib/contentful';

export const Post: FC = () => {
  const { title } = useParams();

  const { data } = useGetBlogPostQuery({ variables: { blogPostQuery: { post: title } } });
  if (!data) return <p>Loading</p>;
  const document = data?.blog?.post.content ?? '';

  const content = documentToReactComponents(JSON.parse(document), {
    renderNode: mapWidgets(),
  });

  return (
    <article>
      {content}
    </article>
  );
};
