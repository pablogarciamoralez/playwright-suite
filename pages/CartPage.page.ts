import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage.page';

export class CartPage extends BasePage {
  readonly cartBreadcrumb: Locator;
  readonly cartRows: Locator;
  readonly proceedToCheckoutButton: Locator;
  readonly registerLoginLink: Locator;

  constructor(page: Page) {
    super(page);
    this.cartBreadcrumb = page.locator('.breadcrumb .active');
    this.cartRows = page.locator('#cart_info table tbody tr[id^="product-"]');
    this.proceedToCheckoutButton = page.locator('.check_out');
    this.registerLoginLink = page.locator('.modal-body a[href="/login"]');
  }

  async verifyCartPageLoaded() {
    await this.waitToBeVisible(this.cartBreadcrumb);
  }

  async verifyCartHasItem(name: string, price: string, quantity: string, total: string) {
    const row = this.cartRows.filter({ hasText: name });
    await expect(row).toBeVisible();
    await expect(row.locator('.cart_price p')).toHaveText(price);
    await expect(row.locator('.cart_quantity button')).toHaveText(quantity);
    await expect(row.locator('.cart_total_price')).toHaveText(total);
  }

  async clickProceedToCheckout() {
    await this.click(this.proceedToCheckoutButton);
  }

  async clickRegisterLogin() {
    await this.click(this.registerLoginLink);
  }

  async removeProduct(name: string) {
    const row = this.cartRows.filter({ hasText: name });
    await this.click(row.locator('.cart_quantity_delete'));
  }

  async verifyProductRemoved(name: string) {
    const row = this.cartRows.filter({ hasText: name });
    await expect(row).toBeHidden();
  }

  async verifyCartHasItemByName(name: string) {
    const row = this.cartRows.filter({ hasText: name });
    await expect(row).toBeVisible();
  }
}
