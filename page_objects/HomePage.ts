import { type Page, type Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly addBookLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addBookLink = page.getByRole('link', { name: 'Add Book' });
  }

  public async clickAddBook(): Promise<void> {
    await this.addBookLink.click();
  }
}
