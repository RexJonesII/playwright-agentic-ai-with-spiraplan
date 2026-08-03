import { type Page, type Locator } from '@playwright/test';

export interface AddBookFormData {
  isbn: string;
  title: string;
  subTitle: string;
  author: string;
  publisher: string;
  pages: string;
  publishDate: string;
  description: string;
  website: string;
}

export class AddBookPage {
  readonly page: Page;

  // -- Form fields
  readonly isbnField: Locator;
  readonly titleField: Locator;
  readonly subTitleField: Locator;
  readonly authorField: Locator;
  readonly publisherField: Locator;
  readonly pagesField: Locator;
  readonly publishDateField: Locator;
  readonly descriptionField: Locator;
  readonly websiteField: Locator;

  // -- Buttons
  readonly submitButton: Locator;

  // -- Validation / Error messages
  readonly isbnError: Locator;
  readonly titleError: Locator;
  readonly subTitleError: Locator;
  readonly authorError: Locator;
  readonly publisherError: Locator;
  readonly descriptionError: Locator;
  readonly websiteError: Locator;
  readonly pagesError: Locator;
  readonly publishDateError: Locator;

  constructor(page: Page) {
    this.page = page;

    this.isbnField = page.getByRole('textbox', { name: 'ISBN' });
    // exact: true — "Sub Title" contains "Title" as a substring and would
    // otherwise match this locator too.
    this.titleField = page.getByRole('textbox', { name: 'Title', exact: true });
    this.subTitleField = page.getByRole('textbox', { name: 'Sub Title' });
    this.authorField = page.getByRole('textbox', { name: 'Author' });
    this.publisherField = page.getByRole('textbox', { name: 'Publisher' });
    this.pagesField = page.getByRole('spinbutton', { name: 'Pages' });
    this.publishDateField = page.getByRole('textbox', { name: 'Publish Date' });
    this.descriptionField = page.getByRole('textbox', { name: 'Description' });
    this.websiteField = page.getByRole('textbox', { name: 'Website' });

    this.submitButton = page.getByRole('button', { name: 'Submit' });

    this.isbnError = page.getByText('ISBN is a required field');
    // exact: true — "Sub Title is a required field" contains this string as
    // a substring and would otherwise match this locator too.
    this.titleError = page.getByText('Title is a required field', { exact: true });
    this.subTitleError = page.getByText('Sub Title is a required field');
    this.authorError = page.getByText('Author is a required field');
    this.publisherError = page.getByText('Publisher is a required field');
    this.descriptionError = page.getByText('Description is a required field');
    this.websiteError = page.getByText('Website is a required field');
    this.pagesError = page.getByText('Pages must be a number');
    this.publishDateError = page.getByText('Publish Date must be a date');
  }

  public async setIsbn(isbn: string): Promise<void> {
    await this.isbnField.fill(isbn);
  }

  public async setTitle(title: string): Promise<void> {
    await this.titleField.fill(title);
  }

  public async setSubTitle(subTitle: string): Promise<void> {
    await this.subTitleField.fill(subTitle);
  }

  public async setAuthor(author: string): Promise<void> {
    await this.authorField.fill(author);
  }

  public async setPublisher(publisher: string): Promise<void> {
    await this.publisherField.fill(publisher);
  }

  public async setPages(pages: string): Promise<void> {
    await this.pagesField.fill(pages);
  }

  public async setPublishDate(publishDate: string): Promise<void> {
    await this.publishDateField.fill(publishDate);
  }

  public async setDescription(description: string): Promise<void> {
    await this.descriptionField.fill(description);
  }

  public async setWebsite(website: string): Promise<void> {
    await this.websiteField.fill(website);
  }

  public async clickSubmitButton(): Promise<void> {
    await this.submitButton.click();
  }

  public async fillBookForm(data: AddBookFormData): Promise<void> {
    await this.setIsbn(data.isbn);
    await this.setTitle(data.title);
    await this.setSubTitle(data.subTitle);
    await this.setAuthor(data.author);
    await this.setPublisher(data.publisher);
    await this.setPages(data.pages);
    await this.setPublishDate(data.publishDate);
    await this.setDescription(data.description);
    await this.setWebsite(data.website);
  }
}
