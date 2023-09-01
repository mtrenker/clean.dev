import { NextPage } from "next";
import { draftMode } from 'next/headers';
import { getPosts } from "@/lib/blog/client";
import Link from "next/link";

const BlogPage: NextPage = async () => {
  const draft = draftMode();
  const posts = await getPosts({ draft: draft.isEnabled });
  return (
    <div className="container mx-auto">
      {posts.map((post) => (
        <div key={post.slug}>
          <h2>
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h2>
        </div>
      ))}
    </div>
  );
}

export default BlogPage;
