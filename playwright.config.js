import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.spec.js'],
  use: {
    // 네트워크 요청 허용
    ignoreHTTPSErrors: true,
    // 브라우저 컨텍스트 설정
    contextOptions: {
      ignoreHTTPSErrors: true,
    }
  },
});
