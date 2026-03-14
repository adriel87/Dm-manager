# DM Manager — Agent Context

**Stack**: Next.js 16 · TypeScript · MongoDB · HeroUI · Tailwind CSS v4 · Vitest · Playwright  
**Architecture**: Hexagonal (Ports & Adapters)  
**Purpose**: Web tool for Dungeon Masters to manage campaigns, missions, characters, sessions and groups.

---

## Quick Reference

| Topic | File |
|-------|------|
| Architecture, layers, data flow, route map | [`docs/architecture.md`](docs/architecture.md) |
| All npm scripts, test commands, E2E setup | [`docs/commands.md`](docs/commands.md) |
| Code conventions, naming, patterns | [`docs/conventions.md`](docs/conventions.md) |

> Details are split into focused files and loaded via `opencode.json → instructions`.  
> Read the relevant doc before making changes to a layer you're unfamiliar with.

---

## Critical Rules (always apply)

1. **Repository injection** — use cases receive the repository as first argument, never import concrete implementations inside them.
2. **`@/*` alias** — maps to `src/*`. Never use relative paths across layers.
3. **Layer boundaries** — domain never imports from infrastructure or application; application never imports from infrastructure.
4. **MongoDB IDs** — always `ObjectId` in DB, always `string id` in domain. Conversion only in mappers.
5. **Unit tests** — always mock repositories with `vi.fn()`. No real DB connections.
6. **E2E tests** — use Page Object Models (`e2e/pages/`). Locators: `getByRole` first, never CSS classes. Always clean up test data via API helpers.
