import { VFC } from 'react';
import { Link } from 'react-router-dom';

import { useGetBlogQuery } from '../../graphql/hooks';

export const Blog: VFC = () => {
  const { data } = useGetBlogQuery();

  return (
    <section className="posts container">
      {data?.getBlog.posts.map((post) => (
        <article key={post.slug}>
          <Link to={`/posts/${post.slug}`}>
            <picture>
              <source media="(max-width: 700px)" srcSet={`${post.heroImage?.file.url}`} />
              <source media="(min-width: 700px)" srcSet={`${post.heroImage?.file.url}`} />
              <img src={`${post.heroImage?.file.url}`} alt={`${post.title}`} />
            </picture>
            <h3 className="title">{post.title}</h3>
          </Link>
        </article>
      ))}
    </section>
  );
};
