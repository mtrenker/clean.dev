import React, { FC } from 'react';
import { css } from '@emotion/core';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { Link } from 'react-router-dom';

import { useGetBlogListQuery } from '../../graphql/hooks';
import { mapWidgets } from '../../lib/contentful';

const overviewCss = css`
  padding-top: 25px;
  display: flex;
  gap: 16px;
`;

const cardCss = css`
  flex: 1;
  padding: .5rem;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, .4);
  box-shadow: 4px -4px rgba(0, 0, 0, .1);
`;

export const Overview: FC = () => {
  const { data } = useGetBlogListQuery();
  if (!data) return <p>Loading</p>;
  return (
    <div css={overviewCss}>
      {data.blog.list.items.map((post) => {
        const intro = documentToReactComponents(JSON.parse(post.intro), {
          renderNode: mapWidgets(),
        });
        return (
          <div css={cardCss}>
            <Link to={`blog/${post.slug}`}>
              <h2>{post.title}</h2>
              {intro}
            </Link>
          </div>
        );
      })}
    </div>
  );
};
