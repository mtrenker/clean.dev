import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { RichText } from '@graphcms/rich-text-react-renderer';
import { hygraphClient } from '../../graphql/client';
import { PostsDocument, PostsQuery } from '../../graphql/hygraph';

interface BlogPostProps {
  post: PostsQuery['posts'][0];
}

const BlogPost: NextPage<BlogPostProps> = ({ post }) => {
  const { title, content } = post;
  return (
    <div className="prose prose-invert container mx-auto">
      <h1>{title}</h1>
      <RichText content={content?.raw} />
    </div>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await hygraphClient.query<PostsQuery>({ query: PostsDocument });
  const paths = data.posts.map((post) => ({ params: { slug: post.slug ?? '' } }));
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { data } = await hygraphClient.query<PostsQuery>({ query: PostsDocument });
  const post = data.posts.find((post) => post.slug === params?.slug);
  return {
    props: {
      post,
    },
  };
};

export default BlogPost;
