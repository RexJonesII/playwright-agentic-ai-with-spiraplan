---
name: pom-creation
description: Architectural blueprint for building and extending Playwright Page Object Models for the automation practice form at https://ui.rexjones2.com/automation-practice-form.
allowed-tools: Bash(npx:*) Bash(playwright-cli:*)
---

# Page Object Model (POM) Creation Skill

## Overview

This skill defines the conventions, patterns, and architectural guidelines for creating and extending Playwright Page Object Models in this project. All POM classes target the application at `https://ui.rexjones2.com` with the primary form under test at `/automation-practice-form`.

## Target Application

- **Base URL:** `https://ui.rexjones2.com/login`
- **Practice Form URL:** `https://ui.rexjones2.com/automation-practice-form`
- **Authentication:** Login required (Username + Password) before accessing the practice form
- **Form Name:** Student Registration Form

## Practice Form Fields

| Field | Type | Notes |
|-------|------|-------|
| First name | Text input | Required, validation message on empty submit |
| Last name | Text input | Required, validation message on empty submit |
| Gender | Radio button | Male / Female / Other |
| Mobile (10 Digits) | Text input | Numeric, 10-digit constraint |
| Email | Text input | Required, validation message on empty submit |
| Date of birth | Date picker | Calendar-based selection |
| Current Address | Textarea | Multi-line text |
| Programming language | Checkbox / Multi-select | Language options |
| State | Dropdown / Select | State selection |
| City | Dropdown / Select | City selection (dependent on State) |
| Submit | Button | Form submission trigger |

## Project Structure

```
project-root/
├── page_objects/           # All POM classes live here
│   ├── LoginPage.ts
│   ├── RegistrationPage.ts
│   └── <NewPage>.ts
├── tests/
│   ├── login/
│   │   ├── 01_login-valid.spec.ts
│   │   └── 02_login-invalid.spec.ts
│   └── registration_form/
│       ├── 01_verify-page-title.test.ts
│       ├── 02_verify-validation-messages.test.ts
│       └── 03_verify-partial-fields.test.ts
└── playwright.config.ts
```

## POM Class Architecture

### File Naming Convention

- Use **PascalCase** for file names: `LoginPage.ts`, `RegistrationPage.ts`
- Suffix with `Page` for full-page POMs: `CheckoutPage.ts`
- Suffix with `Component` for reusable UI fragments: `NavigationComponent.ts`

### Class Structure Template

```typescript
import { type Page, type Locator } from '@playwright/test';

export class PageName {
  // 1. Page instance (always first)
  readonly page: Page;

  // 2. Locators grouped by UI section
  // -- Navigation / Header
  readonly navElement: Locator;

  // -- Form fields
  readonly inputField: Locator;

  // -- Buttons / Actions
  readonly submitButton: Locator;

  // -- Validation / Error messages
  readonly fieldError: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize all locators in the constructor
    this.navElement = page.getByRole('link', { name: 'Element Name' });
    this.inputField = page.getByRole('textbox', { name: 'Field Label' });
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.fieldError = page.getByText('Error message text');
  }

  // 3. Public action methods (async, return Promise<void>)
  public async actionName(): Promise<void> {
    await this.element.click();
  }

  // 4. Public setter methods for form fields
  public async setFieldName(value: string): Promise<void> {
    await this.inputField.fill(value);
  }

  // 5. Compound action methods (multi-step workflows)
  public async fillForm(data: FormData): Promise<void> {
    await this.setFirstName(data.firstName);
    await this.setLastName(data.lastName);
    await this.clickSubmit();
  }
}
```

## Locator Strategy (Priority Order)

Use Playwright's built-in locators in this priority order:

1. **`getByRole()`** — Preferred for all interactive elements (buttons, inputs, links, headings)
2. **`getByLabel()`** — For form fields with associated labels
3. **`getByText()`** — For static text, error messages, headings without roles
4. **`getByPlaceholder()`** — When placeholder text uniquely identifies a field
5. **`getByTestId()`** — When `data-testid` attributes are available
6. **`locator()` with CSS/XPath** — Last resort only when semantic locators cannot work

### Locator Rules

- NEVER use fragile selectors: `#id`, `.class`, `nth-child`, `xpath` index-based paths
- ALWAYS prefer user-facing attributes (role, name, label, text)
- All locators are declared as `readonly` class properties
- All locators are initialized in the constructor
- Locators should be descriptive: `firstNameField` not `input1`

## Method Conventions

