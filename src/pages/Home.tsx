import { VFC } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@emotion/react';

const homeCss = css`
  .hero {
    height: calc(100vh - 50px);
  }

  .posts {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    article {
      flex: 1 0 150px;
      .title {
        font-size: 16px;
      }
    }
  }
`;

export const Home: VFC = () => (
  <div css={homeCss}>

    <section className="hero">
      Martin Trenker
    </section>

    <section className="posts">
      {[...new Array(5)].map(() => (
        <article>
          <Link to="/blog/example">
            <picture>
              <source media="(max-width: 700px)" srcSet="https://picsum.photos/150/200" />
              <source media="(min-width: 700px)" srcSet="https://picsum.photos/750/500" />
              <img src="https://picsum.photos/750/500" alt="Test" />
            </picture>
            <h3 className="title">A Blog Post About Code</h3>
          </Link>
        </article>
      ))}
    </section>

  </div>
);
