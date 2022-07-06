import { Container } from '@mui/material';
import {
  FC,
} from 'react';

interface PostMeta {
  title?: string;
}

// const components: Record<string, (props: Record<string, unknown>) => JSX.Element> = {
//   h1: () => <Typography variant="h1" />,
//   BlogHero: ({ src }) => <img src={src} height="200" />,
// };

export const BlogPost: FC = () => (
  <Container>
    foo
  </Container>
);
