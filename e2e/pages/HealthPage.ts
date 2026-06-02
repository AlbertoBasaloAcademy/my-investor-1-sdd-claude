import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object for the health view rendered at the SPA root.
 * Exposes intent-revealing locators only; assertions live in the specs.
 */
export class HealthPage {
  readonly loading: Locator;
  readonly error: Locator;
  readonly status: Locator;
  readonly database: Locator;
  readonly uptime: Locator;
  readonly timestamp: Locator;

  constructor(private readonly page: Page) {
    this.loading = page.getByTestId('health-loading');
    this.error = page.getByTestId('health-error');
    this.status = page.getByTestId('health-status');
    this.database = page.getByTestId('health-database');
    this.uptime = page.getByTestId('health-uptime');
    this.timestamp = page.getByTestId('health-timestamp');
  }

  async goto(options?: Parameters<Page['goto']>[1]): Promise<void> {
    await this.page.goto('/', options);
  }
}
