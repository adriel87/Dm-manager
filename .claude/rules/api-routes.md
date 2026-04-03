---
globs: src/app/api/**/*
---

# API Routes Rules

- Validate input with Zod schema **before** calling the use case
- Import repository instances from `@/infrastructure/config/repositories` — never directly from mongo/memory adapters
- POST responses return status `201`
- Never call repository methods directly — always go through a use case
- Error handling: catch Zod errors (400) and unexpected errors (500)
