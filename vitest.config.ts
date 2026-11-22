import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@wrappers': path.resolve(__dirname, 'wrappers-ts'),
      '@': path.resolve(__dirname, 'app/src'),
    },
  },
  test: { include: ['app/src/**/*.test.ts'] },
});
