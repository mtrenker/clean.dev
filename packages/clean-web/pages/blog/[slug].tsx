import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { Post, BlogPostDocument, BlogPostQueryVariables, BlogPostsDocument } from '../../graphql/generated';
import { hygraph } from '../../graphql/hygraph';

export const getStaticPaths: GetStaticPaths = async () => {
  const { posts } = await hygraph.request<{ posts: Post[] }>(BlogPostsDocument);
  return {
    paths: posts.map((post) => ({ params: { slug: post.slug } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params as { slug: string };
  const { post } = await hygraph.request<{ post: Post }, BlogPostQueryVariables>(BlogPostDocument, {
    where: {
      slug,
    },
  });
  const mdxSource = await serialize(post.content.markdown);
  console.log(mdxSource);

  return {
    props: {
      post,
      mdxSource,
    },
  };
};

const BlogPost: NextPage<{ post: Post, mdxSource: MDXRemoteSerializeResult }> = ({ post, mdxSource }) => {
  return (
    <div>
      {post && mdxSource && (
        <>
          <h1>{post?.title}</h1>
          <MDXRemote {...mdxSource} />
        </>
      )}
    </div>
  );
};

export default BlogPost;
