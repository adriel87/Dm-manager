# DM Manager

**Stack**: Next.js 16 · TypeScript · MongoDB · HeroUI · Tailwind CSS v4 · Vitest · Playwright
**Architecture**: Hexagonal (Ports & Adapters)
**Purpose**: Web tool for Dungeon Masters to manage campaigns, missions, characters, sessions and groups.

## Critical Rules

1. **Repository injection** — use cases receive the repository as first argument, never import concrete implementations inside them.
2. **`@/*` alias** — maps to `packages/app/src/*`. Never use relative paths across layers.
3. **Layer boundaries** — domain never imports from infrastructure or application; application never imports from infrastructure.
4. **MongoDB IDs** — always `ObjectId` in DB, always `string id` in domain. Conversion only in mappers (`infrastructure/adapters/mappers/`).
5. **Zod validation** — only at API route boundary. Domain validation via `validateFn` in `packages/app/src/domain/`.
6. **Unit tests** — always mock repositories with `vi.fn()`. No real DB connections. Test folder: `packages/app/__test__/application/usaCases/` (legacy typo — keep it).
7. **E2E tests** — Page Object Models in `e2e/pages/`. Locators: `getByRole` first, never CSS classes. Always clean up test data via API helpers.
8. **Server Components first** — `'use client'` only for modals, filters, forms, tabs.
9. **Accessibility** — every HeroUI input needs `aria-label`. Buttons that open modals need `aria-label`. Errors use `role="alert"`.

## Architecture

```
packages/
  app/                ← Next.js application (@dm-manager/app)
    src/domain/       ← Entities + Repository interfaces (ports)
    src/application/  ← Use cases (orchestrate domain, injected repos)
    src/infrastructure/← MongoDB adapters, mappers, Zod schemas, config
    src/app/api/      ← Next.js API routes (Zod → use case → repository)
    src/app/          ← Next.js pages (Server Components)
    src/components/   ← UI components (HeroUI + Tailwind)
    __test__/         ← Unit tests (Vitest)
  bot/                ← Discord bot (@dm-manager/bot)
e2e/                  ← E2E tests (Playwright) — lives at repo root
scripts/              ← Repo-level tooling (generate.js, etc.)
```

## Agents

| Agent | Use when |
|-------|----------|
| `backend-dev` | Domain entities, use cases, MongoDB repos, mappers, API routes |
| `frontend-dev` | Pages, components, HeroUI modals, Server/Client components |
| `reviewer` | Code review — layer boundaries, conventions, accessibility |
| `vitest-coverage-expert` | Unit tests (Vitest) |
| `test-writer` | E2E tests (Playwright) |
| `nextjs-component-architect` | Complex Next.js pages, streaming, performance |

## Key Commands

```bash
npm run dev:no-lint          # Dev server (fast) — delegates to packages/app
npm run test:run             # Unit tests (Vitest) — delegates to packages/app
npm run test:bot             # Bot tests (Vitest) — runs in packages/bot
npm run test:all             # All unit tests (app + bot)
npm run test:e2e             # E2E tests (Playwright, needs dev server + mongo)
npm run dockerstart          # MongoDB via Docker

# From packages/app/
npx tsc --noEmit             # Type check
npm run lint                 # ESLint
npm run generate             # Scaffold new hexagonal entity (from repo root)
```

## Reference Docs

- [`docs/architecture.md`](docs/architecture.md) — Layers, data flow, route map
- [`docs/commands.md`](docs/commands.md) — All npm scripts, test setup
- [`docs/conventions.md`](docs/conventions.md) — Naming, patterns, env vars
