import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage.page';
import testData from '../data/testData.json';

test.describe('UI Interactions', () => {

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

  test('Verify Scroll Up using \'Arrow\' button and Scroll Down functionality', async ({ page }) => {
    const homePage = new HomePage(page);
    const { carousel } = testData;
    await test.step('Step 3: Verify that home page is visible successfully', async () => {
      await homePage.verifyHomePageLoaded();
    });

    await test.step('Step 4: Scroll down page to bottom', async () => {
      await homePage.scrollToFooter();
    });

    await test.step('Step 5: Verify SUBSCRIPTION is visible', async () => {
      await homePage.verifySubscriptionHeaderVisible();
    });

    await test.step('Step 6: Click on arrow at bottom right side to move upward', async () => {
      await homePage.clickScrollUp();
    });

    await test.step('Step 7: Verify that page is scrolled up and expected text is visible on screen', async () => {
      await homePage.verifyCarouselTextVisible(carousel.headerText);
    });
  });

  test('Verify Scroll Up without \'Arrow\' button and Scroll Down functionality', async ({ page }) => {
    const homePage = new HomePage(page);
    const { carousel } = testData;
    await test.step('Step 3: Verify that home page is visible successfully', async () => {
      await homePage.verifyHomePageLoaded();
    });

    await test.step('Step 4: Scroll down page to bottom', async () => {
      await homePage.scrollToFooter();
    });

    await test.step('Step 5: Verify SUBSCRIPTION is visible', async () => {
      await homePage.verifySubscriptionHeaderVisible();
    });

    await test.step('Step 6: Scroll up page to top', async () => {
      await homePage.scrollToTop();
    });

    await test.step('Step 7: Verify that page is scrolled up and expected text is visible on screen', async () => {
      await homePage.verifyCarouselTextVisible(carousel.headerText);
    });
  });
});