### Naming Patterns

| Action | Prefix | Example |
|--------|--------|---------|
| Click an element | `click` | `clickSubmitButton()` |
| Fill a text field | `set` | `setFirstName(value)` |
| Select a dropdown option | `select` | `selectState(state)` |
| Check a checkbox/radio | `check` | `checkGender(option)` |
| Navigate to a page | `navigateTo` or `goto` | `navigateToForm()` |
| Multi-step workflow | descriptive verb | `fillRegistrationForm(data)` |
| Retrieve text/value | `get` | `getErrorMessage()` |

### Method Rules

- All public methods are `async` and return `Promise<void>` (or `Promise<string>` for getters)
- Use explicit `public` visibility modifier
- One action per method (Single Responsibility)
- Compound methods call individual action methods internally
- NO assertions inside page objects — assertions belong in test files only

## Type Safety

### Interface for Form Data

```typescript
interface RegistrationFormData {
  firstName: string;
  lastName: string;
  gender?: 'Male' | 'Female' | 'Other';
  mobile?: string;
  email: string;
  dateOfBirth?: string;
  currentAddress?: string;
  programmingLanguage?: string[];
  state?: string;
  city?: string;
}
```

### Enum for Fixed Options

```typescript
enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}
```

## Test File Conventions

### Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page_objects/LoginPage';
import { RegistrationPage } from '../../page_objects/RegistrationPage';

test('Descriptive Test Name In Title Case', async ({ page }) => {
  // Arrange — navigate and authenticate
  await page.goto('/');
  const loginPage = new LoginPage(page);
  await loginPage.login('Success', 'Success3400');

  // Act — perform the action under test
  const registrationPage = new RegistrationPage(page);
  await registrationPage.clickPracticeForm();
  await registrationPage.setFirstName('John');

  // Assert — verify expected outcomes
  await expect(registrationPage.firstNameField).toHaveValue('John');
});
```

### Test File Naming

- Prefix with numeric order: `01_`, `02_`, `03_`
- Use kebab-case for descriptive names: `01_verify-page-title.test.ts`
- Group tests by feature in subdirectories: `tests/registration_form/`

## Authentication Flow

Every test that accesses the practice form must authenticate first:

```typescript
await page.goto('/');
const loginPage = new LoginPage(page);
await loginPage.login('Success', 'Success3400');
```

## Extending the POM

When adding new page objects or extending existing ones:

1. **Inspect the page** — Use `playwright-cli open` and `playwright-cli snapshot` to identify elements
2. **Choose locators** — Follow the locator priority order above
3. **Declare properties** — Add `readonly` locator properties grouped by section
4. **Initialize in constructor** — All locators set up in the constructor
5. **Add action methods** — One method per user interaction
6. **Keep assertions out** — Page objects describe the page, tests verify behavior

### Adding a New Field to RegistrationPage

```bash
# Inspect the page to find element refs
playwright-cli open https://ui.rexjones2.com/login
playwright-cli fill e1 "Success" --submit
playwright-cli fill e2 "Success3400" --submit
playwright-cli snapshot
# Identify the element ref and its accessible role/name
playwright-cli generate-locator e15
```

Then add the locator and method to the POM class following the template above.

## Anti-Patterns to Avoid

- ❌ Assertions inside page object methods
- ❌ Hard-coded waits (`page.waitForTimeout()`)
- ❌ CSS/XPath selectors when role-based locators work
- ❌ Multiple responsibilities in a single method
- ❌ Page objects that inherit from other page objects unnecessarily
- ❌ Storing test data inside page objects
- ❌ Exposing raw `page` instance to tests for direct manipulation
- ❌ Using `page.locator()` when `page.getByRole()` is available
- ❌ Non-descriptive locator names (`btn1`, `field2`, `el3`)

## Quick Reference: Common Locator Patterns

```typescript
// Buttons
page.getByRole('button', { name: 'Submit' })

// Text inputs
page.getByRole('textbox', { name: 'First name' })

// Links
page.getByRole('link', { name: 'Practice Form' })

// Headings
page.getByRole('heading', { name: 'Practice Form' })

// Radio buttons
page.getByRole('radio', { name: 'Male' })

// Checkboxes
page.getByRole('checkbox', { name: 'JavaScript' })

// Dropdowns
page.getByRole('combobox', { name: 'State' })

// Textarea
page.getByRole('textbox', { name: 'Current Address' })

// Error messages
page.getByText('First Name is a required field')
```
