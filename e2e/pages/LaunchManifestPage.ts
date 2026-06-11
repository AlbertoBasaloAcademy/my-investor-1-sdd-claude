import { type Page, type Locator } from '@playwright/test';

export class LaunchManifestPage {
  readonly loading: Locator;
  readonly error: Locator;
  readonly empty: Locator;
  readonly addLaunchBtn: Locator;
  readonly formError: Locator;
  readonly rocketSelect: Locator;
  readonly scheduledAtInput: Locator;
  readonly priceInput: Locator;
  readonly occupancyInput: Locator;
  readonly submitBtn: Locator;
  readonly cancelFormBtn: Locator;
  readonly confirmedLaunchesEmpty: Locator;

  constructor(private readonly page: Page) {
    this.loading = page.getByTestId('launches-loading');
    this.error = page.getByTestId('launches-error');
    this.empty = page.getByTestId('launches-empty');
    this.addLaunchBtn = page.getByTestId('btn-add-launch');
    this.formError = page.getByTestId('form-error');
    this.rocketSelect = page.getByTestId('select-rocket');
    this.scheduledAtInput = page.getByTestId('input-scheduled-at');
    this.priceInput = page.getByTestId('input-price');
    this.occupancyInput = page.getByTestId('input-occupancy');
    this.submitBtn = page.getByTestId('btn-submit');
    this.cancelFormBtn = page.getByTestId('btn-cancel');
    this.confirmedLaunchesEmpty = page.getByTestId('confirmed-launches-empty');
  }

  launchRow(id: string): Locator {
    return this.page.getByTestId(`launch-row-${id}`);
  }

  confirmBtn(id: string): Locator {
    return this.page.getByTestId(`btn-confirm-${id}`);
  }

  cancelLaunchBtn(id: string): Locator {
    return this.page.getByTestId(`btn-cancel-${id}`);
  }

  availableLaunch(id: string): Locator {
    return this.page.getByTestId(`available-launch-${id}`);
  }

  async goto(options?: Parameters<Page['goto']>[1]): Promise<void> {
    await this.page.goto('/', options);
  }
}
