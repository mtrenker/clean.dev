import { NextPage } from 'next';
import Link from 'next/link';
import { Post, BlogPostsDocument } from '../../graphql/generated';
import { hygraph } from '../../graphql/hygraph';

export const getStaticProps = async () => {
  const { posts } = await hygraph.request<{ posts: Post[] }>(BlogPostsDocument);
  return {
    props: {
      posts,
    },
  };
};

export const BlogIndexPage: NextPage<{ posts: Post[] }> = ({ posts }) => {
  return (
    <div>
      {posts.map((post) => (
        <div key={post.id}>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </div>
      ))}
    </div>
  );
};

export default BlogIndexPage;
