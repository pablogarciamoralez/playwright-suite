import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.page';
import { ProductsPage } from '../pages/ProductsPage.page';
import { ProductDetailsPage } from '../pages/ProductDetailsPage.page';
import { CartPage } from '../pages/CartPage.page';
import testData from '../data/testData.json';

test.describe('Cart', () => {

  test.beforeEach(async ({ page }) => {
    // Inject dummy tracking functions to prevent JS crashes when analytics are blocked
    await page.addInitScript(() => {
      (window as any).ga = (window as any).ga || (() => { });
      (window as any).gtag = (window as any).gtag || (() => { });
    });

    // Block Google Ads and analytics requests to prevent overlay click interception
    await page.route('**/*', route => {
      const url = route.request().url();
      if (
        url.includes('googleads') ||
        url.includes('doubleclick') ||
        url.includes('googlesyndication') ||
        url.includes('pagead') ||
        url.includes('adservice') ||
        url.includes('adsbygoogle') ||
        url.includes('google-analytics') ||
        url.includes('analytics')
      ) {
        route.abort();
      } else {
        route.continue();
      }
    });

    // Navigate to baseURL
    await page.goto('/');
  });

  test('Add Products in Cart', async ({ page }) => {
    const homePage = new HomePage(page);
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const { cartProducts } = testData;
    await test.step('Step 3: Verify that home page is visible successfully', async () => {
      await homePage.verifyHomePageLoaded();
    });

    await test.step('Step 4: Click on Products button', async () => {
      await homePage.clickProducts();
    });

    await test.step('Step 5: Hover over first product and click Add to cart', async () => {
      await productsPage.addProductToCart(0);
    });

    await test.step('Step 6: Click Continue Shopping button', async () => {
      await productsPage.clickContinueShopping();
    });

    await test.step('Step 7: Hover over second product and click Add to cart', async () => {
      await productsPage.addProductToCart(1);
    });

    await test.step('Step 8: Click View Cart button', async () => {
      await productsPage.clickViewCart();
    });

    await test.step('Step 9: Verify both products are added to Cart', async () => {
      await expect(page).toHaveURL(/\/view_cart/);
      await cartPage.verifyCartPageLoaded();
      const count = await cartPage.cartRows.count();
      expect(count).toBe(2);
    });

    await test.step('Step 10: Verify their prices, quantity, and total price', async () => {
      const p1 = cartProducts[0];
      await cartPage.verifyCartHasItem(p1.name, p1.price, p1.quantity, p1.total);

      const p2 = cartProducts[1];
      await cartPage.verifyCartHasItem(p2.name, p2.price, p2.quantity, p2.total);
    });
  });

  test('Verify Product quantity in Cart', async ({ page }) => {
    const homePage = new HomePage(page);
    const productDetailsPage = new ProductDetailsPage(page);
    const cartPage = new CartPage(page);
    const { quantityVerification } = testData;
    await test.step('Step 3: Verify that home page is visible successfully', async () => {
      await homePage.verifyHomePageLoaded();
    });

    await test.step('Step 4: Click View Product for any product on home page', async () => {
      await homePage.clickFirstProduct();
    });

    await test.step('Step 5: Verify product detail is opened', async () => {
      await expect(page).toHaveURL(/\/product_details\/\d+/);
      await productDetailsPage.verifyProductDetailsVisible();
    });

    await test.step('Step 6: Increase quantity to 4', async () => {
      await productDetailsPage.setQuantity(Number(quantityVerification.quantity));
    });

    await test.step('Step 7: Click Add to cart button', async () => {
      await productDetailsPage.clickAddToCart();
    });

    await test.step('Step 8: Click View Cart button', async () => {
      await productDetailsPage.clickViewCart();
    });

    await test.step('Step 9: Verify that product is displayed in cart page with exact quantity', async () => {
      await expect(page).toHaveURL(/\/view_cart/);
      await cartPage.verifyCartPageLoaded();
      await cartPage.verifyCartHasItem(
        quantityVerification.name,
        quantityVerification.price,
        quantityVerification.quantity,
        quantityVerification.total
      );
    });
  });

  test('Remove Products From Cart', async ({ page }) => {
    const homePage = new HomePage(page);
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const { cartProducts } = testData;
    await test.step('Step 3: Verify that home page is visible successfully', async () => {
      await homePage.verifyHomePageLoaded();
    });

    await test.step('Step 4: Add products to cart', async () => {
      await homePage.clickProducts();
      await productsPage.verifyProductsPageLoaded();
      await productsPage.addProductToCart(0);
      await productsPage.clickContinueShopping();
      await productsPage.addProductToCart(1);
      await productsPage.clickContinueShopping();
    });

    await test.step('Step 5: Click Cart button', async () => {
      await homePage.clickCart();
    });

    await test.step('Step 6: Verify that cart page is displayed', async () => {
      await expect(page).toHaveURL(/\/view_cart/);
      await cartPage.verifyCartPageLoaded();
    });

    await test.step('Step 7: Click X button corresponding to a particular product', async () => {
      await cartPage.removeProduct(cartProducts[0].name);
    });

    await test.step('Step 8: Verify that product is removed from the cart', async () => {
      await cartPage.verifyProductRemoved(cartProducts[0].name);
    });
  });

  test('Add to cart from Recommended items', async ({ page }) => {
    const homePage = new HomePage(page);
    const cartPage = new CartPage(page);
    await test.step('Step 3: Scroll to bottom of page', async () => {
      await homePage.scrollToFooter();
    });

    await test.step('Step 4: Verify RECOMMENDED ITEMS are visible', async () => {
      await homePage.verifyRecommendedItemsVisible();
    });

    let productName = '';
    await test.step('Step 5: Click on Add To Cart on a recommended product', async () => {
      productName = await homePage.getFirstRecommendedProductName();
      expect(productName.length).toBeGreaterThan(0);
      await homePage.addFirstRecommendedProductToCart();
    });

    await test.step('Step 6: Click on View Cart button', async () => {
      await homePage.clickViewCartModal();
    });

    await test.step('Step 7: Verify that product is displayed in cart page', async () => {
      await expect(page).toHaveURL(/\/view_cart/);
      await cartPage.verifyCartPageLoaded();
      await cartPage.verifyCartHasItemByName(productName);
    });
  });
});
