import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllPosts, getPostBySlug, formatPostDate } from '@/lib/blog';

type Props = {
  params: Promise<{ slug: string }>;
};

export const generateStaticParams = () => {
  return getAllPosts().map((post) => ({ slug: post.slug }));
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.frontmatter.title} — clean.dev`,
    description: post.frontmatter.description,
  };
};

const BlogPostPage: React.FC<Props> = async ({ params }) => {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Post Header */}
      <section className="section border-b border-border">
        <div className="mx-auto max-w-4xl">
          <Link
            className="text-label mb-8 inline-flex items-center gap-2 text-xs tracking-widest text-muted-foreground transition-colors hover:text-accent"
            href="/blog"
          >
            <span>←</span> All posts
          </Link>

          <time
            className="text-label mt-4 block text-xs tracking-widest text-muted-foreground"
            dateTime={post.frontmatter.date}
          >
            {formatPostDate(post.frontmatter.date)}
          </time>

          <h1 className="heading-display mb-6 mt-4 text-4xl md:text-5xl lg:text-6xl">
            {post.frontmatter.title}
          </h1>

          <p className="max-w-2xl text-xl leading-relaxed text-muted-foreground">
            {post.frontmatter.description}
          </p>

          {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.frontmatter.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-label border border-border px-3 py-1 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Post Content */}
      <section className="section">
        <div className="mx-auto max-w-4xl">
          <div
            className={[
              'prose max-w-none',
              'prose-headings:font-serif prose-headings:tracking-tight',
              'prose-h2:mt-12 prose-h2:text-3xl',
              'prose-h3:mt-8 prose-h3:text-xl',
              'prose-p:leading-relaxed',
              'prose-a:no-underline hover:prose-a:underline',
              'prose-strong:font-semibold',
              'prose-code:font-mono prose-code:text-sm',
              'prose-code:before:content-none prose-code:after:content-none',
              'prose-pre:border prose-pre:border-border',
            ].join(' ')}
          >
            <MDXRemote source={post.content} />
          </div>
        </div>
      </section>

      {/* Footer Nav */}
      <section className="section border-t border-border">
        <div className="mx-auto max-w-4xl">
          <Link
            className="text-label inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
            href="/blog"
          >
            <span>←</span> Back to all posts
          </Link>
        </div>
      </section>
    </main>
  );
};

export default BlogPostPage;
