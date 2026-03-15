# Phase 6 Cleanup Checklist — Campaign Aggregate Root

**Status**: ⏳ PENDING (Defer for 2 weeks in production)  
**Created**: 2026-03-15  
**Execute After**: 2026-03-29 (14 days from migration)  
**Reason**: Deprecated standalone mission/session entities replaced by Campaign aggregate

---

## Overview

This checklist documents all files to delete after the 2-week deprecation period for standalone missions and sessions. These entities are now embedded within the Campaign aggregate root.

**IMPORTANT**: Do NOT execute this cleanup until:
1. Migration script has been run in production (`scripts/migrate-campaign-aggregate.ts`)
2. All clients have migrated to the new aggregate API routes
3. 14 days have passed since deprecation notices were deployed
4. Verification confirms no traffic to old endpoints

---

## Pre-Deletion Verification

Before deleting any files, verify the following:

- [ ] Migration script ran successfully (`scripts/migrate-campaign-aggregate.ts`)
- [ ] All campaigns have `missions`, `sessions`, `characters`, `group` fields populated
- [ ] API monitoring shows zero requests to deprecated routes for 7+ days:
  - `/api/mission` (GET, POST)
  - `/api/mission/[id]` (GET, PUT, DELETE)
  - `/api/session` (GET, POST)
  - `/api/session/[id]` (GET, PUT, DELETE)
- [ ] All E2E tests pass with new aggregate routes
- [ ] UI components updated to use new aggregate endpoints
- [ ] Backup of production database taken

---

## Files to Delete (18 Total)

### Domain Layer (4 files)

**P6-T02 Requirement**: FR-20, FR-21, FR-22

```bash
# Mission domain files
rm src/domain/mission/mission.ts
rm src/domain/mission/MissionRespository.ts

# Session domain files
rm src/domain/session/session.ts
rm src/domain/session/sessionRepository.ts
```

**Impact**: Removes standalone domain entities. All mission/session logic now in `src/domain/campaign/campaign.ts`.

---

### Application Layer (2 folders)

**P6-T02 Requirement**: FR-20, FR-21, FR-22

```bash
# Mission use cases (entire folder)
rm -rf src/application/useCases/mission/

# Session use cases (entire folder)
rm -rf src/application/useCases/session/
```

**Files removed**:
- `src/application/useCases/mission/createMission.ts`
- `src/application/useCases/mission/getMissions.ts`
- `src/application/useCases/mission/getMissionById.ts`
- `src/application/useCases/mission/updateMission.ts`
- `src/application/useCases/mission/deleteMission.ts`
- `src/application/useCases/mission/index.ts`
- `src/application/useCases/session/createSession.ts`
- `src/application/useCases/session/getSessions.ts`
- `src/application/useCases/session/getSessionById.ts`
- `src/application/useCases/session/getSessionsByCampaign.ts`
- `src/application/useCases/session/updateSession.ts`
- `src/application/useCases/session/deleteSession.ts`
- `src/application/useCases/session/index.ts`

**Impact**: Use cases now handled by campaign aggregate use cases (`src/application/useCases/campaign/campaignAddMission.ts`, etc.).

---

### Infrastructure Layer (4 files)

**P6-T02 Requirement**: FR-20, FR-21, FR-22

```bash
# MongoDB repositories
rm src/infrastructure/adapters/repositories/mongo/mission.repository.ts
rm src/infrastructure/adapters/repositories/mongo/session.repository.ts

# Memory repositories (for REPOSITORY_TYPE=memory)
rm src/infrastructure/adapters/repositories/memory/mission.repository.ts
rm src/infrastructure/adapters/repositories/memory/session.repository.ts

# Mappers
rm src/infrastructure/adapters/mappers/mission.mapper.ts
rm src/infrastructure/adapters/mappers/session.mapper.ts

# Zod schemas
rm src/infrastructure/adapters/schemas/mission.schema.ts
rm src/infrastructure/adapters/schemas/session.schema.ts
```

**Impact**: All mission/session persistence now handled by campaign repository mappers.

---

### API Routes (4 files)

**P6-T03 Requirement**: FR-18, FR-19

```bash
# Mission routes (deprecated with 410 Gone)
rm src/app/api/mission/route.ts
rm src/app/api/mission/[id]/route.ts

# Session routes (deprecated with 410 Gone)
rm src/app/api/session/route.ts
rm src/app/api/session/[id]/route.ts
```

**Impact**: All routes now return 410 Gone. These files serve no purpose after 2-week period.

**New endpoints to use**:
- Missions: `/api/campaign/[id]/mission` (all CRUD)
- Sessions: `/api/campaign/[id]/session` (all CRUD)

---

### Test Files (2 files)

