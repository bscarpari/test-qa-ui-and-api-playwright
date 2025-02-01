import { test, expect } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config()

test.describe('Swag Labs E-commerce - UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    try {
      await page.goto('/')
    } catch (error: any) {
      console.error('Navigation Error:', error.message)
      await page.screenshot({
        path: `test-results/navigation-error-${Date.now()}.png`,
        fullPage: true,
      })
      throw error
    }
  })

  test('C1 - Login no sistema', async ({ page }) => {
    try {
      await page.fill('[data-test="username"]', process.env.STANDARD_USER || '')
      await page.fill('[data-test="password"]', process.env.STANDARD_PASSWORD || '')
      await page.click('[data-test="login-button"]')

      await expect(page).toHaveURL(/.*inventory.html/)
      await expect(page.locator('.shopping_cart_link')).toBeVisible()
    } catch (error: any) {
      console.error('Login Error:', error.message)
      await page.screenshot({
        path: `test-results/login-error-${Date.now()}.png`,
        fullPage: true,
      })
      throw error
    }
  })

  test('C1.1 - Login com diferentes credenciais inválidas', async ({ page }) => {
    try {
      const testCases = [
        {
          username: 'locked_out_user',
          password: 'secret_sauce',
          expectedError: 'Sorry, this user has been locked out.',
        },
        {
          username: '',
          password: 'secret_sauce',
          expectedError: 'Username is required',
        },
        {
          username: 'standard_user',
          password: '',
          expectedError: 'Password is required',
        },
        {
          username: 'invalid_user',
          password: 'invalid_pass',
          expectedError: 'Username and password do not match',
        },
      ]

      for (const testCase of testCases) {
        try {
          await page.fill('[data-test="username"]', testCase.username)
          await page.fill('[data-test="password"]', testCase.password)
          await page.click('[data-test="login-button"]')

          const errorMessage = page.locator('[data-test="error"]')
          await expect(errorMessage).toBeVisible()
          await expect(errorMessage).toContainText(testCase.expectedError)

          await page.fill('[data-test="username"]', '')
          await page.fill('[data-test="password"]', '')
        } catch (caseError: any) {
          console.error(`Login Test Case Error (${testCase.username}):`, caseError.message)
          await page.screenshot({
            path: `test-results/login-case-error-${testCase.username}-${Date.now()}.png`,
            fullPage: true,
          })
          throw caseError
        }
      }
    } catch (error: any) {
      console.error('Invalid Login Tests Error:', error.message)
      await page.screenshot({
        path: `test-results/invalid-login-error-${Date.now()}.png`,
        fullPage: true,
      })
      throw error
    }
  })

  test('C2 - Adicionar e remover produtos ao carrinho', async ({ page }) => {
    try {
      // Login
      await page.fill('[data-test="username"]', process.env.STANDARD_USER || '')
      await page.fill('[data-test="password"]', process.env.STANDARD_PASSWORD || '')
      await page.click('[data-test="login-button"]')

      // Adicionar produtos
      await page.click('[data-test="add-to-cart-sauce-labs-backpack"]')
      await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]')
      await page.click('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]')

      const cartBadge = page.locator('.shopping_cart_badge')
      await expect(cartBadge).toHaveText('3')

      // Remover produtos
      await page.click('[data-test="remove-sauce-labs-backpack"]')
      await page.click('[data-test="remove-sauce-labs-bike-light"]')

      await expect(cartBadge).toHaveText('1')

      await page.click('.shopping_cart_link')
      const remainingProduct = page.locator('.inventory_item_name')
      await expect(remainingProduct).toHaveText('Sauce Labs Bolt T-Shirt')
    } catch (error: any) {
      console.error('Cart Operation Error:', error.message)
      await page.screenshot({
        path: `test-results/cart-error-${Date.now()}.png`,
        fullPage: true,
      })
      throw error
    }
  })

  test('C3 - Simulação de erro na finalização da compra', async ({ page }) => {
    try {
      await page.fill('[data-test="username"]', process.env.STANDARD_USER || '')
      await page.fill('[data-test="password"]', process.env.STANDARD_PASSWORD || '')
      await page.click('[data-test="login-button"]')
      await page.click('[data-test="add-to-cart-sauce-labs-backpack"]')

      await page.click('.shopping_cart_link')
      await page.click('[data-test="checkout"]')
      await page.click('[data-test="continue"]')

      const errorMessage = page.locator('[data-test="error"]')
      await expect(errorMessage).toBeVisible()
      await expect(errorMessage).toContainText('Error: First Name is required')
    } catch (error: any) {
      console.error('Checkout Error:', error.message)
      await page.screenshot({
        path: `test-results/checkout-error-${Date.now()}.png`,
        fullPage: true,
      })
      throw error
    }
  })
})
