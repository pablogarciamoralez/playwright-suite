import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.page';
import { LoginPage } from '../pages/LoginPage.page';
import { ProductsPage } from '../pages/ProductsPage.page';
import { CartPage } from '../pages/CartPage.page';
import { CheckoutPage } from '../pages/CheckoutPage.page';
import { PaymentPage } from '../pages/PaymentPage.page';
import testData from '../data/testData.json';

test.describe('Checkout & Orders', () => {
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

  test('Place Order: Register while Checkout', async ({ page }) => {
    const homePage = new HomePage(page);
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const loginPage = new LoginPage(page);
    const checkoutPage = new CheckoutPage(page);
    const paymentPage = new PaymentPage(page);
    const { cartProducts, paymentDetails } = testData;
    await test.step('Step 3: Verify that home page is visible successfully', async () => {
      await homePage.verifyHomePageLoaded();
    });

    await test.step('Step 4 & 5: Add products to cart and click Cart button', async () => {
      await homePage.clickProducts();
      await productsPage.verifyProductsPageLoaded();
      await productsPage.addProductToCart(0);
      await productsPage.clickContinueShopping();
      await productsPage.addProductToCart(1);
      await productsPage.clickContinueShopping();
      await homePage.clickCart();
    });

    await test.step('Step 6: Verify that cart page is displayed', async () => {
      await expect(page).toHaveURL(/\/view_cart/);
      await cartPage.verifyCartPageLoaded();
    });

    await test.step('Step 7: Click Proceed To Checkout', async () => {
      await cartPage.clickProceedToCheckout();
    });

    const uniqueEmail = `place_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;

    await test.step('Step 8 & 9: Click Register / Login button and complete registration details', async () => {
      await cartPage.clickRegisterLogin();
      await loginPage.startSignup(userDetails.name, uniqueEmail);
      await loginPage.completeRegistration(userDetails);
    });

    await test.step('Step 10: Verify ACCOUNT CREATED! and click Continue button', async () => {
      await expect(loginPage.accountCreatedHeader).toBeVisible();
      await expect(loginPage.accountCreatedHeader).toHaveText('Account Created!');
      await loginPage.click(loginPage.continueButton);
    });

    await test.step('Step 11: Verify Logged in as username at top', async () => {
      await expect(loginPage.loggedInAsUserLink).toBeVisible();
      await expect(loginPage.loggedInAsUserLink).toContainText(userDetails.name);
    });

    await test.step('Step 12 & 13: Click Cart button and click Proceed To Checkout button', async () => {
      await homePage.clickCart();
      await cartPage.clickProceedToCheckout();
    });

    await test.step('Step 14: Verify Address Details and Review Your Order', async () => {
      await checkoutPage.verifyAddressDetails(userDetails);

      const count = await cartPage.cartRows.count();
      expect(count).toBe(2);

      const p1 = cartProducts[0];
      await cartPage.verifyCartHasItem(p1.name, p1.price, p1.quantity, p1.total);

      const p2 = cartProducts[1];
      await cartPage.verifyCartHasItem(p2.name, p2.price, p2.quantity, p2.total);
    });

    await test.step('Step 15: Enter description in comment text area and click Place Order', async () => {
      await checkoutPage.enterComment('Checkout order from Antigravity agent automated test.');
      await checkoutPage.clickPlaceOrder();
    });

    await test.step('Step 16 & 17: Enter payment details and click Pay and Confirm Order button', async () => {
      await expect(page).toHaveURL(/\/payment/);
      await paymentPage.fillPaymentDetails(
        paymentDetails.nameOnCard,
        paymentDetails.cardNumber,
        paymentDetails.cvc,
        paymentDetails.expiryMonth,
        paymentDetails.expiryYear
      );
      await paymentPage.clickPayAndConfirm();
    });

    await test.step('Step 18: Verify success message Congratulations! Your order has been confirmed!', async () => {
      await expect(page).toHaveURL(/\/payment_done/);
      await paymentPage.verifyOrderConfirmed();
    });

    await test.step('Step 19: Click Delete Account button', async () => {
      await loginPage.deleteAccount();
    });

    await test.step('Step 20: Verify ACCOUNT DELETED! and click Continue button', async () => {
      await expect(loginPage.accountDeletedHeader).toBeVisible();
      await expect(loginPage.accountDeletedHeader).toHaveText('Account Deleted!');
      await loginPage.click(loginPage.continueButton);
    });
  });

  test('Place Order: Register before Checkout', async ({ page }) => {
    const homePage = new HomePage(page);
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const loginPage = new LoginPage(page);
    const checkoutPage = new CheckoutPage(page);
    const paymentPage = new PaymentPage(page);
    const { cartProducts, paymentDetails } = testData;
    await test.step('Step 3: Verify that home page is visible successfully', async () => {
      await homePage.verifyHomePageLoaded();
    });

    const uniqueEmail = `place_before_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;

    await test.step('Step 4 & 5: Click Signup / Login button and complete registration details', async () => {
      await homePage.clickSignupLogin();
      await loginPage.startSignup(userDetails.name, uniqueEmail);
      await loginPage.completeRegistration(userDetails);
    });

    await test.step('Step 6: Verify ACCOUNT CREATED! and click Continue button', async () => {
      await expect(loginPage.accountCreatedHeader).toBeVisible();
      await expect(loginPage.accountCreatedHeader).toHaveText('Account Created!');
      await loginPage.click(loginPage.continueButton);
    });

    await test.step('Step 7: Verify Logged in as username at top', async () => {
      await expect(loginPage.loggedInAsUserLink).toBeVisible();
      await expect(loginPage.loggedInAsUserLink).toContainText(userDetails.name);
    });

    await test.step('Step 8 & 9: Add products to cart and click Cart button', async () => {
      await homePage.clickProducts();
      await productsPage.verifyProductsPageLoaded();
      await productsPage.addProductToCart(0);
      await productsPage.clickContinueShopping();
      await productsPage.addProductToCart(1);
      await productsPage.clickContinueShopping();
      await homePage.clickCart();
    });

    await test.step('Step 10: Verify that cart page is displayed and click Proceed To Checkout', async () => {
      await expect(page).toHaveURL(/\/view_cart/);
      await cartPage.verifyCartPageLoaded();
      await cartPage.clickProceedToCheckout();
    });

    await test.step('Step 11: Verify Address Details and Review Your Order', async () => {
      await checkoutPage.verifyAddressDetails(userDetails);

      const count = await cartPage.cartRows.count();
      expect(count).toBe(2);

      const p1 = cartProducts[0];
      await cartPage.verifyCartHasItem(p1.name, p1.price, p1.quantity, p1.total);

      const p2 = cartProducts[1];
      await cartPage.verifyCartHasItem(p2.name, p2.price, p2.quantity, p2.total);
    });

    await test.step('Step 12: Enter description in comment text area and click Place Order', async () => {
      await checkoutPage.enterComment('Checkout order from Antigravity agent automated test (Register before checkout).');
      await checkoutPage.clickPlaceOrder();
    });

    await test.step('Step 13 & 14: Enter payment details and click Pay and Confirm Order button', async () => {
      await expect(page).toHaveURL(/\/payment/);
      await paymentPage.fillPaymentDetails(
        paymentDetails.nameOnCard,
        paymentDetails.cardNumber,
        paymentDetails.cvc,
        paymentDetails.expiryMonth,
        paymentDetails.expiryYear
      );
      await paymentPage.clickPayAndConfirm();
    });

    await test.step('Step 15: Verify success message Congratulations! Your order has been confirmed!', async () => {
      await expect(page).toHaveURL(/\/payment_done/);
      await paymentPage.verifyOrderConfirmed();
    });

    await test.step('Step 16: Click Delete Account button', async () => {
      await loginPage.deleteAccount();
    });

    await test.step('Step 17: Verify ACCOUNT DELETED! and click Continue button', async () => {
      await expect(loginPage.accountDeletedHeader).toBeVisible();
      await expect(loginPage.accountDeletedHeader).toHaveText('Account Deleted!');
      await loginPage.click(loginPage.continueButton);
    });
  });

  test('Place Order: Login before Checkout', async ({ page }) => {
    const homePage = new HomePage(page);
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const loginPage = new LoginPage(page);
    const checkoutPage = new CheckoutPage(page);
    const paymentPage = new PaymentPage(page);
    const { cartProducts, paymentDetails, checkoutComment } = testData;

    const uniqueEmail = `place_login_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;

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

    await test.step('Step 4 & 5: Click Signup / Login button and login with correct credentials', async () => {
      await homePage.clickSignupLogin();
      await loginPage.login(uniqueEmail, userDetails.password);
    });

    await test.step('Step 6: Verify Logged in as username at top', async () => {
      await expect(loginPage.loggedInAsUserLink).toBeVisible();
      await expect(loginPage.loggedInAsUserLink).toContainText(userDetails.name);
    });

    await test.step('Step 7 & 8: Add products to cart and click Cart button', async () => {
      await homePage.clickProducts();
      await productsPage.verifyProductsPageLoaded();
      await productsPage.addProductToCart(0);
      await productsPage.clickContinueShopping();
      await productsPage.addProductToCart(1);
      await productsPage.clickContinueShopping();
      await homePage.clickCart();
    });

    await test.step('Step 9: Verify that cart page is displayed and click Proceed To Checkout', async () => {
      await expect(page).toHaveURL(/\/view_cart/);
      await cartPage.verifyCartPageLoaded();
      await cartPage.clickProceedToCheckout();
    });

    await test.step('Step 11: Verify Address Details and Review Your Order', async () => {
      await checkoutPage.verifyAddressDetails(userDetails);

      const count = await cartPage.cartRows.count();
      expect(count).toBe(2);

      const p1 = cartProducts[0];
      await cartPage.verifyCartHasItem(p1.name, p1.price, p1.quantity, p1.total);

      const p2 = cartProducts[1];
      await cartPage.verifyCartHasItem(p2.name, p2.price, p2.quantity, p2.total);
    });

    await test.step('Step 12: Enter description in comment text area and click Place Order', async () => {
      await checkoutPage.enterComment(checkoutComment);
      await checkoutPage.clickPlaceOrder();
    });

    await test.step('Step 13 & 14: Enter payment details and click Pay and Confirm Order button', async () => {
      await expect(page).toHaveURL(/\/payment/);
      await paymentPage.fillPaymentDetails(
        paymentDetails.nameOnCard,
        paymentDetails.cardNumber,
        paymentDetails.cvc,
        paymentDetails.expiryMonth,
        paymentDetails.expiryYear
      );
      await paymentPage.clickPayAndConfirm();
    });

    await test.step('Step 15: Verify success message Congratulations! Your order has been confirmed!', async () => {
      await expect(page).toHaveURL(/\/payment_done/);
      await paymentPage.verifyOrderConfirmed();
    });

    await test.step('Step 16: Click Delete Account button', async () => {
      await loginPage.deleteAccount();
    });

    await test.step('Step 17: Verify ACCOUNT DELETED! and click Continue button', async () => {
      await expect(loginPage.accountDeletedHeader).toBeVisible();
      await expect(loginPage.accountDeletedHeader).toHaveText('Account Deleted!');
      await loginPage.click(loginPage.continueButton);
    });
  });

  test('Search Products and Verify Cart After Login', async ({ page }) => {
    const homePage = new HomePage(page);
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const loginPage = new LoginPage(page);
    const { searchProducts } = testData;

    const uniqueEmail = `search_login_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;

    await test.step('Setup: Register temporary user and logout', async () => {
      await homePage.clickSignupLogin();
      await loginPage.startSignup(userDetails.name, uniqueEmail);
      await loginPage.completeRegistration(userDetails);
      await loginPage.click(loginPage.continueButton);
      await homePage.clickLogout();
      await homePage.navigate('/');
    });
    await test.step('Step 3: Click on Products button', async () => {
      await homePage.clickProducts();
      await productsPage.verifyProductsPageLoaded();
    });

    await test.step('Step 4: Verify user is navigated to ALL PRODUCTS page successfully', async () => {
      await expect(page).toHaveURL(/\/products/);
    });

    const searchKeyword = searchProducts[2];
    await test.step('Step 5: Enter product name in search input and click search button', async () => {
      await productsPage.searchProduct(searchKeyword);
    });

    await test.step('Step 6: Verify SEARCHED PRODUCTS is visible', async () => {
      await productsPage.verifySearchedProductsVisible();
    });

    await test.step('Step 7: Verify all the products related to search are visible', async () => {
      await productsPage.verifyAllProductsContain(searchKeyword);
    });

    let searchedProductNames: string[] = [];
    await test.step('Step 8: Add those products to cart', async () => {
      searchedProductNames = await productsPage.getProductNames();
      expect(searchedProductNames.length).toBeGreaterThan(0);
      for (let i = 0; i < searchedProductNames.length; i++) {
        await productsPage.addProductToCart(i);
        await productsPage.clickContinueShopping();
      }
    });

    await test.step('Step 9: Click Cart button and verify that products are visible in cart', async () => {
      await homePage.clickCart();
      await expect(page).toHaveURL(/\/view_cart/);
      await cartPage.verifyCartPageLoaded();
      for (const name of searchedProductNames) {
        await cartPage.verifyCartHasItemByName(name);
      }
    });

    await test.step('Step 10: Click Signup / Login button and submit login details', async () => {
      await homePage.clickSignupLogin();
      await loginPage.login(uniqueEmail, userDetails.password);
    });

    await test.step('Step 11 & 12: Go to Cart page and verify that those products are visible in cart after login as well', async () => {
      await homePage.clickCart();
      await expect(page).toHaveURL(/\/view_cart/);
      await cartPage.verifyCartPageLoaded();
      for (const name of searchedProductNames) {
        await cartPage.verifyCartHasItemByName(name);
      }
    });
  });

  test('Verify address details in checkout page', async ({ page }) => {
    const homePage = new HomePage(page);
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const loginPage = new LoginPage(page);
    const checkoutPage = new CheckoutPage(page);

    const uniqueEmail = `address_checkout_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
    await test.step('Step 3: Verify that home page is visible successfully', async () => {
      await homePage.verifyHomePageLoaded();
    });

    await test.step('Step 4 & 5: Click Signup / Login and register a new user', async () => {
      await homePage.clickSignupLogin();
      await loginPage.startSignup(userDetails.name, uniqueEmail);
      await loginPage.completeRegistration(userDetails);
    });

    await test.step('Step 6: Verify ACCOUNT CREATED! and click Continue button', async () => {
      await expect(loginPage.accountCreatedHeader).toBeVisible();
      await expect(loginPage.accountCreatedHeader).toHaveText('Account Created!');
      await loginPage.click(loginPage.continueButton);
    });

    await test.step('Step 7: Verify Logged in as username at top', async () => {
      await expect(loginPage.loggedInAsUserLink).toBeVisible();
      await expect(loginPage.loggedInAsUserLink).toContainText(userDetails.name);
    });

    await test.step('Step 8: Add products to cart', async () => {
      await homePage.clickProducts();
      await productsPage.verifyProductsPageLoaded();
      await productsPage.addProductToCart(0);
      await productsPage.clickContinueShopping();
      await productsPage.addProductToCart(1);
      await productsPage.clickContinueShopping();
    });

    await test.step('Step 9 & 10: Click Cart button and verify that cart page is displayed', async () => {
      await homePage.clickCart();
      await expect(page).toHaveURL(/\/view_cart/);
      await cartPage.verifyCartPageLoaded();
    });

    await test.step('Step 11: Click Proceed To Checkout', async () => {
      await cartPage.clickProceedToCheckout();
    });

    await test.step('Step 12 & 13: Verify Delivery Address and Billing Address details are correct', async () => {
      await checkoutPage.verifyAddressDetails(userDetails);
    });

    await test.step('Step 14: Click Delete Account button', async () => {
      await loginPage.deleteAccount();
    });

    await test.step('Step 15: Verify ACCOUNT DELETED! and click Continue button', async () => {
      await expect(loginPage.accountDeletedHeader).toBeVisible();
      await expect(loginPage.accountDeletedHeader).toHaveText('Account Deleted!');
      await loginPage.click(loginPage.continueButton);
    });
  });

  test('Download Invoice after purchase order', async ({ page }) => {
    const homePage = new HomePage(page);
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const loginPage = new LoginPage(page);
    const checkoutPage = new CheckoutPage(page);
    const paymentPage = new PaymentPage(page);
    const { paymentDetails, checkoutComment } = testData;

    const uniqueEmail = `invoice_download_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
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

    await test.step('Step 5 & 6: Click Cart button and verify that cart page is displayed', async () => {
      await homePage.clickCart();
      await expect(page).toHaveURL(/\/view_cart/);
      await cartPage.verifyCartPageLoaded();
    });

    await test.step('Step 7: Click Proceed To Checkout', async () => {
      await cartPage.clickProceedToCheckout();
    });

    await test.step('Step 8: Click Register / Login button', async () => {
      await cartPage.clickRegisterLogin();
    });

    await test.step('Step 9 & 10: Fill all details in Signup and create account', async () => {
      await loginPage.startSignup(userDetails.name, uniqueEmail);
      await loginPage.completeRegistration(userDetails);
      await expect(loginPage.accountCreatedHeader).toBeVisible();
      await expect(loginPage.accountCreatedHeader).toHaveText('Account Created!');
      await loginPage.click(loginPage.continueButton);
    });

    await test.step('Step 11: Verify Logged in as username at top', async () => {
      await expect(loginPage.loggedInAsUserLink).toBeVisible();
      await expect(loginPage.loggedInAsUserLink).toContainText(userDetails.name);
    });

    await test.step('Step 12 & 13: Click Cart button and Proceed to Checkout', async () => {
      await homePage.clickCart();
      await cartPage.clickProceedToCheckout();
    });

    await test.step('Step 14: Verify Address Details and Review Your Order', async () => {
      await checkoutPage.verifyAddressDetails(userDetails);
    });

    await test.step('Step 15: Enter description in comment text area and click Place Order', async () => {
      await checkoutPage.enterComment(checkoutComment);
      await checkoutPage.clickPlaceOrder();
    });

    await test.step('Step 16 & 17: Fill payment details, Pay and Confirm Order, and verify confirmation message', async () => {
      await paymentPage.fillPaymentDetails(
        paymentDetails.nameOnCard,
        paymentDetails.cardNumber,
        paymentDetails.cvc,
        paymentDetails.expiryMonth,
        paymentDetails.expiryYear
      );
      await paymentPage.clickPayAndConfirm();
      await paymentPage.verifyOrderConfirmed();
    });

    await test.step('Step 18: Click Download Invoice button and verify invoice is downloaded successfully', async () => {
      const download = await paymentPage.clickDownloadInvoice();
      expect(download.suggestedFilename()).toContain('invoice');
      const path = await download.path();
      expect(path).not.toBeNull();
    });

    await test.step('Step 19: Click Delete Account button', async () => {
      await loginPage.deleteAccount();
    });

    await test.step('Step 20: Verify ACCOUNT DELETED! and click Continue', async () => {
      await expect(loginPage.accountDeletedHeader).toBeVisible();
      await expect(loginPage.accountDeletedHeader).toHaveText('Account Deleted!');
      await loginPage.click(loginPage.continueButton);
    });
  });
});
