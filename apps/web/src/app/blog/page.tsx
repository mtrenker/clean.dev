import React from 'react';
import type { Metadata } from 'next';
import { headers, cookies } from 'next/headers';
import { createIntl } from 'react-intl';
import { Card, PageHero, SiteContainer, SiteSection, SiteShell, Tag } from '@/components/site/public-design';
import { Link } from '@/components/ui/link';
import { getAllPosts, formatPostDate } from '@/lib/blog';
import { getLocale, loadMessages } from '@/lib/locale';

export const metadata: Metadata = {
  title: 'Articles | clean.dev',
  description:
    'Essays on embedded delivery, software architecture, agile transformation, and useful AI by Martin Trenker.',
};

const BlogPage: React.FC = async () => {
  const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);
  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);
  const intl = createIntl({ locale, messages });

  const posts = getAllPosts();

  return (
    <SiteShell>
      <PageHero
        eyebrow={intl.formatMessage({ id: 'blog.label' })}
        title={intl.formatMessage({ id: 'blog.heading' })}
        lead={intl.formatMessage({ id: 'blog.lead' })}
      />

      <SiteSection>
        <SiteContainer narrow>
          <Card className="border-l-4 border-l-[#d96e3f] p-5 font-mono text-sm leading-7 text-[#c4bda9]">
            {intl.formatMessage({ id: 'blog.note' })}
          </Card>
        </SiteContainer>
      </SiteSection>

      <SiteSection border={false}>
        <SiteContainer narrow>
          {posts.length === 0 ? (
            <Card className="p-6 text-[#c4bda9]">
              {intl.formatMessage({ id: 'blog.empty' })}
            </Card>
          ) : (
            <ol className="overflow-hidden rounded-[6px] border border-[#2c2924] bg-[#1c1a16]">
              {posts.map((post) => (
                <li key={post.slug} className="border-t border-[#2c2924] first:border-t-0">
                  <article className="p-6 md:p-8">
                    <time className="font-mono text-xs uppercase tracking-[0.16em] text-[#8a8474]" dateTime={post.frontmatter.date}>
                      {formatPostDate(post.frontmatter.date, locale)}
                    </time>
                    <h2 className="mt-4 text-3xl font-medium tracking-[-0.03em] text-[#ede7d4] md:text-4xl">
                      <Link href={`/blog/${post.slug}`} className="transition hover:text-[#d96e3f]">
                        {post.frontmatter.title}
                      </Link>
                    </h2>
                    <p className="mt-4 max-w-3xl leading-7 text-[#c4bda9]">{post.frontmatter.description}</p>
                    {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {post.frontmatter.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
                      </div>
                    )}
                    <Link
                      href={`/blog/${post.slug}`}
                      ariaLabel={`${intl.formatMessage({ id: 'blog.readPost' })}: ${post.frontmatter.title}`}
                      className="mt-6 inline-flex font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#d96e3f] transition hover:text-[#ede7d4]"
                    >
                      {intl.formatMessage({ id: 'blog.readPost' })}
                    </Link>
                  </article>
                </li>
              ))}
            </ol>
          )}
        </SiteContainer>
      </SiteSection>
    </SiteShell>
  );
};

export default BlogPage;
