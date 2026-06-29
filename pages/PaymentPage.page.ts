import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage.page';

export class PaymentPage extends BasePage {
  // Input Locators
  readonly nameOnCardInput: Locator;
  readonly cardNumberInput: Locator;
  readonly cvcInput: Locator;
  readonly expiryMonthInput: Locator;
  readonly expiryYearInput: Locator;

  // Buttons & Success Messages
  readonly payButton: Locator;
  readonly successHeader: Locator;
  readonly successMessageText: Locator;
  readonly continueButton: Locator;
  readonly downloadInvoiceButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameOnCardInput = page.locator('input[name="name_on_card"]');
    this.cardNumberInput = page.locator('input[name="card_number"]');
    this.cvcInput = page.locator('input[name="cvc"]');
    this.expiryMonthInput = page.locator('input[name="expiry_month"]');
    this.expiryYearInput = page.locator('input[name="expiry_year"]');

    this.payButton = page.locator('button[id="submit"]');
    this.successHeader = page.locator('[data-qa="order-placed"]');
    this.successMessageText = page.locator('p:has-text("Congratulations! Your order has been confirmed!")');
    this.continueButton = page.locator('[data-qa="continue-button"]');
    this.downloadInvoiceButton = page.locator('a[href^="/download_invoice"]');
  }

  async fillPaymentDetails(name: string, number: string, cvc: string, month: string, year: string) {
    await this.fill(this.nameOnCardInput, name);
    await this.fill(this.cardNumberInput, number);
    await this.fill(this.cvcInput, cvc);
    await this.fill(this.expiryMonthInput, month);
    await this.fill(this.expiryYearInput, year);
  }

  async clickPayAndConfirm() {
    await this.click(this.payButton);
  }

  async verifyOrderConfirmed() {
    await this.waitToBeVisible(this.successHeader);
    await expect(this.successHeader).toHaveText('Order Placed!');
    await this.waitToBeVisible(this.successMessageText);
  }

  async clickContinue() {
    await this.click(this.continueButton);
  }

  async clickDownloadInvoice() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.click(this.downloadInvoiceButton);
    const download = await downloadPromise;
    return download;
  }
}
