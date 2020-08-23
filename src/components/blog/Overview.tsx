import React, { FC } from 'react';
import { css } from '@emotion/core';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { Link } from 'react-router-dom';
import { formatISO, formatDistanceToNow } from 'date-fns';
import de from 'date-fns/locale/de';

import { Card } from '../layout/Card';
import { HeroImage } from '../layout/HeroImage';

import { useGetBlogListQuery } from '../../graphql/hooks';
import { useTheme } from '../../lib/style';

import { mapWidgets } from '../../lib/contentful';

const overviewCss = css`
  margin-top: 20px;
  display: grid;
  grid-template:
    "sidebar main" auto
    / 1fr 4fr
  ;
  gap: 16px;

  > main {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    grid-area: main;
  }

  > aside {
    grid-area: sidebar;
  }
`;

const cardCss = css`
  flex: 1 1 calc(50% - 8px);

  header {
    position: relative;
    h3 {
      display: flex;
      position: absolute;
      align-items: center;
      z-index: 1;
      height: 4em;
      top: calc(50% - 2em);
      right: 0;
      left: 0;
      font-size: 20px;
      color: #000;
      background: rgba(255, 255, 255, .85);
      padding: 0 1em;
    }
    figure {
      height: 250px;
      overflow: hidden;
      img {
        margin-top: -75px;
        height: 450px;
        transition: height .25s ease-in, margin-top .25s ease-in;
      }
    }
    :hover {
      figure picture img {
        margin-top: -100px;
        height: 500px;
      }
    }
  }

  aside {
    display: flex;
    align-items: center;
    font-size: 14px;
    margin: 0;
    padding: .5em;
    figure {
      flex: 2 1;
      display: flex;
      align-items: center;
      img {
        flex: 1;
        overflow: hidde;
        border-radius: 100%;
        margin-right: 1em;
        margin-top: -30px;
        z-index: 2;
      }
      figcaption {
        flex: 5;
      }
    }
    time {
      flex: 1 1;
      text-align: right;
    }
  }

  p {
    font-size: 15px;
    padding: 0 2rem;
    margin: 0 0 .75rem 0;
  }
`;

export const Overview: FC = () => {
  const { data } = useGetBlogListQuery();
  const { css: { containerCss } } = useTheme();
  if (!data) return <p>Loading</p>;
  return (
    <section css={[containerCss, overviewCss]}>
      <main>
        {data.blog.list.items.map((post) => {
          const intro = documentToReactComponents(JSON.parse(post.intro), {
            renderNode: mapWidgets(),
          });
          const publishDate = new Date(post.publishDate);
          const publishedDistance = formatDistanceToNow(publishDate, { locale: de, addSuffix: true });
          return (
            <Card key={post.id} css={cardCss}>
              <header>
                <Link to={`/blog/${post.slug}`}>
                  <h3>{post.title}</h3>
                  <HeroImage url={post.heroImage?.url} />
                </Link>
              </header>
              <aside>
                <figure>
                  <img src={`${post.author.avatar?.url}?w=50`} alt={post.author.name} width="50" height="50" />
                  <figcaption>{`Von ${post.author.name}`}</figcaption>
                </figure>
                <time dateTime={formatISO(publishDate)} className="publish-date">{publishedDistance}</time>
              </aside>
              {intro}
            </Card>
          );
        })}
      </main>
      <aside>
        <Card>
          Some Search maybe
        </Card>
      </aside>
    </section>
  );
};
