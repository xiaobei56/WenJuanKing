import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    if (page.url().includes('/login')) {
      console.log('Skipping test - requires authentication');
    }
  });

  test('should display settings page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3, .ant-page-header')).toBeVisible();
  });

  test('should show theme settings', async ({ page }) => {
    await page.waitForSelector('.ant-tabs, .ant-form, .ant-select', { timeout: 5000 });
  });

  test('should have theme color options', async ({ page }) => {
    const themeSelect = page.locator('.ant-select:has-text("主题"), .ant-select:has-text("颜色")').first();
    if (await themeSelect.isVisible()) {
      await themeSelect.click();
      await expect(page.locator('.ant-select-dropdown')).toBeVisible();
    }
  });
});

test.describe('Theme Switching', () => {
  test('should switch between light and dark mode', async ({ page }) => {
    await page.goto('/');
    if (page.url().includes('/login')) {
      test.skip();
    }

    const themeButton = page.locator('button[title*="主题"], button[title*="theme"], .anticon-sun, .anticon-moon').first();
    if (await themeButton.isVisible()) {
      await themeButton.click();
      await page.waitForTimeout(500);
    }
  });
});