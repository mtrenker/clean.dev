import { Container, Typography } from '@mui/material';
import {
  FC, useEffect, useMemo, useState, Suspense, lazy,
} from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface PostMeta {
  title?: string;
}

const components: Record<string, (props: Record<string, unknown>) => JSX.Element> = {
  h1: () => <Typography variant="h1" />,
  BlogHero: ({ src }) => <img src={src} height="200" />,
};

export const BlogPost: FC = () => {
  const { postName } = useParams();
  const [meta, setMeta] = useState<PostMeta>({});

  useEffect(() => {
    const fetchMdx = async () => {
      const mdx = await import(`../data/${postName}.mdx`);
      const newMeta: PostMeta = {
        title: mdx.title,
      };
      setMeta(newMeta);
    };
    fetchMdx();
  }, [postName]);

  const Post = useMemo(() => lazy(() => import(`../data/${postName}.mdx`)), [postName]);
  return (
    <Container>
      <Helmet>
        <title>{`${meta.title} - clean.dev`}</title>
        <meta property="og:title" content={meta.title} />
      </Helmet>
      <Suspense>
        <Post components={components} />
      </Suspense>
    </Container>
  );
};
