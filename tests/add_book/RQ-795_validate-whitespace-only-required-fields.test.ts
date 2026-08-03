// Created By AI
// spec: test-artifacts/RQ-795-796-add-book.feature (Scenario-005)
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page_objects/LoginPage';
import { HomePage } from '../../page_objects/HomePage';
import { AddBookPage } from '../../page_objects/AddBookPage';

test('Verify Whitespace-Only Required Fields Bypass Validation @edge', async ({ page }) => {
  // Arrange
  await page.goto('/');
  const loginPage = new LoginPage(page);
  await loginPage.login('Success', 'Success3400');
  const homePage = new HomePage(page);
  await homePage.clickAddBook();
  const addBookPage = new AddBookPage(page);

  await addBookPage.setIsbn('   ');
  await addBookPage.setTitle('   ');
  await addBookPage.setSubTitle('   ');
  await addBookPage.setAuthor('   ');
  await addBookPage.setPublisher('   ');
  await addBookPage.setDescription('   ');
  await addBookPage.setWebsite('   ');
  await addBookPage.setPages('100');
  await addBookPage.setPublishDate('06/15/2020');

  // Act
  const apiRequestPromise = page.waitForRequest(/\/api\/books/);
  await addBookPage.clickSubmitButton();

  // Assert — documents a current validation gap: whitespace-only values are
  // treated as non-empty, so no "is a required field" message renders and
  // the form proceeds to call the Book Store API.
  await expect.soft(addBookPage.isbnError).not.toBeVisible();
  await expect.soft(addBookPage.titleError).not.toBeVisible();
  await expect.soft(addBookPage.subTitleError).not.toBeVisible();
  await expect.soft(addBookPage.authorError).not.toBeVisible();
  await expect.soft(addBookPage.publisherError).not.toBeVisible();
  await expect.soft(addBookPage.descriptionError).not.toBeVisible();
  await expect.soft(addBookPage.websiteError).not.toBeVisible();
  await expect(apiRequestPromise).resolves.toBeTruthy();
});
