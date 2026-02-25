import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * Resolve the posts directory.
 *
 * - Dev (turbo runs from apps/web/):   process.cwd() = …/apps/web  → content/posts
 * - Docker standalone (WORKDIR /app):  process.cwd() = /app         → apps/web/content/posts
 */
const resolvePostsDir = (): string => {
  const candidates = [
    path.join(process.cwd(), 'content/posts'),
    path.join(process.cwd(), 'apps/web/content/posts'),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? candidates[0];
};

const POSTS_DIR = resolvePostsDir();

export type PostFrontmatter = {
  title: string;
  date: string;
  description: string;
  tags?: string[];
};

export type Post = {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
};

export type PostMeta = Omit<Post, 'content'>;

export const getAllPosts = (): PostMeta[] => {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const files = fs.readdirSync(POSTS_DIR);

  return files
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((filename) => {
      const slug = filename.replace(/\.mdx?$/, '');
      const filePath = path.join(POSTS_DIR, filename);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(raw);

      return {
        slug,
        frontmatter: data as PostFrontmatter,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime(),
    );
};

export const getPostBySlug = (slug: string): Post | null => {
  const candidates = [
    path.join(POSTS_DIR, `${slug}.mdx`),
    path.join(POSTS_DIR, `${slug}.md`),
  ];

  const filePath = candidates.find((p) => fs.existsSync(p));
  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  return {
    slug,
    frontmatter: data as PostFrontmatter,
    content,
  };
};

export const formatPostDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
