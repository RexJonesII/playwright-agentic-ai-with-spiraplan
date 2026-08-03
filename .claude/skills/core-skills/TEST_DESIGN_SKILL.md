---
name: test-design
description: Industry-standard guidelines for clean test writing — test structure, naming, independence, readability, maintainability, and the Five-Star Kitchen framework for automated test engineering.
allowed-tools: Bash(npx:*) Bash(playwright-cli:*) Bash(npm:*)
---

# Test Design Skill

## Overview

This skill defines the architectural principles for writing clean, maintainable, and reliable Playwright tests. It establishes the "Five-Star Kitchen" framework — a quality standard that ensures every test in this project meets enterprise-grade engineering excellence.

## The Five-Star Kitchen Framework

Every test must pass five quality gates before it earns a place in the suite:

| Star | Principle | Rule |
|------|-----------|------|
| ⭐ 1 | **Stable Selectors** | Only role-based, label-based, or text-based locators. Zero CSS/XPath fragility. |
| ⭐ 2 | **Page Object Discipline** | All element interactions go through POM methods. No raw `page.click()` in tests. |
| ⭐ 3 | **Assertion Compliance** | Hard assertions for critical flow gates, soft assertions for multi-check validations. |
| ⭐ 4 | **Test Independence** | Every test runs in isolation. No shared state, no execution order dependency. |
| ⭐ 5 | **Readable Intent** | Test name, structure, and comments tell a story a junior engineer can follow. |

---

## Star 1: Stable Selectors

### Allowed Locator Strategies (Priority Order)

1. `page.getByRole()` — buttons, links, headings, textboxes, checkboxes, radios
2. `page.getByLabel()` — form fields with associated labels
3. `page.getByText()` — static text, error messages
4. `page.getByPlaceholder()` — when placeholder uniquely identifies an element
5. `page.getByTestId()` — when `data-testid` is available
6. `page.locator()` with CSS — **last resort only**, must be documented with a comment

### Forbidden Selectors

```typescript
// ❌ NEVER use these in tests or page objects
page.locator('#submit-btn');               // ID — fragile, changes with refactors
page.locator('.form-group > input:nth-child(2)'); // Structural — breaks on DOM changes
page.locator('//div[@class="form"]/input[1]');    // XPath index — order-dependent
page.locator('div.container button.primary');     // Chained classes — styling-coupled
```

### Selector Audit Checklist

Before committing, verify:
- [ ] No `#id` selectors in page objects or tests
- [ ] No `.class` selectors without a documented justification
- [ ] No `nth-child`, `nth-of-type`, or index-based XPath
- [ ] All locators reference user-visible attributes (role, name, label, text)

---

## Star 2: Page Object Discipline

### Rule: Tests NEVER interact with the page directly

```typescript
// ✅ CORRECT — uses page object method
const registrationPage = new RegistrationPage(page);
await registrationPage.setFirstName('John');
await registrationPage.clickSubmitButton();

// ❌ WRONG — raw page interaction in test file
await page.getByRole('textbox', { name: 'First name' }).fill('John');
await page.getByRole('button', { name: 'Submit' }).click();
```

### Exceptions (documented in test)

- Navigation: `await page.goto('/')` is acceptable in test setup
- Assertions: `await expect(page).toHaveURL(...)` is acceptable
- One-off verifications not worth a POM method (must add a `// Direct access: <reason>` comment)

### POM Method Coverage

Every user interaction on a page must have a corresponding POM method:

| Interaction | POM Method Pattern |
|-------------|-------------------|
| Click a button | `clickButtonName()` |
| Fill a field | `setFieldName(value)` |
| Select dropdown | `selectDropdownName(option)` |
| Check/uncheck | `checkOptionName()` / `uncheckOptionName()` |
| Multi-step flow | `completeFlowName(data)` |
| Read a value | `getFieldNameValue(): Promise<string>` |

---

## Star 3: Assertion Compliance

