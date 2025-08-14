import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.spec.js'],
  use: {
    ignoreHTTPSErrors: true,
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
    baseURL: process.env.BASE_URL,
  },
});
