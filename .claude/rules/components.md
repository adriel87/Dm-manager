---
globs: src/app/**/*,src/components/**/*
---

# UI / Components Rules

- **Server Component by default** — only add `'use client'` for modals, filters, forms, or anything needing useState/useTransition
- Never use `useEffect` for data fetching — use async Server Components with `fetchApi()`
- HeroUI modals: always use `useDisclosure`, `useTransition`, `router.refresh()` after mutation
- Style constants: always use `INPUT_CLASSES`, `MODAL_CLASSES`, `ERROR_CLASSES`, `SELECT_CLASSES` from `@/constants/ui` — never repeat inline
- Accessibility: every input needs `aria-label`, every modal-trigger button needs `aria-label`, errors use `<p role="alert">`
- Never import from `src/infrastructure/` or `src/domain/` directly — use API helpers (`fetchApi`, `apiPost`, `apiPut`)
