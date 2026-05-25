import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { headers, cookies } from 'next/headers';
import { createIntl } from 'react-intl';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ButtonLink, Card, SiteContainer, SiteSection, SiteShell, Tag } from '@/components/site/public-design';
import { Link } from '@/components/ui/link';
import { getAllPosts, getPostBySlug, formatPostDate } from '@/lib/blog';
import { getLocale, loadMessages } from '@/lib/locale';

type Props = {
  params: Promise<{ slug: string }>;
};

export const generateStaticParams = () => getAllPosts().map((post) => ({ slug: post.slug }));

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.frontmatter.title} | clean.dev`,
    description: post.frontmatter.description,
  };
};

const BlogPostPage: React.FC<Props> = async ({ params }) => {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);
  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);
  const intl = createIntl({ locale, messages });

  return (
    <SiteShell>
      <SiteSection>
        <SiteContainer narrow>
          <Link href="/blog" className="mb-8 inline-flex font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[var(--site-ink-mute)] transition hover:text-[var(--site-rust)]">
            ← {intl.formatMessage({ id: 'blog.back' })}
          </Link>
          <time className="block font-mono text-xs uppercase tracking-[0.16em] text-[var(--site-ink-mute)]" dateTime={post.frontmatter.date}>
            {formatPostDate(post.frontmatter.date, locale)}
          </time>
          <h1 className="mt-5 text-[clamp(2.7rem,7vw,5.4rem)] font-medium leading-[0.96] tracking-[-0.055em] text-[var(--site-ink)]">
            {post.frontmatter.title}
          </h1>
          <p className="mt-7 max-w-3xl text-xl leading-8 text-[var(--site-ink-sec)] md:text-2xl md:leading-9">
            {post.frontmatter.description}
          </p>
          {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.frontmatter.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
            </div>
          )}
        </SiteContainer>
      </SiteSection>

      <SiteSection>
        <SiteContainer narrow>
          <Card className="p-6 md:p-10">
            <div
              className={[
                'prose prose-invert max-w-none',
                'prose-headings:font-sans prose-headings:tracking-tight prose-headings:text-[var(--site-ink)]',
                'prose-h2:mt-12 prose-h2:text-3xl',
                'prose-h3:mt-8 prose-h3:text-xl',
                'prose-p:leading-8 prose-p:text-[var(--site-ink-sec)]',
                'prose-li:text-[var(--site-ink-sec)]',
                'prose-a:text-[var(--site-rust)] prose-a:no-underline hover:prose-a:underline',
                'prose-strong:text-[var(--site-ink)] prose-strong:font-semibold',
                'prose-code:font-mono prose-code:text-sm prose-code:text-[var(--site-amber)]',
                'prose-code:before:content-none prose-code:after:content-none',
                'prose-pre:border prose-pre:border-[var(--site-rule)] prose-pre:bg-[var(--site-panel-deep)]',
              ].join(' ')}
            >
              <MDXRemote source={post.content} />
            </div>
          </Card>
        </SiteContainer>
      </SiteSection>

      <SiteSection border={false}>
        <SiteContainer narrow className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/blog" className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[var(--site-ink-mute)] transition hover:text-[var(--site-rust)]">
            ← {intl.formatMessage({ id: 'blog.back' })}
          </Link>
          <ButtonLink href="/contact">{intl.formatMessage({ id: 'blog.cta' })}</ButtonLink>
        </SiteContainer>
      </SiteSection>
    </SiteShell>
  );
};

export default BlogPostPage;
