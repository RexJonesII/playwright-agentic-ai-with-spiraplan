---
name: assertion-patterns
description: Comprehensive assertion strategies for Playwright tests — auto-retrying assertions, soft assertions, custom matchers, visual comparison, and accessibility validation.
allowed-tools: Bash(npx:*) Bash(playwright-cli:*) Bash(npm:*)
---

# Assertion Skills

## Overview

This skill defines assertion conventions, patterns, and best practices for Playwright tests. It covers auto-retrying assertions, web-first assertions, soft assertions, custom matchers, visual regression, and accessibility checking for the application at `https://ui.rexjones2.com`.

## Core Principle: Auto-Retrying Assertions

Playwright assertions automatically retry until the condition is met or the timeout expires. ALWAYS prefer `expect(locator)` assertions over manual waits.

```typescript
// ✅ CORRECT — auto-retries until element is visible (up to timeout)
await expect(page.getByRole('heading', { name: 'Practice Form' })).toBeVisible();

// ❌ WRONG — does not retry, brittle
const heading = await page.$('h1');
expect(heading).not.toBeNull();
```

## Assertion Categories

### 1. Element Visibility Assertions

```typescript
// Element is visible in the viewport
await expect(registrationPage.pageHeading).toBeVisible();

// Element is hidden or not in DOM
await expect(registrationPage.firstNameError).toBeHidden();

// Element exists in DOM (may not be visible)
await expect(page.locator('#hidden-field')).toBeAttached();

// Element is not in DOM at all
await expect(page.locator('.removed-element')).not.toBeAttached();
```

### 2. Text Content Assertions

```typescript
// Exact text match
await expect(registrationPage.pageSubheading).toHaveText('Student Registration Form');

// Partial text match (contains)
await expect(registrationPage.firstNameError).toContainText('required field');

// Regex match
await expect(page.getByRole('status')).toHaveText(/success|completed/i);

// Multiple elements text (ordered array)
await expect(page.getByRole('listitem')).toHaveText([
  'First item',
  'Second item',
  'Third item',
]);
```

### 3. Input Value Assertions

```typescript
// Text input value
await expect(registrationPage.firstNameField).toHaveValue('John');

// Empty field
await expect(registrationPage.emailField).toHaveValue('');

// Regex value match
await expect(registrationPage.emailField).toHaveValue(/.*@.*\..*/);

// Input field is editable
await expect(registrationPage.firstNameField).toBeEditable();

// Input field is disabled
await expect(page.getByRole('textbox', { name: 'Disabled' })).toBeDisabled();

// Input field is enabled
await expect(registrationPage.submitButton).toBeEnabled();
```

### 4. Checkbox and Radio Button Assertions

```typescript
// Checkbox is checked
await expect(page.getByRole('checkbox', { name: 'JavaScript' })).toBeChecked();

// Checkbox is unchecked
await expect(page.getByRole('checkbox', { name: 'Python' })).not.toBeChecked();

// Radio button is selected
await expect(page.getByRole('radio', { name: 'Male' })).toBeChecked();
```

### 5. Page-Level Assertions

```typescript
// URL assertions
await expect(page).toHaveURL('https://ui.rexjones2.com/automation-practice-form');
await expect(page).toHaveURL(/\/automation-practice-form$/);
await expect(page).not.toHaveURL(/\/login$/);

// Page title
await expect(page).toHaveTitle('Practice Form');
await expect(page).toHaveTitle(/Practice/);
```

### 6. CSS and Attribute Assertions

```typescript
// CSS class
await expect(registrationPage.submitButton).toHaveClass(/btn-primary/);

// Specific attribute
await expect(registrationPage.emailField).toHaveAttribute('type', 'email');
await expect(registrationPage.firstNameField).toHaveAttribute('placeholder', 'First name');

// CSS property (computed style)
await expect(registrationPage.firstNameError).toHaveCSS('color', 'rgb(255, 0, 0)');

// Element count
await expect(page.getByRole('listitem')).toHaveCount(5);
```

