---
description: Code rules for the e2e container of AstroBookings
paths: ["e2e/"]
---
# E2E code rules — AstroBookings

## Summary

Playwright + TypeScript ESM suite. The one principle that matters most: keep assertions in specs and locators in Page Objects — never mix them. Use `getByTestId()` for all element selection.

## Naming

| Element | Convention | Example |
|---------|------------|---------|
| Spec files | `{feature}.spec.ts` | `bookings.spec.ts` |
| Page Object files | `{Feature}Page.ts` (PascalCase) | `HealthPage.ts` |
| API helper functions | `api{Action}{Entity}` (camelCase) | `apiCreateRocket` |
| `data-testid` values | `{element}-{context}` (kebab) | `booking-row-42`, `btn-cancel-booking-7` |
| UID helper | `uid()` returning a short string | `uid()` |

## Artifact roles

| Role | Structural rule (one line) |
|------|----------------------------|
| Spec (`*.spec.ts`) | Owns all `expect()` calls; instantiates Page Objects and calls API helpers |
| Page Object (`pages/*.ts`) | Exposes `readonly Locator` fields + a `goto()` method; zero assertions |
| API helper (inline function) | Plain `async function` that calls `APIRequestContext`; returns parsed JSON |
| Config (`playwright.config.ts`) | Reads env vars; declares `webServer` array; contains no test logic |

## Canonical example

> `HealthPage.ts` — the canonical Page Object: readonly locators, single `goto`, no assertions.

```typescript
export class HealthPage {
  readonly status: Locator;
  readonly database: Locator;

  constructor(private readonly page: Page) {
    this.status = page.getByTestId('health-status');
    this.database = page.getByTestId('health-database');
  }

  async goto(options?: Parameters<Page['goto']>[1]): Promise<void> {
    await this.page.goto('/', options);
  }
}
```

## Conventions

- **Wiring**: Specs import Page Objects directly (no DI). API helpers are module-level functions co-located in the spec that uses them.
- **Errors**: Let Playwright throw on unmet assertions; no `try/catch` in specs. API responses are typed with `as Promise<{...}>` casts — do not add runtime validation.
- **Testing**: One spec file per domain feature in `tests/`. Use `test.describe.configure({ mode: 'serial' })` when tests share SQLite-backed state (e.g., bookings) to prevent parallel-write race conditions.
- **Avoid**: CSS selectors and XPath — always use `getByTestId()`; assertions inside Page Objects; mutable shared state between `test.describe` blocks without a `test.beforeAll` fixture; asserting only `.toBeVisible()` when text content matters — prefer `.toHaveText()` or `.toContainText()`.
