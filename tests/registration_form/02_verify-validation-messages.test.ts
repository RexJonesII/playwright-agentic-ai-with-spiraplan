import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page_objects/LoginPage';
import { RegistrationPage } from '../../page_objects/RegistrationPage';

test('Verify Validation Messages For Mandatory Fields', async ({ page }) => {
  await page.goto('/');
  const loginPage = new LoginPage(page);
  await loginPage.login('Success', 'Success3400');

  const registrationPage = new RegistrationPage(page);
  await registrationPage.clickPracticeForm();
  await registrationPage.clickSubmitButton();

  await expect.soft(registrationPage.firstNameError).toBeVisible();
  await expect.soft(registrationPage.lastNameError).toBeVisible();
  await expect.soft(registrationPage.emailError).toBeVisible();
});
