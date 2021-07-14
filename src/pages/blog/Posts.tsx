import { VFC } from 'react';
import { Link } from 'react-router-dom';
import { useGetBlogQuery } from '../../graphql/hooks';

export const Posts: VFC = () => {
  const { data } = useGetBlogQuery();
  return (
    <div>
      {data?.getBlog.posts.map((post) => (
        <article key={post.slug}>
          <Link to={`/blog/${post.slug}`}>
            {post.title}
          </Link>
        </article>
      ))}
    </div>
  );
};
