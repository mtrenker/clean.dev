import { css } from '@emotion/react';
import { VFC } from 'react';
import { Link } from 'react-router-dom';
import { PostFieldsFragment } from '../../graphql/hooks';
import { render } from '../../lib/cms';
import { Button } from '../controls/Button';

interface BlogTeaserProps {
  post?: PostFieldsFragment
}

const blogTeaserCss = () => css`
  --blog-teaser-grid:
    "title" max-content
    "image" 30vh
    "intro" max-content
    "toolbar" max-content
    / 100%
  ;
  --blog-teaser-font-size: 24px;
  background: linear-gradient(
    to bottom,
    var(--surface3) 0 50%,
    var(--surface1) 50% 100%
  );
  .container {
    background: var(--surface5);
    color: var(--text3);
    display: grid;
    padding: 40px;
    row-gap: 16px;
    column-gap: 40px;
    grid-template: var(--blog-teaser-grid);
    .title {
      grid-area: title;
      font-size: var(--blog-teaser-font-size);
      a {
        color: var(--text3);
      }
    }
    .image {
      grid-area: image;
      margin: 0;
      img {
        object-fit: cover;
        height: 100%;
      }
      figcaption {
        font-size: 10px;
        a {
          color: #ffffff;
        }
      }
    }
    .intro {grid-area: intro}
    .toolbar {grid-area: toolbar}
  }
  @media(min-width: 1200px) {
    --blog-teaser-font-size: 42px;
    --blog-teaser-grid:
      "image title" auto
      "image intro" auto
      "image toolbar" auto
      / 1fr 4fr
    ;
  }
`;

export const BlogTeaser: VFC<BlogTeaserProps> = ({ post }) => (
  <section css={blogTeaserCss}>
    <div className="container">
      {post && (
        <>
          <h2 className="title"><Link to={`/posts/${post.slug}`}>{post.title}</Link></h2>
          <figure className="image">
            <img src={post.heroImage?.file.url} alt={post.intro ?? ''} />
            <figcaption dangerouslySetInnerHTML={{ __html: post.heroImage?.description }} />
          </figure>
          <div className="intro">
            {render(JSON.parse(post.intro!))}
          </div>
          <div className="toolbar">
            <p>Toolbar</p>
            <Button type="primary">Hey!</Button>
          </div>
        </>
      )}
    </div>
  </section>
);
