import { test, expect } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config()

test.describe('Environment Variables Validation', () => {
  test('should have all required environment variables', async () => {
    // console.log('Environment Variables:', {
    //   STANDARD_USER: process.env.STANDARD_USER,
    //   STANDARD_PASSWORD: process.env.STANDARD_PASSWORD,
    //   API_BASE_URL: process.env.API_BASE_URL,
    //   UI_BASE_URL: process.env.UI_BASE_URL,
    //   HEADLESS: process.env.HEADLESS,
    //   WORKERS: process.env.WORKERS,
    // })

    // Auth variables
    expect(process.env.STANDARD_USER, 'STANDARD_USER is required').toBeDefined()
    expect(process.env.STANDARD_PASSWORD, 'STANDARD_PASSWORD is required').toBeDefined()

    // URLs
    expect(process.env.API_BASE_URL, 'API_BASE_URL is required').toBeDefined()
    expect(process.env.UI_BASE_URL, 'UI_BASE_URL is required').toBeDefined()

    // Test config
    expect(process.env.HEADLESS, 'HEADLESS is required').toBeDefined()
    expect(process.env.WORKERS, 'WORKERS is required').toBeDefined()

    // Validate URL formats
    expect(process.env.API_BASE_URL).toMatch(/^https?:\/\/.*/)
    expect(process.env.UI_BASE_URL).toMatch(/^https?:\/\/.*/)

    // Validate specific values
    expect(process.env.API_BASE_URL).toContain('reqres.in/api')
    expect(process.env.UI_BASE_URL).toContain('saucedemo.com')

    // Validate numeric values
    expect(Number(process.env.WORKERS)).toBeGreaterThan(0)

    // Validate boolean values
    expect(['true', 'false']).toContain(process.env.HEADLESS?.toLowerCase())
  })
})
