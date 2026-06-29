import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage.page';

export class LoginPage extends BasePage {
  // Login Form Elements
  readonly loginHeader: Locator;
  readonly loginEmailInput: Locator;
  readonly loginPasswordInput: Locator;
  readonly loginButton: Locator;
  readonly loginErrorMessage: Locator;

  // Signup Form Elements
  readonly signupHeader: Locator;
  readonly signupNameInput: Locator;
  readonly signupEmailInput: Locator;
  readonly signupButton: Locator;
  readonly signupErrorMessage: Locator;

  // Registration Form Elements (Visible after submitting signup)
  readonly enterAccountInformationHeader: Locator;
  readonly genderMrRadio: Locator;
  readonly genderMrsRadio: Locator;
  readonly passwordInput: Locator;
  readonly daysSelect: Locator;
  readonly monthsSelect: Locator;
  readonly yearsSelect: Locator;
  readonly newsletterCheckbox: Locator;
  readonly optinCheckbox: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly companyInput: Locator;
  readonly address1Input: Locator;
  readonly address2Input: Locator;
  readonly countrySelect: Locator;
  readonly stateInput: Locator;
  readonly cityInput: Locator;
  readonly zipcodeInput: Locator;
  readonly mobileNumberInput: Locator;
  readonly createAccountButton: Locator;

  // Confirmation Headers
  readonly accountCreatedHeader: Locator;
  readonly continueButton: Locator;
  readonly accountDeletedHeader: Locator;
  readonly deleteAccountLink: Locator;
  readonly loggedInAsUserLink: Locator;

  constructor(page: Page) {
    super(page);

    // Login Form Locators
    this.loginHeader = page.locator('.login-form h2');
    this.loginEmailInput = page.locator('[data-qa="login-email"]');
    this.loginPasswordInput = page.locator('[data-qa="login-password"]');
    this.loginButton = page.locator('[data-qa="login-button"]');
    this.loginErrorMessage = page.locator('.login-form form p');

    // Signup Form Locators
    this.signupHeader = page.locator('.signup-form h2');
    this.signupNameInput = page.locator('[data-qa="signup-name"]');
    this.signupEmailInput = page.locator('[data-qa="signup-email"]');
    this.signupButton = page.locator('[data-qa="signup-button"]');
    this.signupErrorMessage = page.locator('.signup-form p');

    // Registration Form Locators
    this.enterAccountInformationHeader = page.locator('h2:has-text("Enter Account Information")');
    this.genderMrRadio = page.locator('#id_gender1');
    this.genderMrsRadio = page.locator('#id_gender2');
    this.passwordInput = page.locator('#password');
    this.daysSelect = page.locator('#days');
    this.monthsSelect = page.locator('#months');
    this.yearsSelect = page.locator('#years');
    this.newsletterCheckbox = page.locator('#newsletter');
    this.optinCheckbox = page.locator('#optin');
    this.firstNameInput = page.locator('#first_name');
    this.lastNameInput = page.locator('#last_name');
    this.companyInput = page.locator('#company');
    this.address1Input = page.locator('#address1');
    this.address2Input = page.locator('#address2');
    this.countrySelect = page.locator('#country');
    this.stateInput = page.locator('#state');
    this.cityInput = page.locator('#city');
    this.zipcodeInput = page.locator('#zipcode');
    this.mobileNumberInput = page.locator('#mobile_number');
    this.createAccountButton = page.locator('[data-qa="create-account"]');

    // Post-actions / Status
    this.accountCreatedHeader = page.locator('[data-qa="account-created"]');
    this.continueButton = page.locator('[data-qa="continue-button"]');
    this.accountDeletedHeader = page.locator('[data-qa="account-deleted"]');
    this.deleteAccountLink = page.locator('a[href="/delete_account"]');
    this.loggedInAsUserLink = page.locator('text=Logged in as');
  }

  async login(email: string, password: string) {
    await this.fill(this.loginEmailInput, email);
    await this.fill(this.loginPasswordInput, password);
    await this.click(this.loginButton);
  }

  async startSignup(name: string, email: string) {
    await this.fill(this.signupNameInput, name);
    await this.fill(this.signupEmailInput, email);
    await this.click(this.signupButton);
  }

  async completeRegistration(details: any) {
    // Select Gender
    if (details.gender === 'Mr') {
      await this.genderMrRadio.check();
    } else if (details.gender === 'Mrs') {
      await this.genderMrsRadio.check();
    }

    // Password
    await this.fill(this.passwordInput, details.password);

    // Date of Birth
    await this.daysSelect.selectOption(details.days);
    await this.monthsSelect.selectOption(details.months);
    await this.yearsSelect.selectOption(details.years);

    // Checkboxes
    if (details.newsletter) {
      await this.newsletterCheckbox.check();
    }
    if (details.specialOffers) {
      await this.optinCheckbox.check();
    }

    // Address Info
    await this.fill(this.firstNameInput, details.firstName);
    await this.fill(this.lastNameInput, details.lastName);
    await this.fill(this.companyInput, details.company);
    await this.fill(this.address1Input, details.address1);
    await this.fill(this.address2Input, details.address2);
    await this.countrySelect.selectOption(details.country);
    await this.fill(this.stateInput, details.state);
    await this.fill(this.cityInput, details.city);
    await this.fill(this.zipcodeInput, details.zipcode);
    await this.fill(this.mobileNumberInput, details.mobileNumber);

    // Create
    await this.click(this.createAccountButton);
  }

  async deleteAccount() {
    await this.click(this.deleteAccountLink);
  }
}
