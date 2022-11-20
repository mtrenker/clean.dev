// eslint-disable-next-line @typescript-eslint/no-var-requires
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});
/** @type {import('next').NextConfig} */
module.exports = withMDX({
  trailingSlash: true,
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  images: {
    domains: ['picsum.photos'],
    unoptimized: true,
  },
});
