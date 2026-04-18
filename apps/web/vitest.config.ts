import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // next-auth v5 exports `auth` as a bare module specifier resolved by Next.js;
      // Vitest needs an explicit alias so it can find (and mock) the file.
      'auth': path.resolve(__dirname, './auth.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.tsx'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    css: true,
    restoreMocks: true,
  },
});
