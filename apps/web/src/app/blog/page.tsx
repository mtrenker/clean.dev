import type { NextPage } from 'next';
import { draftMode } from 'next/headers';
import Link from 'next/link';
import { getPosts } from '../../lib/blog/client';
import { formatBlogDateShort } from '../../lib/intl';
import type { SlateNode} from '../../components/SlateRender';
import { SlateRender } from '../../components/SlateRender';

const BlogPage: NextPage = async () => {
  const draft = draftMode().isEnabled;
  const posts = await getPosts({ draft });
  return (
    <div className="container mx-auto px-4">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold leading-tight">
          <span className="block text-base font-semibold text-neutral-950">Blog</span>
          <span className="sr-only">-</span>
          <span className="mt-6 block max-w-5xl text-5xl font-medium tracking-tight text-neutral-950 [text-wrap:balance] sm:text-6xl">
            Articles, tutorials, and more
          </span>
        </h1>
        <p className="my-5 text-xl leading-8">
          Join me on my journey of learning and sharing. I write about web
          development, software architecture, and other topics from my daily
          work.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => {
          const teaser = post.teaser.raw as { children: SlateNode[]}
          return (
            <article
              className="flex flex-col gap-4"
              itemProp=""
              itemType="http://schema.org/BlogPosting"
              key={post.slug}
            >
              <header className="relative flex flex-col gap-4">
                <div className="z-10">
                  <p>
                    <time dateTime={post.createdAt as string} itemProp="datePublished">
                      {formatBlogDateShort(post.createdAt as string)}
                    </time>
                  </p>
                  <h3 className="font-bold leading-tight">{post.tagline}</h3>
                  <h2
                    className="text-3xl font-bold leading-tight"
                    itemProp="headline"
                  >
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>
                </div>
              </header>
              <SlateRender value={teaser.children} />
              <Link
                className="block w-64 rounded-xl bg-black px-4 py-2 font-bold text-white hover:bg-gray-700"
                href={`/blog/${post.slug}`}
              >
                Continue reading
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default BlogPage;