### Hard Assertions (Default)

Use for critical flow gates where failure means the test cannot continue meaningfully:

```typescript
// Navigation succeeded — if this fails, nothing after matters
await expect(page).not.toHaveURL(/\/login$/);

// Key element present — subsequent interactions depend on it
await expect(registrationPage.pageHeading).toBeVisible();

// Form submitted — the action under test completed
await expect(page.getByText('Registration successful')).toBeVisible();
```

### Soft Assertions

Use when verifying multiple independent conditions on the same page state:

```typescript
// Verifying all validation messages appear (independent checks)
await expect.soft(registrationPage.firstNameError).toBeVisible();
await expect.soft(registrationPage.lastNameError).toBeVisible();
await expect.soft(registrationPage.emailError).toBeVisible();

// Verifying all form fields rendered correctly
await expect.soft(registrationPage.firstNameField).toBeVisible();
await expect.soft(registrationPage.lastNameField).toBeVisible();
await expect.soft(registrationPage.emailField).toBeVisible();
await expect.soft(registrationPage.submitButton).toBeEnabled();
```

### Decision Rule

> **"Can the test logically continue if this assertion fails?"**
> - YES → soft assertion
> - NO → hard assertion

---

## Star 4: Test Independence

### Rules

1. **No shared mutable state** — each test gets a fresh `page` context
2. **No execution order dependency** — tests pass when run individually or shuffled
3. **Self-contained setup** — each test (or `beforeEach`) performs its own navigation and auth
4. **Clean teardown** — if a test creates data, it cleans up after itself

### Patterns

```typescript
// ✅ CORRECT — each test is self-contained
test('Verify First Name Accepts Input', async ({ page }) => {
  await page.goto('/');
  const loginPage = new LoginPage(page);
  await loginPage.login('Success', 'Success3400');

  const registrationPage = new RegistrationPage(page);
  await registrationPage.clickPracticeForm();
  await registrationPage.setFirstName('John');

  await expect(registrationPage.firstNameField).toHaveValue('John');
});

// ❌ WRONG — depends on previous test having navigated
test('Verify Last Name Accepts Input', async ({ page }) => {
  // Assumes we're already on the form page — FRAGILE
  const registrationPage = new RegistrationPage(page);
  await registrationPage.setLastName('Doe');
  await expect(registrationPage.lastNameField).toHaveValue('Doe');
});
```

### Shared Setup via `beforeEach`

```typescript
test.describe('Registration Form Fields', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const loginPage = new LoginPage(page);
    await loginPage.login('Success', 'Success3400');
    const registrationPage = new RegistrationPage(page);
    await registrationPage.clickPracticeForm();
  });

  test('First name accepts input', async ({ page }) => { /* ... */ });
  test('Last name accepts input', async ({ page }) => { /* ... */ });
  test('Email accepts input', async ({ page }) => { /* ... */ });
});
```

---

## Star 5: Readable Intent

### Test Naming Convention

Format: `Verify <What> <Condition/Context>`

```typescript
// ✅ Good names — describe expected behavior
'Verify Validation Messages For Mandatory Fields'
'Verify Successful Login With Valid Credentials'
'Verify The Partial Fields Accept Input'
'Verify Form Rejects Invalid Email Format'

// ❌ Bad names — vague, technical, no intent
'test form'
'check validation'
'TC001_login'
'should work'
```

### Test Body Structure (AAA Pattern)

```typescript
test('Verify Registration Rejects Empty Submission', async ({ page }) => {
  // ── Arrange ──────────────────────────────────────
  await page.goto('/');
  const loginPage = new LoginPage(page);
  await loginPage.login('Success', 'Success3400');
  const registrationPage = new RegistrationPage(page);
  await registrationPage.clickPracticeForm();

  // ── Act ──────────────────────────────────────────
  await registrationPage.clickSubmitButton();

  // ── Assert ───────────────────────────────────────
  await expect(registrationPage.firstNameError).toBeVisible();
  await expect(registrationPage.lastNameError).toBeVisible();
  await expect(registrationPage.emailError).toBeVisible();
});
```

