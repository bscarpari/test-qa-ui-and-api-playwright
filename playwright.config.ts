import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : process.env.WORKERS ? parseInt(process.env.WORKERS) : undefined,
  reporter: [['html', { open: 'always' }], ['list']],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: process.env.HEADLESS === 'true',
    baseURL: process.env.UI_BASE_URL,
    ...devices['Desktop Chrome'],
  },
  projects: [
    {
      name: 'env',
      testDir: './tests/_env',
    },
    {
      name: 'ui',
      testDir: './tests/ui',
      use: {
        baseURL: process.env.UI_BASE_URL,
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: process.env.API_BASE_URL,
      },
    },
  ],
})
