import { VFC } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@emotion/react';

import { useGetBlogQuery } from '../graphql/hooks';
import { Hero } from '../components/sections/Hero';

const homeCss = css`
  .posts {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    flex-wrap: wrap;
    article {
      text-align: center;
      flex: 1 1 300px;
      .title {
        font-size: 16px;
      }
      picture {

      }
      img {
        object-fit: cover;
        height: 300px;
        width: 300px;
      }
    }
  }
`;

export const Home: VFC = () => {
  const { data } = useGetBlogQuery();
  return (
    <div css={homeCss}>
      <Hero />
      <section className="posts container">
        {data?.getBlog.posts.map((post) => (
          <article>
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

    </div>
  );
};
