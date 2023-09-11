import type { Metadata, NextPage } from 'next';
import { draftMode } from 'next/headers';
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
  const draft = draftMode();
  const post = await getPost(slug, { draft: draft.isEnabled });
  if (!post) {
    return notFound();
  }
  const teaser = post.teaser.raw as { children: SlateNode[] };
  const content = post.content.raw as { children: SlateNode[] };
  return (
    <div className="container mx-auto px-4">
      <div className='flex flex-col lg:flex-row lg:flex-wrap gap-4 items-center lg:items-start justify-center'>
        <div className='prose'>
          <header>
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
        <aside className='lg:max-w-[280px] prose lg:[&>p]:text-sm'>
          <Image
            alt={post.author?.name ?? ''}
            className='rounded-full mx-auto'
            height={80}
            src={post.author?.avatar.url ?? ''}
            unoptimized
            width={80}
          />
          <Markdown options={{wrapper: Fragment}}>
            {post.author?.intro ?? ''}
          </Markdown>
        </aside>
      </div>
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
    title: post.title,
    openGraph: {
      title: post.title,
      description: post.teaser.text,
      images: [{
        url: post.image?.url ?? '',
      }]
    },
  };
};

export default BlogPostPage;
