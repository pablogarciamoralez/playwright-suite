import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.page';
import { LoginPage } from '../pages/LoginPage.page';
import testData from '../data/testData.json';

test.describe('Authentication & Registration', () => {
  const userDetails = testData.users[0];

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

  test('Register User', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    await test.step('Step 3: Verify that home page is visible successfully', async () => {
      await homePage.verifyHomePageLoaded();
    });

    await test.step('Step 4: Click on Signup / Login button', async () => {
      await homePage.clickSignupLogin();
    });

    await test.step('Step 5: Verify New User Signup! is visible', async () => {
      await expect(loginPage.signupHeader).toBeVisible();
      await expect(loginPage.signupHeader).toHaveText('New User Signup!');
    });

    // Generate dynamic email to avoid collision on repeated runs
    const uniqueEmail = `reg_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;

    await test.step('Step 6 & 7: Enter name, email address and click Signup button', async () => {
      await loginPage.startSignup(userDetails.name, uniqueEmail);
    });

    await test.step('Step 8: Verify that ENTER ACCOUNT INFORMATION is visible', async () => {
      await expect(loginPage.enterAccountInformationHeader).toBeVisible();
      await expect(loginPage.enterAccountInformationHeader).toHaveText('Enter Account Information');
    });

    await test.step('Step 9 to 13: Fill details, select checkboxes, and click Create Account button', async () => {
      await loginPage.completeRegistration(userDetails);
    });

    await test.step('Step 14: Verify that ACCOUNT CREATED! is visible', async () => {
      await expect(loginPage.accountCreatedHeader).toBeVisible();
      await expect(loginPage.accountCreatedHeader).toHaveText('Account Created!');
    });

    await test.step('Step 15: Click Continue button', async () => {
      await loginPage.click(loginPage.continueButton);
    });

    await test.step('Step 16: Verify that Logged in as username is visible', async () => {
      await expect(loginPage.loggedInAsUserLink).toBeVisible();
      await expect(loginPage.loggedInAsUserLink).toContainText(userDetails.name);
    });

    await test.step('Step 17: Click Delete Account button', async () => {
      await loginPage.deleteAccount();
    });

    await test.step('Step 18: Verify that ACCOUNT DELETED! is visible and click Continue button', async () => {
      await expect(loginPage.accountDeletedHeader).toBeVisible();
      await expect(loginPage.accountDeletedHeader).toHaveText('Account Deleted!');
      await loginPage.click(loginPage.continueButton);
    });
  });

  test('Login User with correct email and password', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const uniqueEmail = `login_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;

    // Setup: We register a temporary user and log out so that we have correct credentials to log in with
    await test.step('Setup: Register temporary user and logout', async () => {
      await homePage.clickSignupLogin();
      await loginPage.startSignup(userDetails.name, uniqueEmail);
      await loginPage.completeRegistration(userDetails);
      await loginPage.click(loginPage.continueButton);
      await homePage.clickLogout();
      await homePage.navigate('/');
    });
    await test.step('Step 3: Verify that home page is visible successfully', async () => {
      await homePage.verifyHomePageLoaded();
    });

    await test.step('Step 4: Click on Signup / Login button', async () => {
      await homePage.clickSignupLogin();
    });

    await test.step('Step 5: Verify Login to your account is visible', async () => {
      await expect(loginPage.loginHeader).toBeVisible();
      await expect(loginPage.loginHeader).toHaveText('Login to your account');
    });

    await test.step('Step 6 & 7: Enter correct email address and password, and click login button', async () => {
      await loginPage.login(uniqueEmail, userDetails.password);
    });

    await test.step('Step 8: Verify that Logged in as username is visible', async () => {
      await expect(loginPage.loggedInAsUserLink).toBeVisible();
      await expect(loginPage.loggedInAsUserLink).toContainText(userDetails.name);
    });

    await test.step('Step 9: Click Delete Account button', async () => {
      await loginPage.deleteAccount();
    });

    await test.step('Step 10: Verify that ACCOUNT DELETED! is visible', async () => {
      await expect(loginPage.accountDeletedHeader).toBeVisible();
      await expect(loginPage.accountDeletedHeader).toHaveText('Account Deleted!');
    });
  });

  test('Login User with incorrect email and password', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    await test.step('Step 3: Verify that home page is visible successfully', async () => {
      await homePage.verifyHomePageLoaded();
    });

    await test.step('Step 4: Click on Signup / Login button', async () => {
      await homePage.clickSignupLogin();
    });

    await test.step('Step 5: Verify Login to your account is visible', async () => {
      await expect(loginPage.loginHeader).toBeVisible();
      await expect(loginPage.loginHeader).toHaveText('Login to your account');
    });

    await test.step('Step 6 & 7: Enter incorrect email address and password, and click login button', async () => {
      await loginPage.login(testData.invalidUser.email, testData.invalidUser.password);
    });

    await test.step('Step 8: Verify error Your email or password is incorrect! is visible', async () => {
      await expect(loginPage.loginErrorMessage).toBeVisible();
      await expect(loginPage.loginErrorMessage).toHaveText('Your email or password is incorrect!');
    });
  });

  test('Logout User', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const uniqueEmail = `logout_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;

    // Setup: We register a temporary user and log out so that we have correct credentials to log in with
    await test.step('Setup: Register temporary user and logout', async () => {
      await homePage.clickSignupLogin();
      await loginPage.startSignup(userDetails.name, uniqueEmail);
      await loginPage.completeRegistration(userDetails);
      await loginPage.click(loginPage.continueButton);
      await homePage.clickLogout();
      await homePage.navigate('/');
    });
    await test.step('Step 3: Verify that home page is visible successfully', async () => {
      await homePage.verifyHomePageLoaded();
    });

    await test.step('Step 4: Click on Signup / Login button', async () => {
      await homePage.clickSignupLogin();
    });

    await test.step('Step 5: Verify Login to your account is visible', async () => {
      await expect(loginPage.loginHeader).toBeVisible();
      await expect(loginPage.loginHeader).toHaveText('Login to your account');
    });

    await test.step('Step 6 & 7: Enter correct email address and password, and click login button', async () => {
      await loginPage.login(uniqueEmail, userDetails.password);
    });

    await test.step('Step 8: Verify that Logged in as username is visible', async () => {
      await expect(loginPage.loggedInAsUserLink).toBeVisible();
      await expect(loginPage.loggedInAsUserLink).toContainText(userDetails.name);
    });

    await test.step('Step 9: Click Logout button', async () => {
      await homePage.clickLogout();
    });

    await test.step('Step 10: Verify that user is navigated to login page', async () => {
      await expect(page).toHaveURL(/\/login/);
      await expect(loginPage.loginHeader).toBeVisible();
      await expect(loginPage.loginHeader).toHaveText('Login to your account');
    });
  });

  test('Register User with existing email', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const uniqueEmail = `duplicate_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;

    // Setup: We register a temporary user and log out so that we have an existing email to test duplication
    await test.step('Setup: Register temporary user and logout', async () => {
      await homePage.clickSignupLogin();
      await loginPage.startSignup(userDetails.name, uniqueEmail);
      await loginPage.completeRegistration(userDetails);
      await loginPage.click(loginPage.continueButton);
      await homePage.clickLogout();
      await homePage.navigate('/');
    });
    await test.step('Step 3: Verify that home page is visible successfully', async () => {
      await homePage.verifyHomePageLoaded();
    });

    await test.step('Step 4: Click on Signup / Login button', async () => {
      await homePage.clickSignupLogin();
    });

    await test.step('Step 5: Verify New User Signup! is visible', async () => {
      await expect(loginPage.signupHeader).toBeVisible();
      await expect(loginPage.signupHeader).toHaveText('New User Signup!');
    });

    await test.step('Step 6 & 7: Enter name and already registered email address, and click Signup button', async () => {
      await loginPage.startSignup(userDetails.name, uniqueEmail);
    });

    await test.step('Step 8: Verify error Email Address already exist! is visible', async () => {
      await expect(loginPage.signupErrorMessage).toBeVisible();
      await expect(loginPage.signupErrorMessage).toHaveText('Email Address already exist!');
    });
  });
});
