import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/playwright/tests',
  timeout: 60000,

  use: {
    baseURL: 'http://127.0.0.1:6006/',
  },

  webServer: {
    command: 'pnpm --filter @antarip/storybook exec storybook dev -p 6006 --host 127.0.0.1 --ci',
    url: 'http://127.0.0.1:6006/',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
