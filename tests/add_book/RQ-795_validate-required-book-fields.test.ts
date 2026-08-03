// Created By AI
// spec: test-artifacts/RQ-795-796-add-book.feature (Scenario-001)
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page_objects/LoginPage';
import { HomePage } from '../../page_objects/HomePage';
import { AddBookPage } from '../../page_objects/AddBookPage';

test('Verify Required Field Validation On Empty Add Book Submission', async ({ page }) => {
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
  await expect.soft(addBookPage.isbnError).toBeVisible();
  await expect.soft(addBookPage.titleError).toBeVisible();
  await expect.soft(addBookPage.subTitleError).toBeVisible();
  await expect.soft(addBookPage.authorError).toBeVisible();
  await expect.soft(addBookPage.publisherError).toBeVisible();
  await expect.soft(addBookPage.descriptionError).toBeVisible();
  await expect.soft(addBookPage.websiteError).toBeVisible();
});
