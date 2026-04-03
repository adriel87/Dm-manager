---
globs: __test__/**/*,e2e/**/*
---

# Tests Rules

## Unit tests (Vitest)
- Location: `__test__/application/usaCases/<entity>/useCases.test.ts` (note: `usaCases` — legacy typo, keep it)
- Always mock repositories with `vi.fn()` — no real DB connections ever
- `beforeEach(() => vi.clearAllMocks())`
- Structure: arrange / act / assert
- Cover: happy path, domain validation failures, repository returning null

## E2E tests (Playwright)
- Location: `e2e/<feature>.spec.ts` with POM in `e2e/pages/<feature>.page.ts`
- Locator priority: `getByRole` → `getByLabel` → `getByText` → `getByTestId` (never CSS classes)
- Always clean up test data via API helpers (`e2e/helpers/api.ts`) in `afterEach` or `try/finally`
- Test naming: `TC-{number}: {action} — {expected result}`
