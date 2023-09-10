import type { NextPage } from 'next';
import { draftMode } from 'next/headers';
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
  const teaser = post?.teaser.raw as { children: SlateNode[] };
  const content = post?.content.raw as { children: SlateNode[] };
  return (
    <div className="container mx-auto prose px-4">
      <h1>{post?.title}</h1>
      <SlateRender value={teaser.children} />
      <SlateRender references={post?.content.references} value={content.children} />
    </div>
  );
};

export default BlogPostPage;
