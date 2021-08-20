import { css } from '@emotion/react';
import { VFC } from 'react';
import { useParams } from 'react-router-dom';

import { useGetPostQuery } from '../../graphql/hooks';
import { render } from '../../lib/cms';

const postCss = css`
  p {
    line-height: 1.5;
    margin-bottom: 16px;
  }
  h1, h2, h3 {
    font-family: zeitung, sans-serif;
    margin-bottom: 16px;
    line-height: 1.2;
  }
  h1 {
    font-size: 30px;
    font-weight: 600;
  }
  h2 {
    font-size: 22px;
    font-weight: 600;
  }
  h3 {
    font-size: 20px;
    font-weight: 600;
  }

  figure {
    margin-bottom: 16px;
    text-align: center;
  }

  ul {
    margin-bottom: 16px;
    list-style: disc;
    li {
      margin-left: 24px;
    }
  }

  blockquote {
    display: inline-block;
    border-left: 1px solid var(--brand);
    background-color: var(--surface4);
    padding: 16px;
    margin-bottom: 16px;
  }

  header {
    height: 300px;
    position: relative;
    display: flex;
    margin-bottom: 24px;
    h1 {
      position: relative;
      z-index: 1;
      font-size: 40px;
      align-self: center;
    }
    img {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      object-fit: cover;
      filter: grayscale(.75);
    }
  }
  main {
  }
  @media(min-width: 768px) {
    header {
      height: 400px;
      margin-bottom: 48px;
      h1 {
        font-size: 60px;
      }
    }
    main {
      font-size: 18px;
    }
  }
`;

export const Post: VFC = () => {
  const { slug } = useParams<{slug: string}>();
  const { data } = useGetPostQuery({
    variables: {
      slug,
    },
  });
  if (!data) {
    return null;
  }
  const content = JSON.parse(data?.getPost?.content ?? '');

  return (
    <article css={postCss}>
      <header>
        <h1 className="container">{data?.getPost?.title}</h1>
        <img src={data?.getPost?.heroImage?.file.url} alt="" />
      </header>
      {data?.getPost?.content && (
        <main className="container">
          {render(content)}
        </main>
      )}
    </article>
  );
};
