# Conventions — DM Manager

## Path Alias

`@/*` maps to `src/*`. Always use this alias — never relative paths that cross layer boundaries.

```typescript
// ✅ Correct
import { createCampaign } from '@/application/useCases/campaign';
import { campaignSchema } from '@/infrastructure/adapters/schemas/campaign.schema';

// ❌ Avoid
import { createCampaign } from '../../../application/useCases/campaign';
```

---

## Repository Injection

Use cases always receive the repository as their **first parameter**. Never import concrete repositories inside use cases.

```typescript
// ✅ Correct — use case receives repository as argument
export async function getCampaignById(repository: CampaignRepository, id: string) {
  return repository.findById(id);
}

// ❌ Wrong — concrete import inside use case breaks hexagonal boundaries
import { MongoCampaignRepository } from '@/infrastructure/...';
```

API routes wire the dependency:
```typescript
// src/app/api/campaign/[id]/route.ts
import { repositories } from '@/infrastructure/config/repositories';
const campaign = await getCampaignById(repositories.campaign, id);
```

---

## MongoDB IDs

- Stored in MongoDB as `ObjectId`
- Exposed in the domain and API as `string` field named `id`
- Conversion happens exclusively in mappers (`infrastructure/adapters/mappers/`)
- Never manipulate `ObjectId` outside the infrastructure layer

---

## Zod Schemas

- Live in `src/infrastructure/adapters/schemas/`
- Used only at the API route boundary (input validation)
- Domain validation functions in `src/domain/` are separate and do not use Zod

---

## Unit Tests

- Framework: **Vitest** with `vi.fn()` mocks
- Location: `__test__/` (note: subfolder is `usaCases`, not `useCases` — legacy typo, keep it)
- No real DB connections in unit tests — repositories are always mocked
- Pattern: one describe block per use case function

```typescript
describe('createCampaign', () => {
  it('should create a campaign with valid data', async () => {
    const mockRepo = { create: vi.fn().mockResolvedValue(mockCampaign) };
    const result = await createCampaign(mockRepo, validData);
    expect(mockRepo.create).toHaveBeenCalledWith(validData);
    expect(result).toEqual(mockCampaign);
  });
});
```

---

## E2E Tests

- Framework: **Playwright** — Chromium only, `baseURL: http://localhost:3000`
- Location: `e2e/`
- Pattern: **Page Object Models** in `e2e/pages/`, API helpers in `e2e/helpers/api.ts`
- Locator priority: `getByRole` > `getByLabel` > `getByText` > `getByTestId` (never CSS classes)
- Data isolation: every test creates and deletes its own data via API helpers
- Naming: `TC-{number}: {action} — {expected result}`

---

## UI Components

- Library: **HeroUI** (`@heroui/react`) + **Tailwind CSS v4**
- HeroUI inputs use `aria-label` on the component (not a wrapping `<label>`), so `getByLabel('aria-label value')` works in Playwright
- Animations: **Framer Motion**
- Color palette and style constants: `src/constants/ui.ts`
- Domain constants (status options, D&D classes, etc.): `src/constants/domain.ts`

---

## Server vs Client Components

- Default: **Server Components** (fetch data server-side, no `'use client'`)
- `'use client'` only when needed: modals, filter toggles, tab state, forms
- Pattern: SC parent fetches data → passes to CC island for interactivity

---

## Environment Variables

```
MONGODB_URI       # Default: mongodb://localhost:27017
MONGODB_DB        # Default: mydatabase
MONGODB_USERNAME  # Local: dungeon_master
MONGODB_PASSWORD  # Local: dice_roller
```

Local dev database name: `dungeon_master`

---

## File Naming

| Layer | Pattern | Example |
|-------|---------|---------|
| Domain entity | `<entity>.ts` | `campaign.ts` |
| Domain port | `<entity>Repository.ts` | `campaignRepository.ts` |
| Mongo adapter | `mongo<Entity>Repository.ts` | `mongoCampaignRepository.ts` |
| Mapper | `<entity>.mapper.ts` | `campaign.mapper.ts` |
| Zod schema | `<entity>.schema.ts` | `campaign.schema.ts` |
| Use case file | `<entity>UseCases.ts` | `campaignUseCases.ts` |
| Page component | `page.tsx` | `src/app/campaigns/page.tsx` |
| UI component | `PascalCase.tsx` | `CampaignCard.tsx` |
| E2E spec | `<feature>.spec.ts` | `campaigns.spec.ts` |
| E2E POM | `<feature>.page.ts` | `campaigns.page.ts` |
