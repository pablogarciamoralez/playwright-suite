import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage.page';

export class ProductDetailsPage extends BasePage {
  readonly productName: Locator;
  readonly productCategory: Locator;
  readonly productPrice: Locator;
  readonly productAvailability: Locator;
  readonly productCondition: Locator;
  readonly productBrand: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly viewCartLink: Locator;
  readonly writeYourReviewHeader: Locator;
  readonly reviewNameInput: Locator;
  readonly reviewEmailInput: Locator;
  readonly reviewTextInput: Locator;
  readonly submitReviewButton: Locator;
  readonly reviewSuccessMsg: Locator;

  constructor(page: Page) {
    super(page);
    this.productName = page.locator('.product-information h2');
    this.productCategory = page.locator('.product-information p:has-text("Category:")');
    this.productPrice = page.locator('.product-information span span'); // Or span with text Rs.
    this.productAvailability = page.locator('.product-information p:has-text("Availability:")');
    this.productCondition = page.locator('.product-information p:has-text("Condition:")');
    this.productBrand = page.locator('.product-information p:has-text("Brand:")');
    this.quantityInput = page.locator('#quantity');
    this.addToCartButton = page.locator('.product-information button.cart');
    this.viewCartLink = page.locator('.modal-content a[href="/view_cart"]');
    this.writeYourReviewHeader = page.locator('a[href="#reviews"]');
    this.reviewNameInput = page.locator('#name');
    this.reviewEmailInput = page.locator('#email');
    this.reviewTextInput = page.locator('#review');
    this.submitReviewButton = page.locator('#button-review');
    this.reviewSuccessMsg = page.locator('span:has-text("Thank you for your review.")');
  }

  async verifyProductDetailsVisible() {
    await this.waitToBeVisible(this.productName);
    await this.waitToBeVisible(this.productCategory);
    await this.waitToBeVisible(this.productPrice);
    await this.waitToBeVisible(this.productAvailability);
    await this.waitToBeVisible(this.productCondition);
    await this.waitToBeVisible(this.productBrand);
  }

  async setQuantity(qty: number) {
    await this.fill(this.quantityInput, qty.toString());
  }

  async clickAddToCart() {
    await this.click(this.addToCartButton);
    // Wait for the modal's view cart link to be visible, or retry once
    try {
      await this.viewCartLink.waitFor({ state: 'visible', timeout: 3000 });
    } catch (e) {
      await this.click(this.addToCartButton);
      await this.viewCartLink.waitFor({ state: 'visible', timeout: 5000 });
    }
  }

  async clickViewCart() {
    await this.click(this.viewCartLink);
  }

  async verifyReviewHeaderVisible() {
    await this.waitToBeVisible(this.writeYourReviewHeader);
  }

  async submitReview(name: string, email: string, review: string) {
    await this.fill(this.reviewNameInput, name);
    await this.fill(this.reviewEmailInput, email);
    await this.fill(this.reviewTextInput, review);
    await this.click(this.submitReviewButton);
  }

  async verifyReviewSuccessVisible() {
    await this.waitToBeVisible(this.reviewSuccessMsg);
  }
}
