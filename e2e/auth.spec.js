import { test, expect } from '@playwright/test';

const session401 = (route) => route.fulfill({
  status: 401,
  contentType: 'application/json',
  body: JSON.stringify({ message: 'Not authenticated' }),
});

test.describe('Auth flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      if (url.includes('/auth/session')) return session401(route);
      if (url.includes('/auth/login') && method === 'POST') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ user: { id: 1, name: 'Test Scholar', role: 'student' } }),
        });
      }
      if (method === 'GET') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
  });

  test('redirects unauthenticated users from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('login succeeds and lands on dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill('scholar@must.edu');
    await page.locator('#password').fill('SecurePass1!');
    await page.getByRole('button', { name: /access academy/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });
});