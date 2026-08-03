import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page_objects/LoginPage';

test('Verify Successful Login With Valid Credentials', async ({ page }) => {
  await page.goto('/'); // https://ui.rexjones2.com/login
  const loginPage = new LoginPage(page);

  await loginPage.login('Success', 'Success3400');

  await expect(page).not.toHaveURL(/\/login$/);
});
