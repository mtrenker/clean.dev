import { NextPage } from 'next';
import { hygraphClient } from '../../graphql/client';
import { PostsDocument, PostsQuery } from '../../graphql/hygraph';
import Link from 'next/link';
import Image from 'next/image';
import { RichText, RichTextProps } from '@graphcms/rich-text-react-renderer';
import React from 'react';

type Teaser = RichTextProps['content'];

interface BlogOverviewProps {
  posts: PostsQuery['posts'];
}

const BlogOverview: NextPage<BlogOverviewProps> = ({ posts }) => {
  return (
    <div>
      <h1>Blog overview</h1>
      <div className="mx-auto grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
        {posts.map((post) => {
          const teaser = (post.teaser.raw as Teaser);
          // const image = teaser.
          return (
            <article
              className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8"
              key={post.id}
            >
              <div className="test">
                <RichText
                  content={teaser} renderers={{
                    p: ({ children }) => <p className="">{children}</p>,
                    img: ({ src = '', title = '', height, width }) => (
                      <Image alt={title} className="" height={height} src={src} width={width} />
                    ),
                  }}
                />
              </div>
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />
              <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/10" />

              <div className="flex flex-wrap items-center gap-y-1 overflow-hidden text-sm leading-6 text-gray-300">
                <time
                  className="mr-8"
                  // dateTime={post.datetime}
                  dateTime="2021-01-01"
                >
                  05.04.2023
                  {/* {post.date} */}
                </time>
                <div className="-ml-4 flex items-center gap-x-4">
                  <svg className="-ml-0.5 h-0.5 w-0.5 flex-none fill-white/50" viewBox="0 0 2 2">
                    <circle cx={1} cy={1} r={1} />
                  </svg>
                  <div className="flex gap-x-2.5">
                    {/* <Image
                      alt=""
                      className="h-6 w-6 flex-none rounded-full bg-white/10"
                      fill
                      src={image}
                    /> */}
                    Martin
                    {/* {post.author.name} */}
                  </div>
                </div>
              </div>
              <h3 className="mt-3 text-lg font-semibold leading-6 text-white">
                <Link href={`/blog/${post.slug}`}>
                  <span className="absolute inset-0" />
                  {post.title}
                </Link>
              </h3>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export const getStaticProps = async () => {
  const { data } = await hygraphClient.query<PostsQuery>({ query: PostsDocument });
  return {
    props: {
      posts: data.posts,
    },
  };
};

export default BlogOverview;
