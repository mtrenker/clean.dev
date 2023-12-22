import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      'next/image': path.resolve(__dirname, './.ladle/UnoptimizedImage.tsx'),
      'next/link': path.resolve(__dirname, './.ladle/UnoptimizedLink.tsx'),
    },
  },
});
