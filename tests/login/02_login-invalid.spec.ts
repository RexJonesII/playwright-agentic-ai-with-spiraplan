import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page_objects/LoginPage';

test('Verify Login Is Not Successful With Invalid Credentials', async ({ page }) => {
  await page.goto('/'); // https://ui.rexjones2.com/login
  const loginPage = new LoginPage(page);

  await loginPage.login('InvalidUser', 'WrongPassword');

  await expect(page).toHaveURL(/\/login/);
});
