---
globs: src/domain/**/*
---

# Domain Layer Rules

- Never import from `src/application/`, `src/infrastructure/`, or `src/components/`
- Every entity has exactly two files: `<entity>.ts` (interface + validateFn) and `<Entity>Repository.ts` (port interface)
- `id` is always `string` — never `ObjectId`
- Validation lives here as a plain function (`validateEntity(data)`), not Zod
- No framework dependencies — pure TypeScript only
