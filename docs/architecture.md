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

### Domain (`packages/app/src/domain/`)
Pure business logic. No framework dependencies, no I/O.

Each entity has two files:
- `<entity>.ts` — Entity interface + validation functions
- `<entity>Repository.ts` — Repository interface (the **port**)

Entities: `campaign`, `character`, `mission`, `group`, `session`, `dashboard`, `recording`

### Application (`packages/app/src/application/useCases/`)
Orchestrates domain logic. One folder per entity.

Rules:
- Each use case receives its **repository as first argument** (dependency injection)
- Calls domain validation before delegating to the repository
- Never imports concrete repository implementations

### Infrastructure (`packages/app/src/infrastructure/`)
Concrete implementations of domain ports (**adapters**).

```
packages/app/src/infrastructure/
├── adapters/
│   ├── repositories/mongo/   ← MongoDB implementations of domain ports
│   ├── mappers/              ← MongoDB document ↔ domain entity conversion
│   ├── schemas/              ← Zod validation schemas for API input
│   ├── storage/              ← StorageProvider implementations (local.storage)
│   └── transcription/        ← TranscriptionProvider implementations (whisper-api, whisper-local)
└── config/
    ├── mongodb.ts            ← getCollection(collectionName) connection helper
    ├── repositories.ts       ← Singleton repository instances (injected into use cases)
    ├── storage.ts            ← StorageProvider selection (env-driven)
    └── transcription.ts      ← TranscriptionProvider selection (env-driven)
```

### Presentation (`packages/app/src/app/`)
Next.js 16 App Router. Two sub-layers:

**API routes** (`packages/app/src/app/api/<entity>/`):
- Import Zod schemas for input validation
- Import repository instances from `infrastructure/config/repositories`
- Call use cases (never call repositories directly)

