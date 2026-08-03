// Created By AI
// spec: test-artifacts/RQ-795-796-add-book.feature (Scenario-003)
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page_objects/LoginPage';
import { HomePage } from '../../page_objects/HomePage';
import { AddBookPage } from '../../page_objects/AddBookPage';

test('Verify Partial Field Validation Only Flags Fields Left Empty', async ({ page }) => {
  // Arrange
  await page.goto('/');
  const loginPage = new LoginPage(page);
  await loginPage.login('Success', 'Success3400');
  const homePage = new HomePage(page);
  await homePage.clickAddBook();
  const addBookPage = new AddBookPage(page);

  await addBookPage.setIsbn('9781234567897');
  await addBookPage.setTitle('Automation Fundamentals');
  await addBookPage.setAuthor('Jane Doe');
  await addBookPage.setPublisher('OReilly Media');

  // Act
  await addBookPage.clickSubmitButton();

  // Assert
  await expect.soft(addBookPage.subTitleError).toBeVisible();
  await expect.soft(addBookPage.descriptionError).toBeVisible();
  await expect.soft(addBookPage.websiteError).toBeVisible();
  await expect.soft(addBookPage.isbnError).not.toBeVisible();
  await expect.soft(addBookPage.titleError).not.toBeVisible();
  await expect.soft(addBookPage.authorError).not.toBeVisible();
  await expect.soft(addBookPage.publisherError).not.toBeVisible();
});
