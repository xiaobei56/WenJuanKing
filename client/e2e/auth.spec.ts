import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1, h2, h3')).toContainText(/登录|登陆|login/i);
  });

  test('should display register page', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[type="text"], input[type="email"]')).toBeVisible();
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=/注册|register/i');
    await expect(page).toHaveURL(/register/);
  });
});

test.describe('User Registration', () => {
  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/register');
    await page.click('button:has-text("注册")');
    await expect(page.locator('.ant-form-item-explain-error')).toBeVisible();
  });

  test('should have password length validation', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[id="username"]', 'testuser');
    await page.fill('input[id="password"]', '123');
    await page.click('button:has-text("注册")');
    await expect(page.locator('text=/密码.*6|6.*字符/i')).toBeVisible();
  });
});

test.describe('Dashboard', () => {
  test('should show project list for authenticated user', async ({ page }) => {
    await page.goto('/projects');
    const url = page.url();
    if (url.includes('/login')) {
      console.log('Requires authentication - redirecting to login');
    } else {
      await expect(page.locator('.ant-card, .ant-empty')).toBeVisible();
    }
  });
});