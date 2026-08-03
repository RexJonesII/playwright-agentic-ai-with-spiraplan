// Created By AI
// spec: test-artifacts/RQ-795-796-add-book.feature (Scenario-004)
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page_objects/LoginPage';
import { HomePage } from '../../page_objects/HomePage';
import { AddBookPage } from '../../page_objects/AddBookPage';

test('Verify Pages And Publish Date Show Distinct Validation Messages', async ({ page }) => {
  // Arrange
  await page.goto('/');
  const loginPage = new LoginPage(page);
  await loginPage.login('Success', 'Success3400');
  const homePage = new HomePage(page);
  await homePage.clickAddBook();
  const addBookPage = new AddBookPage(page);

  // Act
  await addBookPage.clickSubmitButton();

  // Assert
  await expect.soft(addBookPage.pagesError).toBeVisible();
  await expect.soft(addBookPage.publishDateError).toBeVisible();
});
