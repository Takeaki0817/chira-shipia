import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.integration.test.tsx', 'src/**/*.integration.test.ts'],
    exclude: ['node_modules/**', 'dist/**'],
    setupFiles: './src/test/setup.ts',
    testTimeout: 10000,
  },
});