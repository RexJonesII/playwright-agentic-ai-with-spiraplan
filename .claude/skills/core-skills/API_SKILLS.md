---
name: api-testing
description: Guidelines for API testing with Playwright — request context, REST operations, authentication tokens, response validation, and hybrid UI+API test patterns.
allowed-tools: Bash(npx:*) Bash(playwright-cli:*) Bash(npm:*) Bash(curl:*)
---

# API Testing Skill

## Overview

This skill defines conventions for API testing using Playwright's built-in `APIRequestContext`. It covers standalone API tests, hybrid UI+API workflows, authentication token management, and integration with the application's backend at `https://api.rexjones2.com/api`.

## Target API

- **API Base URL:** `https://api.rexjones2.com/api`
- **UI Base URL:** `https://ui.rexjones2.com`
- **Authentication:** Token-based (obtained via login endpoint)
- **API Docs:** `https://api.rexjones2.com/api` (Swagger/OpenAPI)

## Project Structure for API Tests

```
tests/
├── api/
│   ├── 01_health-check.spec.ts
│   ├── 02_authentication.spec.ts
│   ├── 03_user-operations.spec.ts
│   └── 04_book-operations.spec.ts
├── login/
├── registration_form/
└── fixtures/
    ├── api-data.ts
    └── endpoints.ts
```

## Playwright API Request Context

### Standalone API Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('API: User Operations', () => {

  let apiContext;
  let authToken: string;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: 'https://api.rexjones2.com/api',
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Authenticate and store token
    const loginResponse = await apiContext.post('/auth/login', {
      data: {
        username: 'Success',
        password: 'Success3400',
      },
    });
    const body = await loginResponse.json();
    authToken = body.token;
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('GET /users returns user list', async () => {
    const response = await apiContext.get('/users', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

});
```

### Using Built-in Request Fixture

```typescript
import { test, expect } from '@playwright/test';

test('API health check', async ({ request }) => {
  const response = await request.get('https://api.rexjones2.com/api/health');

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
});
```

## HTTP Methods

### GET Request

```typescript
test('GET resource by ID', async ({ request }) => {
  const response = await request.get('/api/books/1', {
    headers: { Authorization: `Bearer ${token}` },
  });

  expect(response.ok()).toBeTruthy();
  const book = await response.json();
  expect(book).toHaveProperty('title');
  expect(book).toHaveProperty('author');
});
```

### POST Request

```typescript
test('POST create new resource', async ({ request }) => {
  const response = await request.post('/api/books', {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: 'Test Book',
      author: 'Test Author',
      isbn: '978-0-123456-78-9',
    },
  });

  expect(response.status()).toBe(201);
  const created = await response.json();
  expect(created.title).toBe('Test Book');
});
```

### PUT Request

```typescript
test('PUT update existing resource', async ({ request }) => {
  const response = await request.put('/api/books/1', {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: 'Updated Title',
    },
  });

  expect(response.ok()).toBeTruthy();
  const updated = await response.json();
  expect(updated.title).toBe('Updated Title');
});
```

### DELETE Request

```typescript
test('DELETE remove resource', async ({ request }) => {
  const response = await request.delete('/api/books/1', {
    headers: { Authorization: `Bearer ${token}` },
  });

  expect(response.status()).toBe(204);
});
```

### PATCH Request

```typescript
test('PATCH partial update', async ({ request }) => {
  const response = await request.patch('/api/users/1', {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      email: 'updated@example.com',
    },
  });

  expect(response.ok()).toBeTruthy();
});
```

## Authentication Patterns

### Token-Based Auth

```typescript
// fixtures/api-auth.ts
import { APIRequestContext } from '@playwright/test';

export async function getAuthToken(request: APIRequestContext): Promise<string> {
  const response = await request.post('https://api.rexjones2.com/api/auth/login', {
    data: {
      username: process.env.API_USERNAME || 'Success',
      password: process.env.API_PASSWORD || 'Success3400',
    },
  });

  if (!response.ok()) {
    throw new Error(`Authentication failed: ${response.status()}`);
  }

  const body = await response.json();
  return body.token;
}
```

### Reusable Authenticated Context

```typescript
// fixtures/api-fixtures.ts
import { test as base } from '@playwright/test';
import { getAuthToken } from './api-auth';

type ApiFixtures = {
  authenticatedRequest: typeof base['request'];
  authToken: string;
};

export const test = base.extend<ApiFixtures>({
  authToken: async ({ request }, use) => {
    const token = await getAuthToken(request);
    await use(token);
  },

  authenticatedRequest: async ({ playwright, authToken }, use) => {
    const context = await playwright.request.newContext({
      baseURL: 'https://api.rexjones2.com/api',
      extraHTTPHeaders: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });
    await use(context);
    await context.dispose();
  },
});
```

## Hybrid UI + API Tests

### API Setup, UI Verification

```typescript
test('Create user via API, verify in UI', async ({ page, request }) => {
  // API: Create user
  const response = await request.post('https://api.rexjones2.com/api/users', {
    data: { username: 'newuser', email: 'new@example.com' },
  });
  expect(response.status()).toBe(201);

  // UI: Verify user appears
  await page.goto('/');
  const loginPage = new LoginPage(page);
  await loginPage.login('Success', 'Success3400');

  await page.getByRole('link', { name: 'Search Users' }).click();
  await expect(page.getByText('newuser')).toBeVisible();
});
```

### UI Action, API Verification

```typescript
test('Submit form in UI, verify via API', async ({ page, request }) => {
  await page.goto('/');
  const loginPage = new LoginPage(page);
  await loginPage.login('Success', 'Success3400');

  const registrationPage = new RegistrationPage(page);
  await registrationPage.clickPracticeForm();
  await registrationPage.setFirstName('John');
  await registrationPage.setLastName('Doe');
  await registrationPage.setEmail('john@example.com');
  await registrationPage.clickSubmitButton();

  // API: Verify data was persisted
  const response = await request.get('https://api.rexjones2.com/api/users?email=john@example.com');
  const users = await response.json();
  expect(users[0].firstName).toBe('John');
});
```

### API Cleanup After UI Tests

```typescript
test.afterEach(async ({ request }) => {
  // Clean up test data created during UI tests
  await request.delete('https://api.rexjones2.com/api/users/test-user', {
    headers: { Authorization: `Bearer ${token}` },
  });
});
```

## Response Validation Patterns

### Status Code Assertions

```typescript
expect(response.status()).toBe(200);       // Exact match
expect(response.ok()).toBeTruthy();        // 2xx range
expect(response.status()).toBeGreaterThanOrEqual(200);
expect(response.status()).toBeLessThan(300);
```

### Response Body Assertions

```typescript
const body = await response.json();

