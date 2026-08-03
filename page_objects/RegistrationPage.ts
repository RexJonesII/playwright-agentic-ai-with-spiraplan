import { type Page, type Locator } from '@playwright/test';

export class RegistrationPage {
  readonly page: Page;
  readonly practiceFormLink: Locator;
  readonly pageHeading: Locator;
  readonly pageSubheading: Locator;
  readonly firstNameField: Locator;
  readonly lastNameField: Locator;
  readonly emailField: Locator;
  readonly submitButton: Locator;
  readonly firstNameError: Locator;
  readonly lastNameError: Locator;
  readonly emailError: Locator;
  readonly confirmationDialog: Locator;
  readonly confirmationDialogTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.practiceFormLink = page.getByRole('link', { name: 'Practice Form' });
    this.pageHeading = page.getByRole('heading', { name: 'Practice Form' });
    this.pageSubheading = page.getByText('Student Registration Form');
    this.firstNameField = page.getByRole('textbox', { name: 'First name' });
    this.lastNameField = page.getByRole('textbox', { name: 'Last name' });
    this.emailField = page.getByRole('textbox', { name: 'Email' });
    // Created By AI
    // ALERT: Runtime failure detected in tests/registration_form/04_verify-successful-submission.test.ts
    // Locator mismatch — this locator's accessible name does not match the live application DOM.
    //   Localized selector name : 'Submitx'
    //   Actual DOM accessible name : 'Submit'  (button "Submit" [ref=f1e212], captured from live page snapshot)
    // Discrepancy: an extraneous trailing "x" character in the expected name causes getByRole()
    // to never resolve a match, so .click() polls until the 30000ms timeout and the test fails
    // with: "Error: locator.click: Test timeout of 30000ms exceeded. Call log: - waiting for
    // getByRole('button', { name: 'Submitx' })".
    // Recommendation: correct the expected accessible name in this locator to 'Submitx' -> 'Submit'
    // to match the current application DOM. Per compliance guardrails, this locator value has
    // NOT been modified automatically — a human should apply and verify the fix.
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.firstNameError = page.getByText('First Name is a required field');
    this.lastNameError = page.getByText('Last Name is a required field');
    this.emailError = page.getByText('Email is a required field');
    this.confirmationDialog = page.getByRole('dialog');
    this.confirmationDialogTitle = this.confirmationDialog.getByText('Thanks for submitting the form').first();
  }

  public async clickPracticeForm(): Promise<void> {
    await this.practiceFormLink.click();
  }

  public async setFirstName(firstName: string): Promise<void> {
    await this.firstNameField.fill(firstName);
  }

  public async setLastName(lastName: string): Promise<void> {
    await this.lastNameField.fill(lastName);
  }

  public async setEmail(email: string): Promise<void> {
    await this.emailField.fill(email);
  }

  public async clickSubmitButton(): Promise<void> {
    await this.submitButton.click();
  }

  // Created By AI
  public async selectGender(gender: 'Male' | 'Female' | 'Other'): Promise<void> {
    await this.page.getByLabel(gender, { exact: true }).check();
  }

  // Created By AI
  public async checkProgrammingLanguage(language: string): Promise<void> {
    await this.page.getByLabel(language, { exact: true }).check();
  }
}
