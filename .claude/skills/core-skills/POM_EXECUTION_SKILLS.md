---
name: pom-execution
description: Guidelines for executing Playwright tests using Page Object Models — test orchestration, data management, parallel execution, and CI/CD integration.
allowed-tools: Bash(npx:*) Bash(playwright-cli:*) Bash(npm:*)
---

# POM Execution Skill

## Overview

This skill defines how to structure, orchestrate, and execute Playwright tests that consume Page Object Models. It covers test lifecycle management, data-driven patterns, parallel execution strategies, and environment configuration for the application at `https://ui.rexjones2.com`.

## Test Execution Commands

```bash
# Run all tests
npx playwright test

# Run a specific test file
npx playwright test tests/login/01_login-valid.spec.ts

# Run tests in a specific directory
npx playwright test tests/registration_form/

# Run tests matching a grep pattern
npx playwright test --grep "Verify Validation"

# Run in headed mode (for debugging)
npx playwright test --headed

# Run with specific project
npx playwright test --project=chromium

# Run with UI mode (interactive)
npx playwright test --ui

# Debug a single test
npx playwright test --debug tests/login/01_login-valid.spec.ts

# Generate HTML report
npx playwright show-report
```

## Test File Structure

### Standard Test Template

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page_objects/LoginPage';
import { RegistrationPage } from '../../page_objects/RegistrationPage';

test.describe('Feature: Registration Form Submission', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const loginPage = new LoginPage(page);
    await loginPage.login('Success', 'Success3400');
  });

  test('Verify Form Accepts Valid Input', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.clickPracticeForm();
    await registrationPage.setFirstName('John');

    await expect(registrationPage.firstNameField).toHaveValue('John');
  });

});
```

### Test Lifecycle Hooks

```typescript
test.describe('Feature Group', () => {

  // Runs once before all tests in this describe block
  test.beforeAll(async () => {
    // Seed database, generate test tokens, etc.
  });

  // Runs before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const loginPage = new LoginPage(page);
    await loginPage.login('Success', 'Success3400');
  });

  // Runs after each test
  test.afterEach(async ({ page }) => {
    // Cleanup: clear storage, reset state
  });

  // Runs once after all tests in this describe block
  test.afterAll(async () => {
    // Tear down shared resources
  });

});
```

## Authentication Strategy

### Shared Authentication State

For tests that all require login, use Playwright's storage state to avoid repeated login flows:

```typescript
// auth.setup.ts — runs once, saves session
import { test as setup } from '@playwright/test';
import { LoginPage } from '../page_objects/LoginPage';

