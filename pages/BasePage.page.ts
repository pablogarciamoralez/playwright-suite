import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  protected readonly page: Page;
  readonly footer: Locator;
  readonly subscriptionHeader: Locator;
  readonly subscribeEmailInput: Locator;
  readonly subscribeButton: Locator;
  readonly subscribeSuccessMsg: Locator;
  readonly categoriesHeader: Locator;
  readonly categoryTitleHeader: Locator;
  readonly brandsHeader: Locator;
  readonly viewCartModalLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.footer = page.locator('#footer');
    this.subscriptionHeader = page.locator('#footer h2');
    this.subscribeEmailInput = page.locator('#susbscribe_email');
    this.subscribeButton = page.locator('#subscribe');
    this.subscribeSuccessMsg = page.locator('#success-subscribe');
    this.categoriesHeader = page.locator('.left-sidebar h2:has-text("Category")');
    this.categoryTitleHeader = page.locator('.features_items h2.title');
    this.brandsHeader = page.locator('.brands_products h2:has-text("Brands")');
    this.viewCartModalLink = page.locator('.modal-content a[href="/view_cart"]');
  }

  /**
   * Navigate to a path relative to the baseURL.
   * @param path URL path (e.g. '/login')
   */
  async navigate(path: string = '') {
    await this.page.goto(path);
  }

  async click(selector: string | Locator) {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.click();
  }

  async fill(selector: string | Locator, value: string) {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.fill(value);
  }

  async getText(selector: string | Locator): Promise<string> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    return (await locator.textContent()) || '';
  }

  async waitToBeVisible(selector: string | Locator) {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await expect(locator).toBeVisible();
  }

  async scrollToFooter() {
    await this.footer.scrollIntoViewIfNeeded();
  }

  async subscribe(email: string) {
    await this.fill(this.subscribeEmailInput, email);
    await this.click(this.subscribeButton);
  }

  async verifySubscriptionSuccess() {
    await this.waitToBeVisible(this.subscribeSuccessMsg);
  }

  getCategoryPanelToggle(category: string): Locator {
    return this.page.locator(`#accordian a[href="#${category}"]`);
  }

  getSubCategoryLink(category: string, subCategory: string): Locator {
    return this.page.locator(`#${category} a:has-text("${subCategory}")`);
  }

  async verifyCategoriesVisible() {
    await this.waitToBeVisible(this.categoriesHeader);
  }

  async selectSubCategory(category: string, subCategory: string) {
    const categoryLink = this.getCategoryPanelToggle(category);
    await this.click(categoryLink);

    const subCategoryLink = this.getSubCategoryLink(category, subCategory);
    await this.click(subCategoryLink);
  }

  getBrandLink(brandName: string): Locator {
    return this.page.locator(`.brands-name a:has-text("${brandName}")`);
  }

  async verifyBrandsVisible() {
    await this.waitToBeVisible(this.brandsHeader);
  }

  async selectBrand(brandName: string) {
    const brandLink = this.getBrandLink(brandName);
    await this.click(brandLink);
  }

  async clickViewCartModal() {
    await this.click(this.viewCartModalLink);
  }

  async verifySubscriptionHeaderVisible() {
    await this.waitToBeVisible(this.subscriptionHeader);
    await expect(this.subscriptionHeader).toHaveText('Subscription');
  }

  async scrollToTop() {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }
}
