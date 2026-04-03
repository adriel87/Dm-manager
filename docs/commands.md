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

```bash
# Start MongoDB via Docker Compose
npm run dockerstart
# Credentials: dungeon_master / dice_roller  — Database: dungeon_master
# URI: mongodb://localhost:27017
```

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

# Run a single test file
npx vitest run __test__/application/usaCases/campaign/useCases.test.ts
```

> Note: the test folder has a typo — `usaCases` not `useCases`. This is intentional (legacy).

### Test file locations

```
__test__/
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
