// Created By AI
// spec: test-artifacts/RQ-795-796-add-book.feature (Scenario-006)
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page_objects/LoginPage';
import { HomePage } from '../../page_objects/HomePage';
import { AddBookPage } from '../../page_objects/AddBookPage';

test('Verify Successful Submission With All Nine Fields Completed', async ({ page }) => {
  // Arrange
  await page.goto('/');
  const loginPage = new LoginPage(page);
  await loginPage.login('Success', 'Success3400');
  const homePage = new HomePage(page);
  await homePage.clickAddBook();
  const addBookPage = new AddBookPage(page);

  // Direct calls to api.rexjones2.com fail in this environment (a local
  // HTTPS-inspecting security proxy blocks the CORS preflight — see the
  // "Environment Note" in RQ-795-796-testing-strategy.md), so the backend
  // response is mocked here to verify the app's own success-handling
  // contract independent of that interference.
  await page.route('**/api/books', (route) =>
    route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ books: [] }) })
  );

  let dialogMessage = '';
  page.on('dialog', async (dialog) => {
    dialogMessage = dialog.message();
    await dialog.accept();
  });

  await addBookPage.fillBookForm({
    isbn: '9781234567897',
    title: 'Automation Fundamentals',
    subTitle: 'A Practical Guide',
    author: 'Jane Doe',
    publisher: 'OReilly Media',
    pages: '320',
    publishDate: '06/15/2020',
    description: 'A comprehensive guide to test automation.',
    website: 'https://example.com/automation-fundamentals',
  });

  // Act
  await addBookPage.clickSubmitButton();

  // Assert
  await expect.poll(() => dialogMessage).toBe('Success');
  await expect(addBookPage.isbnField).toHaveValue('');
});
