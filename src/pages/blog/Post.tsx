import { css } from '@emotion/react';
import { VFC } from 'react';
import { useParams } from 'react-router-dom';

import { useGetPostQuery } from '../../graphql/hooks';
import { render } from '../../lib/cms';

const postCss = css`
  padding: 0 16px;
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

  q {
    display: inline-block;
    border-left: 1px solid var(--brand);
    background-color: var(--surface4);
    padding: 16px;
    margin-bottom: 16px;
  }

  @media(min-width: 768px) {
    max-width: 1200px;
    margin: 0 auto;
  }

  .colors {
    .surface1 {
      background-color: var(--surface1);
      height: 100px;
    }
    .surface2 {
      background-color: var(--surface2);
      height: 100px;
    }
    .surface3 {
      background-color: var(--surface3);
      height: 100px;
    }
    .surface4 {
      background-color: var(--surface4);
      height: 100px;
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
  const content = JSON.parse(data?.getPost?.content);
  console.log(content);

  return (
    <article css={postCss}>
      <header>
        <h1>{data?.getPost?.title}</h1>
      </header>
      <img src={data?.getPost?.heroImage?.file.url} alt="" />
      {data?.getPost?.content && (
        <>
          {render(content)}
        </>
      )}
    </article>
  );
};
