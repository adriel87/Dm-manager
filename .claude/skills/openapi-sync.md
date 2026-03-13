# openapi-sync

TRIGGER when: the user asks to update, sync, or regenerate the OpenAPI spec, or when new API routes have been added.

## Job

Read all API routes, domain entities, and Zod schemas in the project, then rewrite `openapi.json` at the root to reflect every endpoint accurately.

## Steps

### 1. Discover all API routes
Use Glob to find every route file:
```
src/app/api/**/*.ts
```

### 2. Read each route file
For every file found, read it to identify:
- HTTP methods exported (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`)
- The URL path (derived from the file path: `src/app/api/campaign/[id]/route.ts` → `/api/campaign/{id}`)
- Whether it uses a Zod schema for input validation
- Response status codes returned

### 3. Read domain entities
For each entity referenced in the routes, read its domain file in `src/domain/<entity>/<entity>.ts` to extract:
- Interface fields and types
- Enums (status types, class types, etc.)

### 4. Read Zod schemas
Read `src/infrastructure/adapters/schemas/<entity>.schema.ts` for each entity to extract:
- Required vs optional fields
- Validation constraints (minLength, maxLength, min, max, enum values, defaults)

### 5. Rewrite openapi.json
Rewrite the file following these rules:
- Use OpenAPI 3.0.1
- Use `$ref` for all schemas — never inline repeated shapes
- Define schemas in `components/schemas` as `<Entity>` (response) and `<Entity>Input` (request body without `id`, `createdAt`, `updatedAt`)
- Define a shared `components/parameters/id` for all `{id}` path params
- Define a shared `components/responses/NotFound` for 404s
- Derive enum values directly from the domain (never guess)
- Tag endpoints by entity name
- Set `servers` to `[{ url: "http://localhost:3000", description: "Local development" }]`

## Rules

- Never add endpoints that don't have a real route file
- Never guess field types — always derive them from the domain or Zod schema
- If a route has no Zod schema validation, document the body as `{}` with a comment
- Keep existing documented fields unless the source code no longer has them
