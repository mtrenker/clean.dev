import React, { FC } from 'react';
import { useGetBlogListQuery } from '../../graphql/hooks';

export const Overview: FC = () => {
  const { data } = useGetBlogListQuery();
  if (!data) return <p>Loading</p>;
  return (
    <div>
      <h1>Overview</h1>
      {data.blog.list.items.map((post) => (
        <div>
          <h2>{post.title}</h2>
        </div>
      ))}
    </div>
  );
};
