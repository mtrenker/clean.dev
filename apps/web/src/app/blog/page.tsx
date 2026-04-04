import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllPosts, formatPostDate } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog — clean.dev',
  description: 'Handwritten essays on Progressive Engineering, software architecture, delivery systems, governance, and AI by Martin Trenker.',
};

const BlogPage: React.FC = () => {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="section border-b border-border">
        <div className="mx-auto max-w-4xl">
          <p className="text-label mb-4 tracking-[0.3em] text-accent">Writing</p>
          <h1 className="heading-display mb-6 text-4xl sm:text-5xl md:text-6xl">Blog</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Handwritten essays on Progressive Engineering, software architecture, delivery systems, governance, and what actually happens when AI meets a real codebase.
          </p>
          <div className="mt-8 max-w-2xl border-l-4 border-accent bg-muted px-5 py-4 text-sm leading-relaxed text-muted-foreground sm:px-6 sm:py-5">
            Every post here is written by me. I use AI for research and feedback, not to generate the prose on this blog.
          </div>
        </div>
      </section>

      <section className="section">
        <div className="mx-auto max-w-4xl">
          {posts.length === 0 ? (
            <p className="text-muted-foreground">No posts yet. The first handwritten essays are in progress.</p>
          ) : (
            <ol className="divide-y divide-border">
              {posts.map((post) => (
                <li key={post.slug} className="py-8 first:pt-0 sm:py-10">
                  <article>
                    <time
                      className="text-label mb-2 block text-xs tracking-widest text-muted-foreground sm:mb-3"
                      dateTime={post.frontmatter.date}
                    >
                      {formatPostDate(post.frontmatter.date)}
                    </time>
                    <h2 className="heading-display mb-3 text-xl sm:mb-4 sm:text-2xl md:text-3xl">
                      <Link
                        className="transition-colors hover:text-accent"
                        href={`/blog/${post.slug}`}
                      >
                        {post.frontmatter.title}
                      </Link>
                    </h2>
                    <p className="mb-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mb-6 sm:text-base">
                      {post.frontmatter.description}
                    </p>
                    {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                      <div className="mb-5 flex flex-wrap gap-2 sm:mb-6">
                        {post.frontmatter.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-label border border-border px-2.5 py-0.5 text-xs text-muted-foreground sm:px-3 sm:py-1"
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
                      <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
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
