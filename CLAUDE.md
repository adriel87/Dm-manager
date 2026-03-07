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
