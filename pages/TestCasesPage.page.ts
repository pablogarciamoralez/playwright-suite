import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage.page';

export class TestCasesPage extends BasePage {
  readonly testCasesHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.testCasesHeader = page.locator('h2.title.text-center');
  }

  async verifyTestCasesPageLoaded() {
    await this.waitToBeVisible(this.testCasesHeader);
  }
}
