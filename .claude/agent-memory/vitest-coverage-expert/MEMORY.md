# DM Manager — Vitest Expert Memory

## Project Structure (confirmed)
- Tests: `__test__/` — subdirectory is `usaCases` (not `useCases`)
- Domain: `src/domain/<entity>/`
- Use cases: `src/application/useCases/<entity>/`
- Infrastructure: `src/infrastructure/adapters/`
- Path alias: `@/*` → `src/*`

## Test Run Status (as of 2026-03-08)
- 9 test files, 109 tests — ALL PASS
- Un-awaited `.resolves`/`.rejects` warnings FIXED in: character, group, missions, session use case tests
- New tests added: campaign (createCampaign, getAllCampaigns, updateCampaign branches), mission (validation, getMissionById, deleteMission, getAllMissions, updateMission)
- New domain test file: `__test__/domain/campaign.test.ts` (31 tests covering validateCampaign + Campaign class)

## Known Code Issues Found During Review

### campaign/createCampaign.ts — Error masking anti-pattern
- `catch` block swallows domain validation errors and always throws `"Failed to create campaign"`
- Tests cannot distinguish validation errors from repo errors
- No existing tests cover `createCampaign` at all

### campaign/campaignIncrementSessions.ts — Bug: post-increment
- Uses `campaign.sessions ++` (post-increment) — always passes the OLD value, never incremented
- Should be `++campaign.sessions` or `campaign.sessions + 1`
- Not tested at all

### campaign/deleteCampaign.ts — Missing id guard
- `delelteCampaign` calls `repository.deleteCampaign(null)` without validating id first
- Existing test passes `null` and expects `"Failed to delete campaign"` — only works because mock returns false
- Real repo would throw on null ObjectId

### campaign/updateCampaign.ts — Missing test for "Campaign not found" branch
- Branch where `getCampaignById` returns null throws `"Campaign not found"` — not tested
- Branch where `updateCampaign` returns null throws `"Failed to update campaign"` — not tested

### mission/updateMission.ts — No getMissionById call
- Unlike character/campaign update patterns, updateMission does NOT fetch existing mission first
- Goes directly to `repository.updateMission` — inconsistent with other use cases

### campaign.schema.ts — z.enum(CampaignStatus) with TS enum
- `CampaignStatus` is a TS enum, not a string array
- `z.enum()` requires a tuple, `z.nativeEnum()` should be used instead
- This may cause runtime issues when the schema is used in API routes

### campaign.ts — Duplicate update field
- `updateCampaign` method sets `this.name` twice (lines 52 and 55) — one is dead code

### mission.ts — validateMission does not check status
- `validateMission` checks name, description, missionGuide, missionPriority
- Does NOT validate `status` against `MissionStatus` enum

## Existing Coverage Gaps (no tests at all)

### Use cases with ZERO test coverage:
- `campaignIncrementSessions` — not exported from index, not tested

### Domain with ZERO test coverage:
- `validateMission` / `validateMissions` — no domain tests (covered indirectly via createMission tests)
- `createNewMission` — no tests
- `updateMissionParams` — no tests
- `CharacterEntity.updateCharacter()` method — not tested

### Infrastructure with ZERO test coverage:
- All mappers: `campaignMappers`, `characterMapper`, `MapperUtils`
- All Zod schemas: `campaignSchema`, `missionSchema`

## Patterns & Conventions

### Mock pattern for repositories:
```typescript
const mockRepo: SomeRepository = {
  method: vi.fn(),
}
beforeEach(() => vi.clearAllMocks())
```

### Always await .resolves/.rejects:
```typescript
// WRONG (deprecation warning, will fail Vitest 3):
expect(result).resolves.toEqual(x)
// CORRECT:
await expect(result).resolves.toEqual(x)
// OR:
const value = await result; expect(value).toEqual(x)
```

### createCampaign wraps all errors — test must expect "Failed to create campaign":
- Domain validation errors are swallowed and re-thrown as this message
- Unlike createMission which lets validation errors bubble up directly

## File Naming Conventions
- Test files: `__test__/application/usaCases/<entity>/useCases.test.ts` (or descriptive name)
- Domain tests: `__test__/domain/<entity>.test.ts`
- No infrastructure/mapper tests exist yet

## Dependencies
- No extra test deps needed for unit tests (Vitest only)
- For future integration/API route tests: would need `msw` or direct handler testing
