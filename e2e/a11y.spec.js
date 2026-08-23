import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Not authenticated' }),
      });
    });
  });

  test('login page has no critical axe violations', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('#email');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter((v) => v.impact === 'critical');
    expect(critical, JSON.stringify(critical, null, 2)).toHaveLength(0);
  });

  test('skip link is present on landing', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /skip to main content/i })).toBeAttached();
  });
});