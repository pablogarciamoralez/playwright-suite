import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage.page';

export class ContactUsPage extends BasePage {
  readonly getInTouchHeader: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly subjectInput: Locator;
  readonly messageInput: Locator;
  readonly uploadFileInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly homeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.getInTouchHeader = page.locator('.contact-form h2:has-text("Get In Touch")');
    this.nameInput = page.locator('[data-qa="name"]');
    this.emailInput = page.locator('[data-qa="email"]');
    this.subjectInput = page.locator('[data-qa="subject"]');
    this.messageInput = page.locator('[data-qa="message"]');
    this.uploadFileInput = page.locator('input[name="upload_file"]');
    this.submitButton = page.locator('[data-qa="submit-button"]');
    this.successMessage = page.locator('.status.alert-success');
    this.homeButton = page.locator('#contact-page a.btn-success');
  }

  async fillForm(name: string, email: string, subject: string, message: string) {
    await this.fill(this.nameInput, name);
    await this.fill(this.emailInput, email);
    await this.fill(this.subjectInput, subject);
    await this.fill(this.messageInput, message);
  }

  async uploadFile(filePath: string) {
    await this.uploadFileInput.setInputFiles(filePath);
  }

  async clickSubmit() {
    await this.click(this.submitButton);
  }

  async clickHome() {
    await this.click(this.homeButton);
  }
}