### 7. Focus Assertions

```typescript
// Element has focus
await expect(registrationPage.firstNameField).toBeFocused();
```

## Soft Assertions

Soft assertions do NOT stop test execution on failure. They collect all failures and report them at the end.

```typescript
import { test, expect } from '@playwright/test';

test('Verify All Form Fields Are Present', async ({ page }) => {
  await page.goto('/');
  const loginPage = new LoginPage(page);
  await loginPage.login('Success', 'Success3400');

  const registrationPage = new RegistrationPage(page);
  await registrationPage.clickPracticeForm();

  // All assertions run even if earlier ones fail
  await expect.soft(registrationPage.firstNameField).toBeVisible();
  await expect.soft(registrationPage.lastNameField).toBeVisible();
  await expect.soft(registrationPage.emailField).toBeVisible();
  await expect.soft(registrationPage.submitButton).toBeVisible();
  await expect.soft(registrationPage.pageHeading).toBeVisible();
  await expect.soft(registrationPage.pageSubheading).toBeVisible();
});
```

### When to Use Soft Assertions

- ✅ Verifying multiple independent UI elements on a page
- ✅ Checking all fields in a form are present
- ✅ Validating multiple error messages simultaneously
- ❌ NOT for sequential flows where later steps depend on earlier ones

## Custom Timeout on Assertions

```typescript
// Override default timeout for slow-loading elements
await expect(page.getByRole('status')).toBeVisible({ timeout: 10000 });

// Short timeout for elements expected to appear quickly
await expect(registrationPage.firstNameError).toBeVisible({ timeout: 2000 });
```

## Negated Assertions

```typescript
// Element should NOT be visible (waits for it to disappear)
await expect(registrationPage.firstNameError).not.toBeVisible();

// URL should NOT match login page (confirms navigation away)
await expect(page).not.toHaveURL(/\/login$/);

// Field should NOT be empty
await expect(registrationPage.firstNameField).not.toHaveValue('');

// Element should NOT have a specific class
await expect(registrationPage.submitButton).not.toHaveClass(/disabled/);
```

## Visual Comparison Assertions

### Screenshot Comparison

```typescript
// Full page screenshot comparison
await expect(page).toHaveScreenshot('registration-form.png');

// Element-level screenshot comparison
await expect(registrationPage.pageHeading).toHaveScreenshot('form-heading.png');

// With tolerance for dynamic content
await expect(page).toHaveScreenshot('form-page.png', {
  maxDiffPixelRatio: 0.05, // Allow 5% pixel difference
});

// Mask dynamic elements
await expect(page).toHaveScreenshot('form-static.png', {
  mask: [page.getByText(/\d{2}\/\d{2}\/\d{4}/)], // Mask date elements
});
```

### First Run Behavior

On first execution, Playwright creates baseline screenshots in a `__snapshots__` directory. Subsequent runs compare against these baselines.

```bash
# Update baselines after intentional UI changes
npx playwright test --update-snapshots
```

## Accessibility Assertions

```typescript
// Snapshot-based accessibility check
await expect(page).toHaveScreenshot(); // Captures visual state

// ARIA role verification
await expect(page.getByRole('form')).toBeVisible();
await expect(page.getByRole('alert')).toHaveText(/error/i);

// Label association
await expect(page.getByLabel('First name')).toBeVisible();
await expect(page.getByLabel('Email')).toBeEditable();
```

## API Response Assertions

```typescript
import { test, expect } from '@playwright/test';

test('API response validation', async ({ request }) => {
  const response = await request.get('https://api.rexjones2.com/api/users');

  // Status assertions
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);

  // Header assertions
  expect(response.headers()['content-type']).toContain('application/json');

  // Body assertions
  const body = await response.json();
  expect(body).toHaveProperty('data');
  expect(body.data).toBeInstanceOf(Array);
  expect(body.data.length).toBeGreaterThan(0);

  // Object shape validation
  expect(body.data[0]).toMatchObject({
    id: expect.any(Number),
    username: expect.any(String),
    email: expect.stringMatching(/@/),
  });
});
```