const authFile = 'test-results/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/');
  const loginPage = new LoginPage(page);
  await loginPage.login('Success', 'Success3400');

  await page.context().storageState({ path: authFile });
});
```

```typescript
// playwright.config.ts — reference the auth setup
export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'test-results/.auth/user.json',
      },
    },
  ],
});
```

### Per-Test Authentication (Current Approach)

When tests need fresh sessions or different credentials:

```typescript
test('Test with specific user', async ({ page }) => {
  await page.goto('/');
  const loginPage = new LoginPage(page);
  await loginPage.login('Success', 'Success3400');
  // Continue with test...
});
```

## Data-Driven Testing

### Parameterized Tests

```typescript
const testUsers = [
  { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
  { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
  { firstName: 'Bob', lastName: 'Wilson', email: 'bob@example.com' },
];

for (const user of testUsers) {
  test(`Verify Registration For ${user.firstName} ${user.lastName}`, async ({ page }) => {
    await page.goto('/');
    const loginPage = new LoginPage(page);
    await loginPage.login('Success', 'Success3400');

    const registrationPage = new RegistrationPage(page);
    await registrationPage.clickPracticeForm();
    await registrationPage.setFirstName(user.firstName);
    await registrationPage.setLastName(user.lastName);
    await registrationPage.setEmail(user.email);

    await expect(registrationPage.firstNameField).toHaveValue(user.firstName);
    await expect(registrationPage.lastNameField).toHaveValue(user.lastName);
    await expect(registrationPage.emailField).toHaveValue(user.email);
  });
}
```

### Test Data Fixtures

```typescript
// fixtures/registration-data.ts
export const validRegistration = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  mobile: '1234567890',
  gender: 'Male' as const,
};

export const invalidEmails = [
  'missing-at-sign.com',
  '@no-local-part.com',
  'spaces in@email.com',
  '',
];
```

## Parallel Execution Configuration

### Project-Level Parallelism

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,           // Run tests in parallel within files
  workers: process.env.CI ? 2 : undefined, // Limit workers in CI
  retries: process.env.CI ? 2 : 0,         // Retry failed tests in CI
  reporter: 'html',
  use: {
    baseURL: 'https://ui.rexjones2.com/login',
    headless: false,
    trace: 'on',
    screenshot: 'on',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

### Serial Execution for Dependent Tests

```typescript
test.describe.serial('Ordered Registration Flow', () => {
  test('Step 1: Fill personal info', async ({ page }) => { /* ... */ });
  test('Step 2: Select preferences', async ({ page }) => { /* ... */ });
  test('Step 3: Submit and verify', async ({ page }) => { /* ... */ });
});
```

## Test Organization Patterns

### Directory Structure by Feature

```
tests/
├── login/
│   ├── 01_login-valid.spec.ts
│   └── 02_login-invalid.spec.ts
├── registration_form/
│   ├── 01_verify-page-title.test.ts
│   ├── 02_verify-validation-messages.test.ts
│   └── 03_verify-partial-fields.test.ts
├── text_box/
├── buttons/
├── web_tables/
└── fixtures/
    └── registration-data.ts
```

### File Naming Rules

- Prefix with numeric order: `01_`, `02_`, `03_`
- Use kebab-case: `01_verify-page-title.test.ts`
- Extension `.spec.ts` or `.test.ts` (remain consistent within a feature folder)
- Group by feature in dedicated subdirectories

## Test Tagging and Filtering

### Using Tags

```typescript
test('Verify Login @smoke', async ({ page }) => { /* ... */ });
test('Verify Full Registration @regression', async ({ page }) => { /* ... */ });
test('Verify Edge Case @edge', async ({ page }) => { /* ... */ });
```

```bash
# Run only smoke tests
npx playwright test --grep "@smoke"

# Run everything except edge cases
npx playwright test --grep-invert "@edge"
```

## Retry and Flakiness Strategy

```typescript
// Retry a specific flaky test
test('Verify Dynamic Element', async ({ page }) => {
  test.info().annotations.push({ type: 'flaky', description: 'Element loads asynchronously' });
  // test logic
});

// Set retries for a describe block
test.describe('Flaky Feature', () => {
  test.describe.configure({ retries: 2 });
  // tests here will retry up to 2 times
});
```

## Debugging Workflow

```bash
# Step 1: Run with trace on failure
npx playwright test --trace on-first-retry

# Step 2: Open trace viewer for a failed test
npx playwright show-trace test-results/<test-folder>/trace.zip

# Step 3: Debug interactively
npx playwright test --debug tests/registration_form/01_verify-page-title.test.ts

# Step 4: Use playwright-cli for live inspection
playwright-cli open https://ui.rexjones2.com/login
playwright-cli snapshot
```

## Environment Configuration

### Using Environment Variables

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || 'https://ui.rexjones2.com/login',
    headless: process.env.CI ? true : false,
  },
});
```

### Running with Different Environments

```bash
# Local development
npx playwright test

# CI environment
BASE_URL=https://staging.rexjones2.com/login npx playwright test --headed=false

# Specific browser
npx playwright test --project=chromium
```

## Reporting

### HTML Report (Default)

```bash
npx playwright test --reporter=html
npx playwright show-report
```

### Multiple Reporters

```typescript
// playwright.config.ts
export default defineConfig({
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],
});
```

## CI/CD Integration Pattern

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Anti-Patterns to Avoid

- ❌ Hard-coded `waitForTimeout()` — use `expect` auto-retrying assertions instead
- ❌ Tests that depend on execution order across files
- ❌ Shared mutable state between tests
- ❌ Login flow repeated inline instead of using page object
- ❌ Skipping tests with `test.skip()` permanently — fix or remove them
- ❌ Tests that pass only in headed mode
- ❌ Ignoring flaky test signals — investigate root causes
- ❌ Storing credentials in test files (use environment variables for sensitive data)
