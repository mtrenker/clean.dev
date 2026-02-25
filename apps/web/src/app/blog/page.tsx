import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllPosts, formatPostDate } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog — clean.dev',
  description: 'Writing on software architecture, clean code, team velocity, and AI integration by Martin Trenker.',
};

const BlogPage: React.FC = () => {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="section border-b border-border">
        <div className="mx-auto max-w-4xl">
          <p className="text-label mb-4 tracking-[0.3em] text-accent">Writing</p>
          <h1 className="heading-display mb-6 text-5xl md:text-6xl">Blog</h1>
          <p className="max-w-2xl text-xl leading-relaxed text-muted-foreground">
            Opinions on software architecture, clean code, team velocity, and what actually happens when AI meets a real codebase.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="mx-auto max-w-4xl">
          {posts.length === 0 ? (
            <p className="text-muted-foreground">No posts yet.</p>
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
                    <h2 className="heading-display mb-4 text-2xl md:text-3xl">
                      <Link
                        className="transition-colors hover:text-accent"
                        href={`/blog/${post.slug}`}
                      >
                        {post.frontmatter.title}
                      </Link>
                    </h2>
                    <p className="mb-6 max-w-2xl leading-relaxed text-muted-foreground">
                      {post.frontmatter.description}
                    </p>
                    {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                      <div className="mb-6 flex flex-wrap gap-2">
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
                    <Link
                      className="text-label group inline-flex items-center gap-2 text-sm text-foreground transition-colors hover:text-accent"
                      href={`/blog/${post.slug}`}
                    >
                      Read post
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  </article>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </main>
  );
};

export default BlogPage;
