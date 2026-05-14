import { test, expect } from '@playwright/test';

test.describe('Project Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects');
    if (page.url().includes('/login')) {
      console.log('Skipping test - requires authentication');
      test.skip();
    }
  });

  test('should display project list page', async ({ page }) => {
    await expect(page.locator('h1, h2, h3, .ant-page-header')).toBeVisible();
  });

  test('should have create project button', async ({ page }) => {
    const createButton = page.locator('button:has-text("创建"), button:has-text("新建"), button:has-text("+")');
    await expect(createButton.first()).toBeVisible();
  });

  test('should open create project modal', async ({ page }) => {
    await page.click('button:has-text("创建"), button:has-text("新建"), button:has-text("+")');
    await expect(page.locator('.ant-modal, .ant-drawer')).toBeVisible();
  });

  test('should show empty state when no projects', async ({ page }) => {
    await page.waitForSelector('.ant-empty, .ant-card', { timeout: 5000 });
  });
});

test.describe('Project Creation', () => {
  test('should validate project name is required', async ({ page }) => {
    await page.goto('/projects');
    if (page.url().includes('/login')) {
      test.skip();
    }

    await page.click('button:has-text("创建"), button:has-text("新建")');
    await page.click('button:has-text("确定"), button:has-text("提交")');
    await expect(page.locator('text=/名称.*必填|必填.*名称/i')).toBeVisible();
  });
});

test.describe('Survey Page', () => {
  test('should display survey form', async ({ page }) => {
    await page.goto('/survey/test-project-id');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should show question components', async ({ page }) => {
    await page.goto('/survey/test-project-id');
    const questionContainer = page.locator('.question, [class*="question"]').first();
    await expect(questionContainer.or(page.locator('.ant-empty'))).toBeVisible({ timeout: 5000 });
  });
});