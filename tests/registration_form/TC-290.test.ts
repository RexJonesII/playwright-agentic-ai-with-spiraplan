// Created By AI
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page_objects/LoginPage';
import { RegistrationPage } from '../../page_objects/RegistrationPage';

test.describe('TC-290: Registration Field Format Guardrails and Negative Validations', () => {
  test('should display required-field validation when First and Last Name are left empty', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const registrationPage = new RegistrationPage(page);

    // 1. Log into the test application via https://ui.rexjones2.com/login
    await page.goto('/');
    await loginPage.login('Success', 'Success3400');
    await expect(page).not.toHaveURL(/\/login$/);

    // 2. Navigate to the Student Registration Form
    await registrationPage.clickPracticeForm();
    await expect(registrationPage.pageHeading).toBeVisible();
    await expect(registrationPage.pageSubheading).toBeVisible();

    // 3. Leave the First Name and Last Name fields completely empty (no action)

    // 4. Enter a valid email address into the Email field
    await registrationPage.setEmail('RexAllenJones@GMail.com');

    // 5. Click the Submit button
    await registrationPage.clickSubmitButton();

    await expect(registrationPage.firstNameError).toBeVisible();
    await expect(registrationPage.lastNameError).toBeVisible();
  });
});
