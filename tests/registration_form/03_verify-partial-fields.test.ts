import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page_objects/LoginPage';
import { RegistrationPage } from '../../page_objects/RegistrationPage';

test('Verify The Partial Fields Accept Input', async ({ page }) => {
  await page.goto('/');
  const loginPage = new LoginPage(page);
  await loginPage.login('Success', 'Success3400');

  const registrationPage = new RegistrationPage(page);
  await registrationPage.clickPracticeForm();

  await registrationPage.setFirstName('John');
  await registrationPage.setLastName('Doe');
  await registrationPage.setEmail('john.doe@example.com');

  await expect.soft(registrationPage.firstNameField).toHaveValue('John');
  await expect.soft(registrationPage.lastNameField).toHaveValue('Doe');
  await expect.soft(registrationPage.emailField).toHaveValue('john.doe@example.com');
});
