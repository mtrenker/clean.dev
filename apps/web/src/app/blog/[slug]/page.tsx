import type { Metadata, NextPage } from 'next';
import { notFound } from 'next/navigation';
import Markdown from 'markdown-to-jsx';
import Image from 'next/image';
import clsx from 'clsx';
import React, { Fragment } from 'react';
import type { SlateNode } from '../../../components/SlateRender';
import { SlateRender } from '../../../components/SlateRender';
import { getPost } from '../../../lib/blog/client';

export interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

const BlogPostPage: NextPage<BlogPostPageProps> = async ({ params }) => {
  const { slug } = params;
  const post = await getPost(slug);

  if (!post) {
    return notFound();
  }

  const teaser = post.teaser.raw as { children: SlateNode[] };
  const content = post.content.raw as { children: SlateNode[] };
  return (
    <div className="container mx-auto px-4">
      <article
        className="flex flex-col items-center justify-center gap-4 lg:flex-row lg:flex-wrap lg:items-start"
        itemProp=""
        itemType="http://schema.org/BlogPosting"
      >
        <div className="prose">
          <header>
            <p className="m-0 mb-2 font-bold leading-tight">{post.tagline}</p>
            <h1>
              {post.title}
            </h1>
          </header>
          <main className={clsx(
            '[&>p:first-of-type]:mb-0'
          )}>
            <SlateRender value={teaser.children} />
            <SlateRender references={post.content.references} value={content.children} />
          </main>
        </div>
        <aside className="prose lg:max-w-[280px] lg:[&>p]:text-sm">
          <Image
            alt={post.author?.name ?? ''}
            className="mx-auto rounded-full"
            height={80}
            src={post.author?.avatar.url ?? ''}
            unoptimized
            width={80}
          />
          <Markdown options={{wrapper: Fragment}}>
            {post.author?.intro ?? ''}
          </Markdown>
        </aside>
      </article>
    </div>
  );
}

type MetadataGenerator<T> = (props: T) => Promise<Metadata>;

export const generateMetadata: MetadataGenerator<BlogPostPageProps> = async ({ params }) => {
  const { slug } = params;
  const post = await getPost(slug);
  if (!post) {
    return notFound();
  }
  return {
    title: `${post.tagline} - ${post.title}`,
    openGraph: {
      type: 'article',
      locale: 'en_US',
      title: `${post.tagline} - ${post.title}`,
      description: post.teaser.text,
      url: `https://clean.dev/blog/${post.slug}`,
      images: [{
        url: post.image?.url ?? '',
      }]
    },
  };
};

export default BlogPostPage;
