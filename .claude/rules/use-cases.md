---
globs: src/application/**/*
---

# Application / Use Cases Rules

- Repository is always the **first parameter** — never imported as a concrete implementation
- Call domain `validateFn` before delegating to the repository
- Never import from `src/infrastructure/`
- One folder per entity, with an `index.ts` barrel export
- Use cases are plain async functions — no classes
