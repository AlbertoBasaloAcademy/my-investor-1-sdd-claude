import { test, expect } from '@playwright/test';
import { HealthPage } from '../pages/HealthPage';

const HEALTH_ROUTE = '**/api/health';

test.describe('Health check', () => {
  test('renders healthy system vitals from the live API', async ({ page }) => {
    const health = new HealthPage(page);
    await health.goto();

    await expect(health.status).toHaveText('UP');
    await expect(health.database).toHaveText('UP');
    await expect(health.uptime).toHaveText(/^\d+h \d+m \d+s$/);
    await expect(health.timestamp).not.toBeEmpty();
  });

  test('shows a loading indicator while the probe is in flight', async ({ page }) => {
    // Delay the real response so the transient loading state is observable.
    await page.route(HEALTH_ROUTE, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.continue();
    });

    const health = new HealthPage(page);
    // Resolve navigation as soon as the document commits so we observe the
    // transient loading state before the delayed probe response arrives.
    await health.goto({ waitUntil: 'commit' });

    await expect(health.loading).toBeVisible();
    await expect(health.loading).toContainText(/probing/i);

    // Once the probe resolves, the vitals replace the loading indicator.
    await expect(health.status).toHaveText('UP');
    await expect(health.loading).toHaveCount(0);
  });

  test('shows a clear error state when the probe reports the system is down', async ({ page }) => {
    await page.route(HEALTH_ROUTE, (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'DOWN',
          database: 'DOWN',
          uptime: { seconds: 0, since: '2026-05-29T10:00:00Z' },
          timestamp: '2026-05-29T11:02:05Z',
        }),
      }),
    );

    const health = new HealthPage(page);
    await health.goto();

    await expect(health.error).toBeVisible();
    await expect(health.error).not.toBeEmpty();
    await expect(health.status).toHaveCount(0);
  });

  test('shows a clear error state when the API is unreachable', async ({ page }) => {
    await page.route(HEALTH_ROUTE, (route) => route.abort('failed'));

    const health = new HealthPage(page);
    await health.goto();

    await expect(health.error).toBeVisible();
    await expect(health.error).not.toBeEmpty();
  });
});