### Comment Guidelines

- Use section comments (`// ── Arrange ──`) for complex tests
- Document non-obvious waits or workarounds
- Explain WHY, not WHAT (the code shows what)
- No redundant comments: `// Click submit button` above `await registrationPage.clickSubmitButton()`

---

## Test Categorization

### Test Types

| Type | File Suffix | Purpose | Speed |
|------|-------------|---------|-------|
| Smoke | `@smoke` tag | Critical path validation | Fast |
| Regression | `@regression` tag | Full feature coverage | Medium |
| Edge Case | `@edge` tag | Boundary and error scenarios | Varies |
| Visual | `@visual` tag | Screenshot comparison | Slow |
| API | `@api` tag | Backend contract validation | Fast |

### Tagging in Practice

```typescript
test('Verify Login Works @smoke', async ({ page }) => { /* ... */ });
test('Verify 50-Character Name Limit @edge', async ({ page }) => { /* ... */ });
test('Verify Form Layout @visual', async ({ page }) => { /* ... */ });
```

## Test Size Guidelines

| Metric | Guideline |
|--------|-----------|
| Lines per test | 10–25 lines (excluding imports) |
| Assertions per test | 1–5 focused assertions |
| Steps per test | Single user journey or verification |
| Page objects per test | 1–3 max |
| Describe block size | 3–10 tests per block |

If a test exceeds these limits, split it into focused sub-tests.

## Error Handling in Tests

```typescript
// ✅ Let Playwright's auto-wait handle timing
await expect(registrationPage.firstNameError).toBeVisible();

// ✅ Use try/catch only for expected application errors
test('Verify Graceful Error Display', async ({ page }) => {
  // Force an error state
  await page.route('**/api/submit', (route) =>
    route.fulfill({ status: 500 })
  );

  await registrationPage.clickSubmitButton();
  await expect(page.getByRole('alert')).toContainText('Something went wrong');
});

// ❌ NEVER swallow errors
try {
  await registrationPage.clickSubmitButton();
} catch (e) {
  // Silent failure — hides real bugs
}
```

## Test Maintenance Rules

1. **Delete dead tests** — commented-out tests are noise, remove them
2. **Fix flaky tests immediately** — flakiness erodes suite trust
3. **Update POMs when UI changes** — don't patch tests around broken locators
4. **Review test names quarterly** — ensure they still match behavior
5. **No `test.skip()` without a ticket** — add `// TODO: JIRA-123` with reason

## Code Review Checklist (Five-Star Kitchen)

When reviewing test code, verify:

### ⭐ Stable Selectors
- [ ] No `#id`, `.class`, `nth-child`, or XPath index selectors
- [ ] All locators use `getByRole`, `getByLabel`, `getByText`, or `getByTestId`
- [ ] Locator names in POM are descriptive (not `el1`, `btn2`)

### ⭐ Page Object Discipline
- [ ] No raw `page.click()`, `page.fill()`, `page.locator().click()` in test files
- [ ] All interactions flow through POM methods
- [ ] New UI elements have corresponding POM properties and methods

### ⭐ Assertion Compliance
- [ ] Hard assertions used for flow-critical gates
- [ ] Soft assertions used for multi-check validations
- [ ] No `expect(await locator.isVisible()).toBe(true)` — use `toBeVisible()`
- [ ] All `expect()` calls are `await`ed

### ⭐ Test Independence
- [ ] No test relies on another test's side effects
- [ ] Each test has its own setup (or uses `beforeEach`)
- [ ] No global variables mutated across tests

### ⭐ Readable Intent
- [ ] Test name describes expected behavior in Title Case
- [ ] AAA pattern (Arrange/Act/Assert) is clear
- [ ] No magic strings — data comes from fixtures or is self-documenting
- [ ] Comments explain WHY, not WHAT
