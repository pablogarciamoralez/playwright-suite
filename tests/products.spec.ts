import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage.page';
import { ProductsPage } from '../pages/ProductsPage.page';
import { ProductDetailsPage } from '../pages/ProductDetailsPage.page';
import testData from '../data/testData.json';

test.describe('Products', () => {

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

  test('Verify All Products and product detail page', async ({ page }) => {
    const homePage = new HomePage(page);
    const productsPage = new ProductsPage(page);
    const productDetailsPage = new ProductDetailsPage(page);
    const { expectedLabels } = testData.productDetails;
    await test.step('Step 3: Verify that home page is visible successfully', async () => {
      await homePage.verifyHomePageLoaded();
    });

    await test.step('Step 4: Click on Products button', async () => {
      await homePage.clickProducts();
    });

    await test.step('Step 5: Verify user is navigated to ALL PRODUCTS page successfully', async () => {
      await expect(page).toHaveURL(/\/products/);
      await productsPage.verifyProductsPageLoaded();
    });

    await test.step('Step 6: The products list is visible', async () => {
      await expect(productsPage.productsList).toBeVisible();
    });

    await test.step('Step 7: Click on View Product of first product', async () => {
      await productsPage.clickFirstViewProduct();
    });

    await test.step('Step 8: User is landed to product detail page', async () => {
      await expect(page).toHaveURL(/\/product_details\/\d+/);
    });

    await test.step('Step 9: Verify that product detail is visible: name, category, price, availability, condition, brand', async () => {
      await productDetailsPage.verifyProductDetailsVisible();

      // DDT checks using parameters loaded from testData.json
      await expect(productDetailsPage.productCategory).toContainText(expectedLabels.category);
      await expect(productDetailsPage.productAvailability).toContainText(expectedLabels.availability);
      await expect(productDetailsPage.productCondition).toContainText(expectedLabels.condition);
      await expect(productDetailsPage.productBrand).toContainText(expectedLabels.brand);
    });
  });

  test('Search Product', async ({ page }) => {
    const homePage = new HomePage(page);
    const productsPage = new ProductsPage(page);
    const searchKeyword = testData.searchProducts[0]; // e.g. "t-shirt"
    await test.step('Step 3: Verify that home page is visible successfully', async () => {
      await homePage.verifyHomePageLoaded();
    });

    await test.step('Step 4: Click on Products button', async () => {
      await homePage.clickProducts();
    });

    await test.step('Step 5: Verify user is navigated to ALL PRODUCTS page successfully', async () => {
      await expect(page).toHaveURL(/\/products/);
      await productsPage.verifyProductsPageLoaded();
    });

    await test.step('Step 6: Enter product name in search input and click search button', async () => {
      await productsPage.searchProduct(searchKeyword);
    });

    await test.step('Step 7: Verify SEARCHED PRODUCTS is visible', async () => {
      await productsPage.verifySearchedProductsVisible();
    });

    await test.step('Step 8: Verify all the products related to search are visible', async () => {
      await productsPage.verifyAllProductsContain(searchKeyword);
    });
  });

  test('View Category Products', async ({ page }) => {
    const homePage = new HomePage(page);
    const { categories } = testData;
    await test.step('Step 3: Verify that categories are visible on left side bar', async () => {
      await homePage.verifyCategoriesVisible();
    });

    await test.step('Step 4 & 5: Click on Women category and click Dress subcategory', async () => {
      await homePage.selectSubCategory(categories.women.name, categories.women.subcategory);
    });

    await test.step('Step 6: Verify that category page is displayed and confirm text WOMEN - DRESS PRODUCTS', async () => {
      await expect(page).toHaveURL(new RegExp(categories.women.urlPath));
      await expect(homePage.categoryTitleHeader).toBeVisible();
      await expect(homePage.categoryTitleHeader).toHaveText(new RegExp(categories.women.expectedTitle, 'i'));
    });

    await test.step('Step 7 & 8: Click on any sub-category link of Men category, and verify navigation', async () => {
      await homePage.selectSubCategory(categories.men.name, categories.men.subcategory);
      await expect(page).toHaveURL(new RegExp(categories.men.urlPath));
      await expect(homePage.categoryTitleHeader).toBeVisible();
      await expect(homePage.categoryTitleHeader).toHaveText(new RegExp(categories.men.expectedTitle, 'i'));
    });
  });

  test('View & Cart Brand Products', async ({ page }) => {
    const homePage = new HomePage(page);
    const productsPage = new ProductsPage(page);
    const { brands } = testData;
    await test.step('Step 3: Click on Products button', async () => {
      await homePage.clickProducts();
      await productsPage.verifyProductsPageLoaded();
    });

    await test.step('Step 4: Verify that Brands are visible on left side bar', async () => {
      await productsPage.verifyBrandsVisible();
    });

    await test.step('Step 5: Click on any brand name', async () => {
      await productsPage.selectBrand(brands.polo.name);
    });

    await test.step('Step 6: Verify that user is navigated to brand page and brand products are displayed', async () => {
      await expect(page).toHaveURL(new RegExp(brands.polo.urlPath));
      await expect(productsPage.categoryTitleHeader).toBeVisible();
      await expect(productsPage.categoryTitleHeader).toHaveText(new RegExp(brands.polo.expectedTitle, 'i'));
    });

    await test.step('Step 7 & 8: Click on any other brand link, and verify navigation and products', async () => {
      await productsPage.selectBrand(brands.hm.name);
      await expect(page).toHaveURL(new RegExp(brands.hm.urlPathRegex));
      await expect(productsPage.categoryTitleHeader).toBeVisible();
      await expect(productsPage.categoryTitleHeader).toHaveText(new RegExp(brands.hm.expectedTitle, 'i'));
    });
  });

  test('Add review on product', async ({ page }) => {
    const homePage = new HomePage(page);
    const productsPage = new ProductsPage(page);
    const productDetailsPage = new ProductDetailsPage(page);
    const { productReview } = testData;
    await test.step('Step 3: Click on Products button', async () => {
      await homePage.clickProducts();
      await productsPage.verifyProductsPageLoaded();
    });

    await test.step('Step 4: Verify user is navigated to ALL PRODUCTS page successfully', async () => {
      await expect(page).toHaveURL(/\/products/);
    });

    await test.step('Step 5: Click on View Product button', async () => {
      await productsPage.clickFirstViewProduct();
    });

    await test.step('Step 6: Verify Write Your Review is visible', async () => {
      await productDetailsPage.verifyReviewHeaderVisible();
    });

    await test.step('Step 7 & 8: Enter name, email and review, and click Submit button', async () => {
      await productDetailsPage.submitReview(
        productReview.name,
        productReview.email,
        productReview.comment
      );
    });

    await test.step('Step 9: Verify success message Thank you for your review.', async () => {
      await productDetailsPage.verifyReviewSuccessVisible();
    });
  });
});
