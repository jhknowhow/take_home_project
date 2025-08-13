import { defineConfig, devices } from '@playwright/test';

const useMock = (process.env.USE_MOCK ?? 'true') !== 'false'; 

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    trace: 'on-first-retry',
    baseURL: useMock ? 'http://127.0.0.1:4010' : process.env.API_BASE_URL,
    extraHTTPHeaders: { 'Content-Type': 'application/json' }      
  },

  ...(useMock ? {
    webServer: {
      command: 'npx prism mock -p 4010 ./mocks/openapi.yaml',
      url: 'http://127.0.0.1:4010/users',
      reuseExistingServer: true,
      timeout: 120 * 1000
      //stdout: 'pipe',
      //stderr: 'pipe',
    }
  } : {})

});

