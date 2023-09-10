import { NextPage } from "next";
import { draftMode } from "next/headers";

import { SlateRender } from "@/components/SlateRender";
import { getPost } from "@/lib/blog/client";

export interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

const BlogPostPage: NextPage<BlogPostPageProps> = async ({ params }) => {
  const { slug } = params;
  const draft = draftMode();
  const post = await getPost(slug, { draft: draft.isEnabled });
  return (
    <div className="container mx-auto prose px-4">
      <h1>{post?.title}</h1>
      <SlateRender value={post?.teaser.raw.children} />
      <SlateRender value={post?.content.raw.children} references={post?.content.references} />
    </div>
  );
};

export default BlogPostPage;
