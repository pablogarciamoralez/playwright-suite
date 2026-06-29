import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.page';
import { ContactUsPage } from '../pages/ContactUsPage.page';
import { TestCasesPage } from '../pages/TestCasesPage.page';
import testData from '../data/testData.json';

test.describe('Contact & Information', () => {

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

  test('Contact Us Form', async ({ page }) => {
    const homePage = new HomePage(page);
    const contactUsPage = new ContactUsPage(page);
    const { contactUs } = testData;
    await test.step('Step 3: Verify that home page is visible successfully', async () => {
      await homePage.verifyHomePageLoaded();
    });

    await test.step('Step 4: Click on Contact Us button', async () => {
      await homePage.clickContactUs();
    });

    await test.step('Step 5: Verify GET IN TOUCH is visible', async () => {
      await expect(contactUsPage.getInTouchHeader).toBeVisible();
    });

    await test.step('Step 6: Enter name, email, subject and message', async () => {
      await contactUsPage.fillForm(contactUs.name, contactUs.email, contactUs.subject, contactUs.message);
    });

    await test.step('Step 7: Upload file', async () => {
      const absolutePath = require('path').resolve(contactUs.filePath);
      await contactUsPage.uploadFile(absolutePath);
      await page.waitForTimeout(1000);
    });

    await test.step('Step 8 & 9: Click Submit button and Click OK button', async () => {
      // Set up dialog listener to automatically click OK on the alert dialog
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('Press OK to proceed'); // verify dialog message
        await dialog.accept();
      });
      await contactUsPage.clickSubmit();
    });

    await test.step('Step 10: Verify success message Success! Your details have been submitted successfully. is visible', async () => {
      await expect(contactUsPage.successMessage).toHaveText('Success! Your details have been submitted successfully.', { timeout: 10000 });
      await expect(contactUsPage.successMessage).toBeVisible();
    });

    await test.step('Step 11: Click Home button and verify that landed to home page successfully', async () => {
      await contactUsPage.clickHome();
      await homePage.verifyHomePageLoaded();
      await expect(page).toHaveURL('https://automationexercise.com/');
    });
  });

  test('Verify Test Cases Page', async ({ page }) => {
    const homePage = new HomePage(page);
    const testCasesPage = new TestCasesPage(page);
    await test.step('Step 3: Verify that home page is visible successfully', async () => {
      await homePage.verifyHomePageLoaded();
    });

    await test.step('Step 4: Click on Test Cases button', async () => {
      await homePage.clickTestCases();
    });

    await test.step('Step 5: Verify user is navigated to test cases page successfully', async () => {
      await expect(page).toHaveURL(/\/test_cases/);
      await testCasesPage.verifyTestCasesPageLoaded();
      await expect(testCasesPage.testCasesHeader).toContainText('Test Cases');
    });
  });
});
