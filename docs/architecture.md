# Architecture — DM Manager

## Pattern: Hexagonal Architecture (Ports & Adapters)

Three concentric layers. Dependencies always point inward — inner layers never import from outer ones.

```
┌─────────────────────────────────────────────┐
│  Presentation (Next.js App Router)          │
│  src/app/  +  src/components/               │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  Application (Use Cases)              │  │
│  │  src/application/useCases/            │  │
│  │                                       │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  Domain (Entities + Ports)      │  │  │
│  │  │  src/domain/                    │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Infrastructure (Adapters)                  │
│  src/infrastructure/                        │
└─────────────────────────────────────────────┘
```

---

## Layer Breakdown

### Domain (`src/domain/`)
Pure business logic. No framework dependencies, no I/O.

Each entity has two files:
- `<entity>.ts` — Entity interface + validation functions
- `<entity>Repository.ts` — Repository interface (the **port**)

Entities: `campaign`, `character`, `mission`, `group`, `session`, `dashboard`

### Application (`src/application/useCases/`)
Orchestrates domain logic. One folder per entity.

Rules:
- Each use case receives its **repository as first argument** (dependency injection)
- Calls domain validation before delegating to the repository
- Never imports concrete repository implementations

### Infrastructure (`src/infrastructure/`)
Concrete implementations of domain ports (**adapters**).

```
src/infrastructure/
├── adapters/
│   ├── repositories/mongo/   ← MongoDB implementations of domain ports
│   ├── mappers/              ← MongoDB document ↔ domain entity conversion
│   └── schemas/              ← Zod validation schemas for API input
└── config/
    ├── mongodb.ts            ← getCollection(collectionName) connection helper
    └── repositories.ts       ← Singleton repository instances (injected into use cases)
```

### Presentation (`src/app/`)
Next.js 16 App Router. Two sub-layers:

**API routes** (`src/app/api/<entity>/`):
- Import Zod schemas for input validation
- Import repository instances from `infrastructure/config/repositories`
- Call use cases (never call repositories directly)

**UI** (`src/app/` pages + `src/components/`):
- Server Components fetch data via `fetchApi()` helper
- Client Component islands handle interactivity (modals, filters, tabs)

---

## Data Flow

```
HTTP Request
  └─► API Route (src/app/api/)
        ├─ Zod schema validation (infrastructure/adapters/schemas/)
        └─► Use Case (application/useCases/)
              ├─ Domain validation (domain/)
              └─► Repository interface (domain/<entity>Repository.ts)
                    └─► MongoDB adapter (infrastructure/adapters/repositories/mongo/)
                          └─► Mapper (infrastructure/adapters/mappers/)
                                └─► MongoDB collection
```

---

## Route Map

| URL | Type | Description |
|-----|------|-------------|
| `/` | Page (SC) | Dashboard — stats + recent campaigns/groups |
| `/campaigns` | Page (SC) | Campaign list |
| `/campaigns/[id]` | Page (SC) | Campaign detail — tabs: Missions, Sessions, Groups |
| `/characters` | Page (SC) | Character list with PC/NPC filter |
| `/groups` | Page (SC) | Group list |
| `/api/campaign` | API | GET list, POST |
| `/api/campaign/[id]` | API | GET, PUT, DELETE |
| `/api/character` | API | GET list, POST |
| `/api/character/[id]` | API | GET, PUT, DELETE |
| `/api/mission` | API | GET list, POST |
| `/api/mission/[id]` | API | GET, PUT, DELETE |
| `/api/session` | API | GET list, POST |
| `/api/session/[id]` | API | GET, PUT, DELETE |
| `/api/group` | API | GET list, POST |
| `/api/group/[id]` | API | GET, PUT, DELETE |
| `/api/dashboard/stats` | API | GET — global counts |
| `/api/dashboard/recent-campaigns` | API | GET `?limit=n` |
| `/api/dashboard/recent-groups` | API | GET `?limit=n` |

---

## MongoDB

- Connection via `getCollection(collectionName)` in `src/infrastructure/config/mongodb.ts`
- IDs stored as `ObjectId`, mapped to string `id` in domain entities via mappers
- Local dev uses Docker Compose (see `commands.md` for credentials)

---

## Scaffold Generator

Running `npm run generate` starts an interactive CLI that scaffolds the full hexagonal structure for a new entity:
- Domain entity + repository interface
- Use cases
- MongoDB adapter + mapper + Zod schema
- Test file stubs
