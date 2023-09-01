import { NextPage } from "next";
import { draftMode } from 'next/headers';
import { getPosts } from "@/lib/blog/client";

const BlogPage: NextPage = async () => {
  const draft = draftMode();
  // const posts = await getPosts({ draft: draft.isEnabled });
  return (
    <div>
      BlogList
    </div>
  );
}

export default BlogPage;
