// Created By AI
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page_objects/LoginPage';
import { RegistrationPage } from '../../page_objects/RegistrationPage';

test('Verify Successful Submission With All Required Fields Completed', async ({ page }) => {
  await page.goto('/');
  const loginPage = new LoginPage(page);
  await loginPage.login('Success', 'Success3400');

  const registrationPage = new RegistrationPage(page);
  await registrationPage.clickPracticeForm();

  await registrationPage.setFirstName('Jane');
  await registrationPage.setLastName('Doe');
  await registrationPage.selectGender('Male');
  await registrationPage.checkProgrammingLanguage('Java');
  await registrationPage.clickSubmitButton();

  await expect(registrationPage.confirmationDialog).toBeVisible();
  await expect(registrationPage.confirmationDialogTitle).toBeVisible();
});
