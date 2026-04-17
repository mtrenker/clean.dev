import React from 'react';
import type { Metadata } from 'next';
import { headers, cookies } from 'next/headers';
import { createIntl } from 'react-intl';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
import { getAllPosts, formatPostDate } from '@/lib/blog';
import { getLocale, loadMessages } from '@/lib/locale';

export const metadata: Metadata = {
  title: 'Blog — clean.dev',
  description:
    'Handwritten essays on Progressive Engineering, software architecture, delivery systems, governance, and AI by Martin Trenker.',
};

const BlogPage: React.FC = async () => {
  const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);
  const locale = getLocale(headerStore, cookieStore);
  const messages = await loadMessages(locale);
  const intl = createIntl({ locale, messages });

  const posts = getAllPosts();

  return (
    <main id="main-content" className="min-h-screen bg-background text-foreground">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <Section noBorder>
        <Container size="narrow">
          <p className="text-label mb-4 tracking-[0.3em] text-accent">Writing</p>
          <Heading as="h1" variant="display" className="mb-6 text-5xl md:text-6xl">
            Blog
          </Heading>
          <p className="max-w-2xl text-xl leading-relaxed text-muted-foreground">
            Handwritten essays on Progressive Engineering, software architecture, delivery
            systems, governance, and what actually happens when AI meets a real codebase.
          </p>
          <div className="mt-8 max-w-2xl border-l-4 border-accent bg-muted px-6 py-5 text-sm leading-relaxed text-muted-foreground">
            Every post here is written by me. I use AI for research and feedback, not to
            generate the prose on this blog.
          </div>
        </Container>
      </Section>

      {/* ── Post list ───────────────────────────────────────────────────────── */}
      <Section>
        <Container size="narrow">
          {posts.length === 0 ? (
            <p className="text-muted-foreground">
              No posts yet. The first handwritten essays are in progress.
            </p>
          ) : (
            <ol className="divide-y divide-border">
              {posts.map((post) => (
                <li key={post.slug} className="py-10 first:pt-0">
                  <article>
                    <time
                      className="text-label mb-3 block text-xs tracking-widest text-muted-foreground"
                      dateTime={post.frontmatter.date}
                    >
                      {formatPostDate(post.frontmatter.date)}
                    </time>

                    <Heading as="h2" variant="section" className="mb-4 text-2xl md:text-3xl">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="transition-colors hover:text-accent"
                      >
                        {post.frontmatter.title}
                      </Link>
                    </Heading>

                    <p className="mb-6 max-w-2xl leading-relaxed text-muted-foreground">
                      {post.frontmatter.description}
                    </p>

                    {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                      <div className="mb-6 flex flex-wrap gap-2">
                        {post.frontmatter.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Link
                      href={`/blog/${post.slug}`}
                      ariaLabel={`Read post: ${post.frontmatter.title}`}
                      className="text-label group inline-flex items-center gap-2 text-sm text-foreground transition-colors hover:text-accent"
                    >
                      Read post
                      <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  </article>
                </li>
              ))}
            </ol>
          )}
        </Container>
      </Section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <Section variant="inverted">
        <Container size="narrow" className="text-center">
          <p className="mb-6 text-lg leading-relaxed opacity-80">
            {intl.formatMessage({ id: 'home.cta.lead' })}
          </p>
          <Link href="/contact" className="btn-primary inline-block">
            {intl.formatMessage({ id: 'home.cta.contact' })}
          </Link>
        </Container>
      </Section>

    </main>
  );
};

export default BlogPage;
