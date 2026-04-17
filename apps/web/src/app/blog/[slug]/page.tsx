import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
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
    <main id="main-content" className="min-h-screen bg-background text-foreground">

      {/* ── Post header ─────────────────────────────────────────────────────── */}
      <Section noBorder>
        <Container size="narrow">
          <Link
            href="/blog"
            className="text-label mb-8 inline-flex items-center gap-2 text-xs tracking-widest text-muted-foreground transition-colors hover:text-accent"
          >
            <span aria-hidden="true">←</span> All posts
          </Link>

          <time
            className="text-label mt-4 block text-xs tracking-widest text-muted-foreground"
            dateTime={post.frontmatter.date}
          >
            {formatPostDate(post.frontmatter.date)}
          </time>

          <Heading as="h1" variant="display" className="mb-6 mt-4 text-4xl md:text-5xl lg:text-6xl">
            {post.frontmatter.title}
          </Heading>

          <p className="max-w-2xl text-xl leading-relaxed text-muted-foreground">
            {post.frontmatter.description}
          </p>

          {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.frontmatter.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </Container>
      </Section>

      {/* ── Post body ───────────────────────────────────────────────────────── */}
      <Section>
        <Container size="narrow">
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
        </Container>
      </Section>

      {/* ── Post footer nav ─────────────────────────────────────────────────── */}
      <Section noBorder className="border-t border-border">
        <Container size="narrow" className="flex items-center justify-between gap-4 flex-wrap">
          <Link
            href="/blog"
            className="text-label inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
          >
            <span>←</span> Back to all posts
          </Link>
          <a href="/contact" className="btn-secondary text-sm">
            Start a Conversation →
          </a>
        </Container>
      </Section>

    </main>
  );
};

export default BlogPostPage;
