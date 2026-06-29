import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage.page';

export class HomePage extends BasePage {
  // Locators
  readonly logo: Locator;
  readonly loginNavButton: Locator;
  readonly loginHeaderNavButton: Locator;
  readonly contactUsNavButton: Locator;
  readonly productsNavButton: Locator;
  readonly cartNavButton: Locator;
  readonly logoutNavButton: Locator;
  readonly testCasesNavButton: Locator;
  readonly firstProductViewLink: Locator;
  readonly recommendedItemsHeader: Locator;
  readonly recommendedActiveProductAddToCart: Locator;
  readonly recommendedActiveProductName: Locator;
  readonly scrollUpButton: Locator;
  readonly carouselActiveText: Locator;

  constructor(page: Page) {
    super(page);
    this.logo = page.locator('.logo img');
    this.loginNavButton = page.locator('a[href="/login"]');
    this.loginHeaderNavButton = page.locator('.shop-menu a[href="/login"]');
    this.contactUsNavButton = page.locator('a[href="/contact_us"]');
    this.productsNavButton = page.locator('a[href="/products"]');
    this.cartNavButton = page.locator('a[href="/view_cart"]').first();
    this.logoutNavButton = page.locator('a[href="/logout"]');
    this.testCasesNavButton = page.locator('a[href="/test_cases"]').first();
    this.firstProductViewLink = page.locator('a[href*="/product_details/"]').first();
    this.recommendedItemsHeader = page.locator('.recommended_items h2.title');
    this.recommendedActiveProductAddToCart = page.locator('.recommended_items .item.active .add-to-cart');
    this.recommendedActiveProductName = page.locator('.recommended_items .item.active .productinfo p');
    this.scrollUpButton = page.locator('#scrollUp');
    this.carouselActiveText = page.locator('.active h2:has-text("Full-Fledged practice website for Automation Engineers")');
  }

  async verifyHomePageLoaded() {
    await this.waitToBeVisible(this.logo);
  }

  async clickSignupLogin() {
    await this.click(this.loginHeaderNavButton);
  }

  async clickContactUs() {
    await this.click(this.contactUsNavButton);
  }

  async clickProducts() {
    await this.click(this.productsNavButton);
  }

  async clickCart() {
    await this.click(this.cartNavButton);
  }

  async clickLogout() {
    await this.click(this.logoutNavButton);
  }

  async clickTestCases() {
    await this.click(this.testCasesNavButton);
  }

  async clickFirstProduct() {
    await this.click(this.firstProductViewLink);
  }

  async verifyRecommendedItemsVisible() {
    await this.waitToBeVisible(this.recommendedItemsHeader);
  }

  async getFirstRecommendedProductName(): Promise<string> {
    return (await this.recommendedActiveProductName.first().innerText()).trim();
  }

  async addFirstRecommendedProductToCart() {
    await this.click(this.recommendedActiveProductAddToCart.first());
  }

  async clickScrollUp() {
    await this.click(this.scrollUpButton);
  }

  async verifyCarouselTextVisible(expectedText: string) {
    const textLocator = this.page.locator(`.active h2:has-text("${expectedText}")`);
    await this.waitToBeVisible(textLocator);
  }
}
