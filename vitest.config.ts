import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // tests share one database, so run files sequentially
    fileParallelism: false,
    testTimeout: 20000,
  },
});
