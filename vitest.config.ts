import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'ui/',
        'example/',
        'e2e/',
        'scripts/',
        'src/__tests__/',
        '**/*.test.ts',
        '**/*.config.ts',
        '**/index.ts',
      ],
    },
  },
});

