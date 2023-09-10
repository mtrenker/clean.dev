import { NextPage } from "next";
import { draftMode } from 'next/headers';
import Link from "next/link";

import { getPosts } from "@/lib/blog/client";
import { formatBlogDateShort } from "@/lib/intl";
import { SlateRender } from "@/components/SlateRender";

const BlogPage: NextPage = async () => {
  const draft = draftMode().isEnabled;
  const posts = await getPosts({ draft });
  return (
    <div className="container mx-auto px-4">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold leading-tight">
          <span className="block font-display text-base font-semibold text-neutral-950">Blog</span>
          <span className="sr-only">-</span>
          <span className="mt-6 block max-w-5xl font-display text-5xl font-medium tracking-tight text-neutral-950 [text-wrap:balance] sm:text-6xl">
            Articles, tutorials, and more
          </span>
        </h1>
        <p className="my-5 leading-8 text-xl">
          Join me on my journey of learning and sharing. I write about web
          development, software architecture, and other topics from my daily
          work.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <article
          key={post.slug}
          itemProp=""
          itemType="http://schema.org/BlogPosting"
          className="flex flex-col gap-4"
          >
            <header className="flex flex-col gap-4 relative">
              <div className="z-10">
                <p>
                  <time itemProp="datePublished" dateTime={post.createdAt}>
                    {formatBlogDateShort(post.createdAt)}
                  </time>
                </p>
                <h2
                  itemProp="headline"
                  className="text-3xl font-bold leading-tight"
                >
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>
              </div>
            </header>
            <SlateRender value={post.teaser.raw.children} />
            <Link
              href={`/blog/${post.slug}`}
              className="block w-64 rounded-xl bg-black text-white font-bold py-2 px-4 hover:bg-gray-700"
            >
                Continue reading
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

export default BlogPage;