**P6-T02 Requirement**: FR-20, FR-21, FR-22

```bash
# Mission tests
rm __test__/application/usaCases/missions/missionUseCase.test.ts

# Session tests
rm __test__/application/usaCases/session/useCases.test.ts
```

**Impact**: Test coverage now in `__test__/application/usaCases/campaign/useCases.test.ts` (130+ tests cover aggregate operations).

---

## Repository Configuration Updates

After deleting files, update `src/infrastructure/config/repositories.ts`:

```typescript
// BEFORE (remove these lines)
import { missionRepository } from '../adapters/repositories/mongo/mission.repository';
import { sessionRepository } from '../adapters/repositories/mongo/session.repository';

export const repositories = {
  campaign: campaignRepository,
  character: characterRepository,
  group: groupRepository,
  mission: missionRepository,       // ❌ REMOVE
  session: sessionRepository,       // ❌ REMOVE
  dashboard: dashboardRepository,
};

// AFTER (clean version)
export const repositories = {
  campaign: campaignRepository,
  character: characterRepository,
  group: groupRepository,
  dashboard: dashboardRepository,
};
```

---

## Post-Deletion Verification

After executing deletions:

- [ ] Run `npx tsc --noEmit` — should pass with no errors
- [ ] Run `npm run lint` — should pass
- [ ] Run `npm run test:run` — all unit tests pass
- [ ] Run `npm run build` — production build succeeds
- [ ] Run `npm run test:e2e` — all E2E tests pass
- [ ] Manual smoke test: Create campaign → Add mission → Add session → View details
- [ ] Check production logs for any errors related to missing modules

---

## Rollback Plan

If issues occur after deletion:

1. **Restore from Git**: `git revert <commit-hash>`
2. **Restore from backup**: Copy files from `git show <commit>:path/to/file.ts`
3. **Re-enable routes**: Remove 410 Gone responses, restore use cases
4. **Monitor**: Watch for errors, plan additional migration time

---

## Execution Script

For convenience, here's a single script to execute all deletions:

```bash
#!/bin/bash
# Execute ONLY after 2-week deprecation period and verification

set -e

echo "🗑️  Phase 6 Cleanup — Deleting deprecated mission/session files"
echo "This will delete 18 files. Press Ctrl+C to cancel, or Enter to continue."
read

# Domain layer
rm src/domain/mission/mission.ts
rm src/domain/mission/MissionRespository.ts
rm src/domain/session/session.ts
rm src/domain/session/sessionRepository.ts

# Application layer
rm -rf src/application/useCases/mission/
rm -rf src/application/useCases/session/

# Infrastructure layer
rm src/infrastructure/adapters/repositories/mongo/mission.repository.ts
rm src/infrastructure/adapters/repositories/mongo/session.repository.ts
rm src/infrastructure/adapters/repositories/memory/mission.repository.ts
rm src/infrastructure/adapters/repositories/memory/session.repository.ts
rm src/infrastructure/adapters/mappers/mission.mapper.ts
rm src/infrastructure/adapters/mappers/session.mapper.ts
rm src/infrastructure/adapters/schemas/mission.schema.ts
rm src/infrastructure/adapters/schemas/session.schema.ts

# API routes
rm src/app/api/mission/route.ts
rm src/app/api/mission/[id]/route.ts
rm src/app/api/session/route.ts
rm src/app/api/session/[id]/route.ts

# Tests
rm __test__/application/usaCases/missions/missionUseCase.test.ts
rm __test__/application/usaCases/session/useCases.test.ts

echo "✅ All files deleted. Next steps:"
echo "1. Update src/infrastructure/config/repositories.ts (remove mission/session)"
echo "2. Run: npx tsc --noEmit"
echo "3. Run: npm run lint"
echo "4. Run: npm run test:run"
echo "5. Run: npm run build"
echo "6. Deploy and monitor"
```

Save this as `scripts/cleanup-deprecated-entities.sh` and run with:

```bash
chmod +x scripts/cleanup-deprecated-entities.sh
./scripts/cleanup-deprecated-entities.sh
```

---

## References

- **Migration Script**: `scripts/migrate-campaign-aggregate.ts`
- **Functional Requirements**: FR-18, FR-19, FR-20, FR-21, FR-22, FR-23
- **New API Routes**: `src/app/api/campaign/[id]/mission/`, `src/app/api/campaign/[id]/session/`
- **Aggregate Tests**: `__test__/application/usaCases/campaign/useCases.test.ts`

---

## Sign-Off

Before executing this cleanup, obtain approval from:

- [ ] Tech Lead (code review)
- [ ] DevOps (backup confirmation)
- [ ] Product Manager (API migration confirmed)

**Executed by**: _________________  
**Date**: _________________  
**Verification Status**: _________________
