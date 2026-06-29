import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage.page';

export class CheckoutPage extends BasePage {
  // Delivery Address Locators
  readonly deliveryAddressName: Locator;
  readonly deliveryAddress1: Locator;
  readonly deliveryCityStateZip: Locator;
  readonly deliveryCountry: Locator;
  readonly deliveryPhone: Locator;

  // Billing (Invoice) Address Locators
  readonly billingAddressName: Locator;
  readonly billingAddress1: Locator;
  readonly billingCityStateZip: Locator;
  readonly billingCountry: Locator;
  readonly billingPhone: Locator;

  // Comment & Order Button
  readonly commentInput: Locator;
  readonly placeOrderButton: Locator;

  constructor(page: Page) {
    super(page);

    // Delivery Address
    this.deliveryAddressName = page.locator('#address_delivery .address_firstname.address_lastname');
    this.deliveryAddress1 = page.locator('#address_delivery .address_address1.address_address2').nth(1);
    this.deliveryCityStateZip = page.locator('#address_delivery .address_city.address_state_name.address_postcode');
    this.deliveryCountry = page.locator('#address_delivery .address_country_name');
    this.deliveryPhone = page.locator('#address_delivery .address_phone');

    // Billing Address
    this.billingAddressName = page.locator('#address_invoice .address_firstname.address_lastname');
    this.billingAddress1 = page.locator('#address_invoice .address_address1.address_address2').nth(1);
    this.billingCityStateZip = page.locator('#address_invoice .address_city.address_state_name.address_postcode');
    this.billingCountry = page.locator('#address_invoice .address_country_name');
    this.billingPhone = page.locator('#address_invoice .address_phone');

    // Message/Comment & Order
    this.commentInput = page.locator('textarea[name="message"]');
    this.placeOrderButton = page.locator('a[href="/payment"]');
  }

  async verifyAddressDetails(details: any) {
    const fullName = `${details.gender}. ${details.firstName} ${details.lastName}`;

    await expect(this.deliveryAddressName).toHaveText(fullName);
    await expect(this.deliveryAddress1).toHaveText(details.address1);
    await expect(this.deliveryCityStateZip).toContainText(details.city);
    await expect(this.deliveryCityStateZip).toContainText(details.state);
    await expect(this.deliveryCityStateZip).toContainText(details.zipcode);
    await expect(this.deliveryCountry).toHaveText(details.country);
    await expect(this.deliveryPhone).toHaveText(details.mobileNumber);

    await expect(this.billingAddressName).toHaveText(fullName);
    await expect(this.billingAddress1).toHaveText(details.address1);
    await expect(this.billingCityStateZip).toContainText(details.city);
    await expect(this.billingCityStateZip).toContainText(details.state);
    await expect(this.billingCityStateZip).toContainText(details.zipcode);
    await expect(this.billingCountry).toHaveText(details.country);
    await expect(this.billingPhone).toHaveText(details.mobileNumber);
  }

  async enterComment(comment: string) {
    await this.fill(this.commentInput, comment);
  }

  async clickPlaceOrder() {
    await this.click(this.placeOrderButton);
  }
}