**UI** (`packages/app/src/app/` pages + `packages/app/src/components/`):
- Server Components fetch data via `fetchApi()` helper
- Client Component islands handle interactivity (modals, filters, tabs)
- Play Mode page (`/campaigns/[id]/play`) is a full Client Component island — see [Play Mode](#play-mode)

---

## Data Flow

```
HTTP Request
  └─► API Route (packages/app/src/app/api/)
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

### Pages

| URL | Type | Description |
|-----|------|-------------|
| `/` | Page (SC) | Dashboard — stats + recent campaigns/groups |
| `/campaigns` | Page (SC) | Campaign list |
| `/campaigns/[id]` | Page (SC) | Campaign detail — tabs: Missions, Sessions, Groups, Notes, Inventory |
| `/campaigns/[id]/play` | Page (CC) | Play Mode — live session management |
| `/characters` | Page (SC) | Character list with PC/NPC filter |
| `/groups` | Page (SC) | Group list |

### API Routes

**Top-level entities:**

| URL | Methods | Description |
|-----|---------|-------------|
| `/api/campaign` | GET, POST | Campaign list and creation |
| `/api/campaign/[id]` | GET, PUT, DELETE | Single campaign |
| `/api/character` | GET, POST | Character list and creation |
| `/api/character/[id]` | GET, PUT, DELETE | Single character |
| `/api/mission` | GET, POST | Mission list and creation |
| `/api/mission/[id]` | GET, PUT, DELETE | Single mission |
| `/api/session` | GET, POST | Session list and creation |
| `/api/session/[id]` | GET, PUT, DELETE | Single session |
| `/api/group` | GET, POST | Group list and creation |
| `/api/group/[id]` | GET, PUT, DELETE | Single group |
| `/api/dashboard/stats` | GET | Global counts |
| `/api/dashboard/recent-campaigns` | GET `?limit=n` | Recent campaigns |
| `/api/dashboard/recent-groups` | GET `?limit=n` | Recent groups |

**Campaign nested aggregate operations:**

| URL | Methods | Description |
|-----|---------|-------------|
| `/api/campaign/[id]/characters` | GET, POST | List / assign character to campaign |
| `/api/campaign/[id]/characters/[cId]` | DELETE | Remove character from campaign |
| `/api/campaign/[id]/missions` | GET | Campaign missions |
| `/api/campaign/[id]/missions/[mId]` | PUT, DELETE | Update / remove mission |
| `/api/campaign/[id]/sessions` | GET | Campaign sessions |
| `/api/campaign/[id]/sessions/[sId]` | PUT, DELETE | Update / remove session |
| `/api/campaign/[id]/group` | POST, DELETE | Assign / remove group |
| `/api/campaign/[id]/notes` | GET, POST | List / create note |
| `/api/campaign/[id]/notes/[nId]` | DELETE | Delete note |
| `/api/campaign/[id]/inventory` | GET, POST | List / add inventory item |
| `/api/campaign/[id]/inventory/[iId]` | PUT, DELETE | Update / remove inventory item |
| `/api/campaign/[id]/inventory/money` | POST | Transfer money between characters |
| `/api/campaign/[id]/speaker-mappings` | POST | Set speaker-to-character mappings |

**Recording:**

| URL | Methods | Description |
|-----|---------|-------------|
| `/api/campaign/[id]/recordings` | GET, POST | List / start recording |
| `/api/campaign/[id]/recordings/[rId]` | GET | Get single recording |
| `/api/campaign/[id]/recordings/[rId]/stop` | POST | Stop an active recording |
| `/api/campaign/[id]/recordings/[rId]/transcribe` | POST | Trigger transcription |

---

## MongoDB

- Connection via `getCollection(collectionName)` in `packages/app/src/infrastructure/config/mongodb.ts`
- IDs stored as `ObjectId`, mapped to string `id` in domain entities via mappers
- Local dev uses Docker Compose (see `commands.md` for credentials)

---

## Recording

The Recording entity uses two extra ports beyond the standard `RecordingRepository`:

- **`StorageProvider`** (`packages/app/src/domain/recording/StorageProvider.ts`) — save/retrieve audio files. Implementation: `local.storage` (`infrastructure/adapters/storage/`). Selected via `packages/app/src/infrastructure/config/storage.ts`.
- **`TranscriptionProvider`** (`packages/app/src/domain/recording/TranscriptionProvider.ts`) — transcribe audio to text. Implementations: `whisper-api` (OpenAI API) and `whisper-local` (local Whisper binary). Selected via `packages/app/src/infrastructure/config/transcription.ts`.

Use cases in `packages/app/src/application/useCases/recording/`:
`startRecording`, `stopRecording`, `getRecording`, `getRecordingsBySession`, `transcribeRecording`, `retryTranscription`, `index`

---

## Play Mode

Page: `packages/app/src/app/campaigns/[id]/play/page.tsx` — Server Component shell that passes data down to the Client island.

**Component tree** (`packages/app/src/infrastructure/presentation/components/play/`):

```
PlayModeView (CC — root island)
├── PlayModeActionMenu
├── CharacterPanel
│   ├── CreateCharacterInPlayModal
│   └── AddExistingCharacterModal
├── MissionPanel
│   └── MissionPlayCard
├── SessionPanel
│   ├── EditSessionButton
│   └── SessionHistoryItem
├── NotesPanel
│   └── SessionNotesEditor
└── RecordingPanel
    ├── TranscriptionView
    └── SpeakerMappingModal
```

Supporting hooks: `useBeforeUnload` — prompts the user before leaving with an active session.

---

## Docker / Deployment

The project is a monorepo with two deployable packages: `packages/app` (Next.js) and `packages/bot` (Discord bot).

### Build context

Both Dockerfiles use the **repo root** as their build context so they can access the root `package-lock.json` and workspace manifest. The `docker-compose.yml` at the repo root wires this together:

```yaml
app:
  build:
    context: .
    dockerfile: packages/app/Dockerfile

bot:
  build:
    context: .
    dockerfile: packages/bot/Dockerfile
```

### Workspace-aware installs

Inside each Dockerfile, dependencies are installed using the root lock file and npm workspaces:

```dockerfile
COPY package.json package-lock.json ./
COPY packages/app/package.json ./packages/app/
RUN npm ci --workspace=packages/app
```

This ensures the root `node_modules/` layout is reproduced correctly inside the image — important because Tailwind CSS v4 resolves `@heroui/theme` from the root `node_modules/`, not from `packages/app/node_modules/`.

### Root `.dockerignore`

A `.dockerignore` at the repo root prevents `node_modules/`, `.next/`, `dist/`, test files, `.git`, and `.claude/` from being sent to the build daemon.

### Services

| Service | Image source | Exposed port |
|---------|-------------|-------------|
| `mongodb` | `mongo` (Docker Hub) | 27017 |
| `app` | `packages/app/Dockerfile` | 3000 |
| `bot` | `packages/bot/Dockerfile` | — |

The bot is linked to the app via `DM_MANAGER_URL=http://app:3000` (Docker internal network). Bot state is persisted in a named volume (`bot-data`) mounted at `/app/data`.

---

## Scaffold Generator

Running `npm run generate` starts an interactive CLI that scaffolds the full hexagonal structure for a new entity:
- Domain entity + repository interface
- Use cases
- MongoDB adapter + mapper + Zod schema
- Test file stubs
