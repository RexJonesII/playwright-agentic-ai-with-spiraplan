// Created By AI
// spec: test-artifacts/RQ-795-796-add-book.feature (Scenario-002)
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page_objects/LoginPage';
import { HomePage } from '../../page_objects/HomePage';
import { AddBookPage } from '../../page_objects/AddBookPage';

test('Verify Empty Add Book Submission Does Not Call The Book Store API', async ({ page }) => {
  // Arrange
  await page.goto('/');
  const loginPage = new LoginPage(page);
  await loginPage.login('Success', 'Success3400');
  const homePage = new HomePage(page);
  await homePage.clickAddBook();
  const addBookPage = new AddBookPage(page);

  // Act
  // Waiting to confirm a request never arrives inherently requires a bounded
  // wait — required-field validation blocks synchronously, so 2s is ample.
  // Scoped to POST: the app fires an unrelated background GET /api/books on
  // page load, so matching any method would false-positive on that call.
  const apiRequestPromise = page
    .waitForRequest((request) => request.url().includes('/api/books') && request.method() === 'POST', { timeout: 2000 })
    .catch(() => null);
  await addBookPage.clickSubmitButton();

  // Assert
  const apiRequest = await apiRequestPromise;
  expect(apiRequest).toBeNull();
});