## Assertion Composition Patterns

### Arrange-Act-Assert (AAA)

```typescript
test('Verify Validation On Empty Submit', async ({ page }) => {
  // Arrange
  await page.goto('/');
  const loginPage = new LoginPage(page);
  await loginPage.login('Success', 'Success3400');
  const registrationPage = new RegistrationPage(page);
  await registrationPage.clickPracticeForm();

  // Act
  await registrationPage.clickSubmitButton();

  // Assert
  await expect(registrationPage.firstNameError).toBeVisible();
  await expect(registrationPage.lastNameError).toBeVisible();
  await expect(registrationPage.emailError).toBeVisible();
});
```

### Multiple Related Assertions

```typescript
test('Verify Complete Form State After Fill', async ({ page }) => {
  // ... setup and fill form ...

  // Group related assertions for a single feature
  await expect(registrationPage.firstNameField).toHaveValue('John');
  await expect(registrationPage.lastNameField).toHaveValue('Doe');
  await expect(registrationPage.emailField).toHaveValue('john@example.com');
  await expect(registrationPage.submitButton).toBeEnabled();
  await expect(registrationPage.firstNameError).not.toBeVisible();
});
```

### Polling Assertions for Dynamic Content

```typescript
// Use expect.poll() for values that change over time
await expect.poll(async () => {
  const response = await page.request.get('/api/status');
  return response.status();
}, {
  message: 'API should eventually return 200',
  timeout: 30000,
  intervals: [1000, 2000, 5000],
}).toBe(200);
```

### toPass() for Custom Retry Logic

```typescript
// Retry an entire assertion block
await expect(async () => {
  const response = await page.request.get('/api/processing-job/123');
  const body = await response.json();
  expect(body.status).toBe('completed');
}).toPass({
  timeout: 60000,
  intervals: [2000, 5000, 10000],
});
```

## Assertion Configuration

### Global Timeout (playwright.config.ts)

```typescript
export default defineConfig({
  expect: {
    timeout: 5000, // Default assertion timeout (5 seconds)
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
    },
  },
});
```

## Assertion Decision Matrix

| Scenario | Assertion | Example |
|----------|-----------|---------|
| Element visible | `toBeVisible()` | Error message appears |
| Element gone | `not.toBeVisible()` | Spinner disappears |
| Field has value | `toHaveValue()` | Input was filled |
| Text content | `toHaveText()` | Heading matches |
| Contains text | `toContainText()` | Partial string match |
| URL changed | `toHaveURL()` | Navigation occurred |
| Checkbox state | `toBeChecked()` | Option selected |
| Element count | `toHaveCount()` | List items rendered |
| CSS property | `toHaveCSS()` | Error is red |
| Attribute | `toHaveAttribute()` | Link target correct |
| Enabled/disabled | `toBeEnabled()` | Button clickable |
| API status | `response.status()` | 200 OK |

## Anti-Patterns to Avoid

- ❌ `expect(await locator.isVisible()).toBe(true)` — use `await expect(locator).toBeVisible()`
- ❌ `page.waitForTimeout(3000)` before assertions — assertions auto-retry
- ❌ Assertions inside page objects — keep them in test files only
- ❌ Asserting on implementation details (CSS classes for logic, DOM structure)
- ❌ Using `toBeTruthy()` when a specific matcher exists
- ❌ Missing `await` on expect — causes silent failures
- ❌ Over-asserting — verify behavior, not every DOM attribute
- ❌ Hard-coded strings for dynamic content — use regex or `toContainText()`
- ❌ Asserting element count without waiting — use `toHaveCount()` which retries
