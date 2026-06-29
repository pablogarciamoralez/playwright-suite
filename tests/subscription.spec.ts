import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.page';
import { CartPage } from '../pages/CartPage.page';
import testData from '../data/testData.json';

test.describe('Subscription', () => {

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

  test('Verify Subscription in home page', async ({ page }) => {
    const homePage = new HomePage(page);
    const { subscription } = testData;
    await test.step('Step 3: Verify that home page is visible successfully', async () => {
      await homePage.verifyHomePageLoaded();
    });

    await test.step('Step 4: Scroll down to footer', async () => {
      await homePage.scrollToFooter();
    });

    await test.step('Step 5: Verify text SUBSCRIPTION', async () => {
      await expect(homePage.subscriptionHeader).toBeVisible();
      await expect(homePage.subscriptionHeader).toHaveText('Subscription');
    });

    await test.step('Step 6: Enter email address in input and click arrow button', async () => {
      await homePage.subscribe(subscription.email);
    });

    await test.step('Step 7: Verify success message You have been successfully subscribed! is visible', async () => {
      await homePage.verifySubscriptionSuccess();
      await expect(homePage.subscribeSuccessMsg).toHaveText(subscription.successMessage);
    });
  });

  test('Verify Subscription in Cart page', async ({ page }) => {
    const homePage = new HomePage(page);
    const cartPage = new CartPage(page);
    const { subscription } = testData;
    await test.step('Step 3: Verify that home page is visible successfully', async () => {
      await homePage.verifyHomePageLoaded();
    });

    await test.step('Step 4: Click Cart button', async () => {
      await homePage.clickCart();
    });

    await test.step('Step 5: Verify user is navigated to Cart page successfully', async () => {
      await expect(page).toHaveURL(/\/view_cart/);
      await cartPage.verifyCartPageLoaded();
    });

    await test.step('Step 6: Scroll down to footer', async () => {
      await cartPage.scrollToFooter();
    });

    await test.step('Step 7: Verify text SUBSCRIPTION', async () => {
      await expect(cartPage.subscriptionHeader).toBeVisible();
      await expect(cartPage.subscriptionHeader).toHaveText('Subscription');
    });

    await test.step('Step 8: Enter email address in input and click arrow button', async () => {
      await cartPage.subscribe(subscription.email);
    });

    await test.step('Step 9: Verify success message You have been successfully subscribed! is visible', async () => {
      await cartPage.verifySubscriptionSuccess();
      await expect(cartPage.subscribeSuccessMsg).toHaveText(subscription.successMessage);
    });
  });
});
