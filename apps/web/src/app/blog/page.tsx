import { NextPage } from "next";
import { draftMode } from 'next/headers';
import { getPosts } from "@/lib/blog/client";

const BlogPage: NextPage = async () => {
  const draft = draftMode();
  const posts = await getPosts({ draft: draft.isEnabled });
  return (
    <div>
      {posts.map((post) => (
        <div key={post.slug}>
          <h1>{post.title}</h1>
        </div>
      ))}
    </div>
  );
}

export default BlogPage;
