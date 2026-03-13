# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DM Manager is a Next.js 15 application for Dungeon Masters to manage tabletop RPG campaigns, missions, characters (PCs and NPCs), and player groups. It uses MongoDB as its database.

## Commands

```bash
# Development (runs lint first)
npm run dev

# Development without lint
npm run dev:no-lint

# Build
npm run build

# Start MongoDB via Docker
npm run dockerstart

# Generate a new hexagonal entity scaffold (interactive CLI)
npm run generate

# Run tests (watch mode)
npm test

# Run tests once
npm run test:run

# Run a single test file
npx vitest run __test__/application/usaCases/campaign/useCases.test.ts

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint
npm run lint:fix
```

## Architecture

The project follows **Hexagonal Architecture** (ports and adapters) with three main layers:

### Domain (`src/domain/`)
Pure domain entities and repository interfaces. Each entity has:
- `<entity>.ts` - Entity class/interface and validation functions
- `<entity>Repository.ts` - Repository interface (port)

Domain entities: `campaign`, `character`, `mission`, `group`

### Application (`src/application/useCases/`)
Use cases per entity. Each use case receives a repository instance as its first argument (dependency injection). Use cases call domain validation before delegating to the repository.

### Infrastructure (`src/infrastructure/`)
- `adapters/repositories/mongo/` - MongoDB repository implementations (adapters)
- `adapters/mappers/` - MongoDB document <-> domain entity mappers
- `adapters/schemas/` - Zod validation schemas for API input
- `config/mongodb.ts` - MongoDB connection via `getCollection(collectionName)`

### Presentation (`src/app/`)
Next.js App Router. API routes live in `src/app/api/<entity>/`. Routes import concrete repository implementations and Zod schemas directly, then call use cases.

### Data flow
```
API Route (Next.js)
  -> Zod schema validation (schemas/)
  -> Use case (application/useCases/)
    -> Domain validation (domain/)
    -> Repository interface (domain/)
      -> MongoDB repository impl (infrastructure/adapters/repositories/mongo/)
        -> Mapper (infrastructure/adapters/mappers/)
```

## Key Conventions

- **Repository injection**: Use cases take a `repository` as their first parameter — never import concrete repositories inside use cases.
- **`@/*` alias**: Maps to `src/*`. Use `@/domain/...`, `@/application/...`, etc.
- **MongoDB IDs**: Stored as `ObjectId`, mapped to string `id` in domain entities via mappers.
- **Tests**: Located in `__test__/` (note the typo: `usaCases` not `useCases`). Tests use Vitest with `vi.fn()` mocks for repositories — no real DB connections in unit tests.
- **Generating new entities**: Use `npm run generate` to scaffold the full hexagonal structure for a new entity interactively.

## Environment Variables

```
MONGODB_URI       # MongoDB connection URI (default: mongodb://localhost:27017)
MONGODB_DB        # Database name (default: mydatabase)
MONGODB_USERNAME  # MongoDB username
MONGODB_PASSWORD  # MongoDB password
```

Local development uses Docker Compose (`npm run dockerstart`) with credentials: `dungeon_master` / `dice_roller`, database: `dungeon_master`.

# Agent Teams Lite — Lean Orchestrator Instructions


## Spec-Driven Development (SDD) Orchestrator

You are the ORCHESTRATOR for Spec-Driven Development. Keep the same mentor identity and apply SDD as an overlay.

### Core Operating Rules
- Delegate-only: never do analysis/design/implementation/verification inline.
- Launch sub-agents via Task for all phase work.
- The lead only coordinates DAG state, user approvals, and concise summaries.
- `/sdd-new`, `/sdd-continue`, and `/sdd-ff` are meta-commands handled by the orchestrator (not skills).

### Artifact Store Policy
- `artifact_store.mode`: `engram | openspec | none`
- Default: `engram` when available; `openspec` only if user explicitly requests file artifacts; otherwise `none`.
- In `none`, do not write project files. Return results inline and recommend enabling `engram` or `openspec`.

### Commands
- `/sdd-init` → launch `sdd-init` sub-agent
- `/sdd-explore <topic>` → launch `sdd-explore` sub-agent
- `/sdd-new <change>` → run `sdd-explore` then `sdd-propose`
- `/sdd-continue [change]` → create next missing artifact in dependency chain
- `/sdd-ff [change]` → run `sdd-propose` → `sdd-spec` → `sdd-design` → `sdd-tasks`
- `/sdd-apply [change]` → launch `sdd-apply` in batches
- `/sdd-verify [change]` → launch `sdd-verify`
- `/sdd-archive [change]` → launch `sdd-archive`

### Dependency Graph
```
proposal -> specs --> tasks -> apply -> verify -> archive
             ^
             |
           design
```
- `specs` and `design` both depend on `proposal`.
- `tasks` depends on both `specs` and `design`.

### Sub-Agent Launch Pattern
When launching a phase, require the sub-agent to read `~/.claude/skills/sdd-{phase}/SKILL.md` first and return:
- `status`
- `executive_summary`
- `artifacts` (include IDs/paths)
- `next_recommended`
- `risks`

### State & Conventions (source of truth)
Keep this file lean. Do NOT inline full persistence and naming specs here.

Use shared convention files installed under `~/.claude/skills/_shared/`:
- `engram-convention.md` for artifact naming + two-step recovery
- `persistence-contract.md` for mode behavior + state persistence/recovery
- `openspec-convention.md` for file layout when mode is `openspec`

### Recovery Rule
If SDD state is missing (for example after context compaction), recover from backend state before continuing:
- `engram`: `mem_search(...)` then `mem_get_observation(...)`
- `openspec`: read `openspec/changes/*/state.yaml`
- `none`: explain that state was not persisted

### SDD Suggestion Rule
For substantial features/refactors, suggest SDD.
For small fixes/questions, do not force SDD.