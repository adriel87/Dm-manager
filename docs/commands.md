# Commands — DM Manager

## Development

```bash
# Start dev server (runs ESLint first)
npm run dev

# Start dev server without lint (faster iteration)
npm run dev:no-lint

# Production build (runs ESLint first)
npm run build

# Production build without lint
npm run build:no-lint

# Start production server
npm start
```

## Infrastructure

### MongoDB only (local development)

```bash
# Start only MongoDB (fast, for local dev with npm run dev:no-lint)
npm run dockerstart
# Credentials: dungeon_master / dice_roller  — Database: dungeon_master
# URI: mongodb://localhost:27017
```

### Full stack via Docker Compose

The root `docker-compose.yml` builds and runs all three services together: MongoDB, the Next.js app, and the Discord bot.

```bash
# Build all images and start all services
docker compose up --build

# Start without rebuilding (images already built)
docker compose up

# Run in background (detached)
docker compose up -d

# Stop all services
docker compose down
```

**Services:**

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| `mongodb` | `mongodb` | 27017 | MongoDB database |
| `app` | `dm-manager-app` | 3000 | Next.js application |
| `bot` | `dm-manager-bot` | — | Discord bot |

**Build context:** all services use the repo root (`.`) as build context. The Dockerfiles live at `packages/app/Dockerfile` and `packages/bot/Dockerfile` and rely on the root `package-lock.json` and npm workspaces.

**Environment:**
- App env vars can be placed in `packages/app/.env` (loaded automatically, not required)
- Bot env vars can be placed in `packages/bot/.env` (loaded automatically, not required)
- When running via compose, `MONGODB_URI` and `MONGODB_DB` are injected automatically; the bot receives `DM_MANAGER_URL=http://app:3000`

> Note: `npm run dockerstart` only starts MongoDB. Use `docker compose up` to run the full stack including the app and bot.

## Code Generation

```bash
# Interactive scaffold for a new hexagonal entity
# Creates: domain entity, repository interface, use cases,
#          MongoDB adapter, mapper, Zod schema, test stubs
npm run generate
# alias:
npm run gen
```

## Linting

```bash
npm run lint          # Check
npm run lint:fix      # Auto-fix
```

## Unit Tests (Vitest)

```bash
npm test              # Watch mode
npm run test:run      # Run once
npm run test:coverage # Run with coverage report
npm run test:ui       # Vitest UI in browser
npm run test:bot      # Bot tests only (packages/bot)
npm run test:all      # App + bot tests in sequence

# Run a single test file
npx vitest run packages/app/__test__/application/usaCases/campaign/useCases.test.ts
```

> Note: the test folder has a typo — `usaCases` not `useCases`. This is intentional (legacy).

### Test file locations

```
packages/app/__test__/
├── domain/
│   ├── campaign.test.ts
│   ├── character.test.ts
│   └── group.test.ts
└── application/usaCases/
    ├── campaign/useCases.test.ts
    ├── character/useCases.test.ts
    ├── missions/missionUseCase.test.ts
    ├── session/useCases.test.ts
    ├── group/useCases.test.ts
    ├── dashboard/useCases.test.ts
    ├── play/playModeCharacters.test.ts
    └── recording/useCases.test.ts
```

## E2E Tests (Playwright)

```bash
npm run test:e2e           # Run all E2E tests (headless)
npm run test:e2e:ui        # Playwright UI (interactive)
npm run test:e2e:headed    # Run with visible browser
npm run test:e2e:debug     # Debug mode (PWDEBUG=1)

# Run a single spec file
npx playwright test e2e/campaigns.spec.ts

# Run tests matching a pattern
npx playwright test --grep "TC-03"

# Show last HTML report
npx playwright show-report
```

> E2E tests require the dev server running (`npm run dev:no-lint`) and MongoDB up (`npm run dockerstart`).
> Playwright config: `playwright.config.ts` — baseURL: `http://localhost:3000`, browser: Chromium.

### E2E file locations

```
e2e/
├── helpers/
│   └── api.ts                  ← API helpers: createCampaign, deleteCharacter, etc.
├── pages/                      ← Page Object Models
│   ├── campaigns.page.ts
│   ├── characters.page.ts
│   ├── campaign-detail.page.ts
│   └── play-mode.page.ts
├── campaigns.spec.ts           ← TC-01 to TC-06
├── characters.spec.ts          ← TC-13 to TC-18
├── campaign-detail.spec.ts     ← TC-07 to TC-12
├── inventory.spec.ts           ← Inventory management
└── play-mode.spec.ts           ← Play Mode flows
```

## TypeScript

```bash
npx tsc --noEmit   # Type check without emitting files
```