// Property existence
expect(body).toHaveProperty('id');
expect(body).toHaveProperty('createdAt');

// Value matching
expect(body.username).toBe('Success');
expect(body.email).toContain('@');

// Array validation
expect(body.items).toHaveLength(10);
expect(body.items[0]).toMatchObject({
  title: expect.any(String),
  id: expect.any(Number),
});

// Schema-like validation
expect(body).toMatchObject({
  id: expect.any(Number),
  username: expect.any(String),
  email: expect.stringMatching(/@/),
  createdAt: expect.any(String),
});
```

### Response Header Assertions

```typescript
const headers = response.headers();

expect(headers['content-type']).toContain('application/json');
expect(headers).toHaveProperty('x-request-id');
```

### Error Response Validation

```typescript
test('Verify 401 for unauthorized access', async ({ request }) => {
  const response = await request.get('https://api.rexjones2.com/api/users', {
    headers: { Authorization: 'Bearer invalid-token' },
  });

  expect(response.status()).toBe(401);
  const error = await response.json();
  expect(error).toHaveProperty('message');
  expect(error.message).toContain('unauthorized');
});

test('Verify 404 for non-existent resource', async ({ request }) => {
  const response = await request.get('https://api.rexjones2.com/api/books/99999');

  expect(response.status()).toBe(404);
});

test('Verify 422 for invalid data', async ({ request }) => {
  const response = await request.post('https://api.rexjones2.com/api/users', {
    data: { username: '' }, // Missing required fields
  });

  expect(response.status()).toBe(422);
  const errors = await response.json();
  expect(errors.errors).toBeDefined();
});
```

## Request Interception (Mocking)

### Mock API Responses in UI Tests

```typescript
test('Verify UI handles empty state', async ({ page }) => {
  // Intercept API call and return empty response
  await page.route('**/api/books', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.goto('/');
  // UI should show "No books found" message
  await expect(page.getByText('No books found')).toBeVisible();
});
```

### Mock Error Responses

```typescript
test('Verify UI handles server errors', async ({ page }) => {
  await page.route('**/api/users', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Internal Server Error' }),
    });
  });

  await page.goto('/');
  await expect(page.getByText('Something went wrong')).toBeVisible();
});
```

### Intercept and Modify Responses

```typescript
test('Verify UI with modified data', async ({ page }) => {
  await page.route('**/api/users', async (route) => {
    const response = await route.fetch();
    const body = await response.json();

    // Modify the response
    body.push({ id: 999, username: 'injected-user' });

    await route.fulfill({
      response,
      body: JSON.stringify(body),
    });
  });

  await page.goto('/');
});
```

## Endpoint Constants

```typescript
// fixtures/endpoints.ts
export const API = {
  BASE: 'https://api.rexjones2.com/api',
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
  },
  USERS: {
    LIST: '/users',
    BY_ID: (id: number) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: number) => `/users/${id}`,
    DELETE: (id: number) => `/users/${id}`,
  },
  BOOKS: {
    LIST: '/books',
    BY_ID: (id: number) => `/books/${id}`,
    SEARCH: (query: string) => `/books?search=${query}`,
    CREATE: '/books',
  },
} as const;
```

## Performance Considerations

### Response Time Assertions

```typescript
test('API responds within acceptable time', async ({ request }) => {
  const start = Date.now();
  const response = await request.get('https://api.rexjones2.com/api/health');
  const duration = Date.now() - start;

  expect(response.ok()).toBeTruthy();
  expect(duration).toBeLessThan(2000); // Under 2 seconds
});
```

### Concurrent Requests

```typescript
test('Multiple parallel requests succeed', async ({ request }) => {
  const requests = Array.from({ length: 5 }, (_, i) =>
    request.get(`https://api.rexjones2.com/api/books/${i + 1}`)
  );

  const responses = await Promise.all(requests);
  responses.forEach((response) => {
    expect(response.ok()).toBeTruthy();
  });
});
```

## Anti-Patterns to Avoid

- ❌ Hard-coding tokens in test files — use fixtures or environment variables
- ❌ Testing third-party APIs you don't own — mock them instead
- ❌ Ignoring response status before parsing body
- ❌ Not disposing API contexts after use
- ❌ Coupling API test order — each test should be independent
- ❌ Skipping error scenario tests (4xx, 5xx)
- ❌ Testing implementation details instead of contracts
- ❌ Not cleaning up resources created during tests
- ❌ Using `page.evaluate(fetch(...))` instead of Playwright's `request` API
