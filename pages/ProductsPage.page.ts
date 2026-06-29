import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage.page';

export class ProductsPage extends BasePage {
  readonly allProductsHeader: Locator;
  readonly productsList: Locator;
  readonly firstProductViewLink: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchedProductsHeader: Locator;
  readonly productItems: Locator;
  readonly continueShoppingButton: Locator;
  readonly viewCartLink: Locator;

  constructor(page: Page) {
    super(page);
    this.allProductsHeader = page.locator('h2.title.text-center:has-text("All Products")');
    this.productsList = page.locator('.features_items');
    this.firstProductViewLink = page.locator('a[href*="/product_details/"]').first();
    this.searchInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');
    this.searchedProductsHeader = page.locator('.features_items > h2.title');
    this.productItems = page.locator('.features_items .col-sm-4');
    this.continueShoppingButton = page.locator('button.close-modal');
    this.viewCartLink = page.locator('.modal-content a[href="/view_cart"]');
  }

  async verifyProductsPageLoaded() {
    await this.waitToBeVisible(this.allProductsHeader);
    await this.waitToBeVisible(this.productsList);
  }

  async clickFirstViewProduct() {
    await this.click(this.firstProductViewLink);
  }

  async searchProduct(productName: string) {
    await this.fill(this.searchInput, productName);
    await this.click(this.searchButton);
  }

  async verifySearchedProductsVisible() {
    await this.waitToBeVisible(this.searchedProductsHeader);
  }

  async verifyAllProductsContain(searchKeyword: string) {
    await expect(this.productItems.first()).toBeVisible();
    const count = await this.productItems.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const itemText = await this.productItems.nth(i).innerText();
      expect(itemText.toLowerCase()).toContain(searchKeyword.toLowerCase());
    }
  }

  async addProductToCart(index: number) {
    const productCard = this.productItems.nth(index);
    const overlayAddToCartBtn = productCard.locator('.product-overlay .add-to-cart');
    await productCard.hover();

    // Click the add to cart button
    await this.click(overlayAddToCartBtn);

    // Wait for the modal's continue shopping button to be visible, or retry once
    try {
      await this.continueShoppingButton.waitFor({ state: 'visible', timeout: 3000 });
    } catch (e) {
      // Retry hover and click in case the event listener wasn't ready
      await productCard.hover();
      await this.click(overlayAddToCartBtn);
      await this.continueShoppingButton.waitFor({ state: 'visible', timeout: 5000 });
    }
  }

  async clickContinueShopping() {
    await this.click(this.continueShoppingButton);
  }

  async clickViewCart() {
    await this.click(this.viewCartLink);
  }

  async getProductNames(): Promise<string[]> {
    const count = await this.productItems.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const name = await this.productItems.nth(i).locator('.productinfo p').innerText();
      names.push(name.trim());
    }
    return names;
  }
}
