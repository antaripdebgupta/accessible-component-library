import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storybookStatic = path.resolve(__dirname, '../../apps/storybook/storybook-static');

export default defineConfig({
  testDir: './tests',
  workers: process.env.CI ? 1 : undefined,
  fullyParallel: false,
  timeout: 60000,

  use: {
    baseURL: 'http://127.0.0.1:6006/',
  },

  webServer: {
    command: process.env.CI
      ? `npx http-server ${storybookStatic} -p 6006 --silent`
      : 'pnpm --filter @accessly-ui/storybook exec storybook dev -p 6006 --host 127.0.0.1 --ci',
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
