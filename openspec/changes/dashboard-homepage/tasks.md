# Tasks: Dashboard Homepage

## Change
- **Change**: dashboard-homepage
- **Status**: Implementation completed
- **Location**: openspec/changes/dashboard-homepage/tasks.md

## Phase 1: Domain & Infrastructure Foundation (Character Changes)

- [x] 1.1 Add `playerName?: string` field to `src/domain/character/character.ts` Character interface
- [x] 1.2 Update `src/infrastructure/adapters/mappers/character.mapper.ts` to map `playerName` from MongoDB document
- [x] 1.3 Update `src/infrastructure/adapters/schemas/character.schema.ts` to add `playerName: z.string().optional()` to Zod schema

## Phase 2: Domain Layer - Dashboard Types & Repository Interface

- [x] 2.1 Create `src/domain/dashboard/dashboard.ts` with DashboardStats, DashboardCampaign, DashboardGroup, DashboardGroupMember interfaces
- [x] 2.2 Create `src/domain/dashboard/dashboardRepository.ts` with DashboardRepository interface (getStats, getRecentCampaigns, getRecentGroups)

## Phase 3: Application Layer - Dashboard Use Cases

- [x] 3.1 Create `src/application/useCases/dashboard/index.ts` with getDashboardStats, getRecentCampaigns, getRecentGroups use cases

## Phase 4: Infrastructure - Dashboard Repository Implementation

- [x] 4.1 Create `src/infrastructure/adapters/repositories/mongo/dashboard.repository.ts` with MongoDB implementation (getStats, getRecentCampaigns, getRecentGroups)
- [x] 4.2 Register dashboard repository in `src/infrastructure/config/repositories.ts`

## Phase 5: API Layer Endpoints

- [x] 5.1 Create `src/app/api/dashboard/stats/route.ts` - GET endpoint returning DashboardStats
- [x] 5.2 Create `src/app/api/dashboard/recent-campaigns/route.ts` - GET endpoint with optional limit query param
- [x] 5.3 Create `src/app/api/dashboard/recent-groups/route.ts` - GET endpoint with optional limit query param

## Phase 6: UI Components - Dashboard

- [x] 6.1 Create `src/components/dashboard/DashboardStats.tsx` - Stats card grid component
- [x] 6.2 Create `src/components/dashboard/RecentCampaigns.tsx` - Recent campaigns list component
- [x] 6.3 Create `src/components/dashboard/RecentGroups.tsx` - Recent groups with members component

## Phase 7: Presentation Layer - Homepage Update

- [x] 7.1 Update `src/app/page.tsx` to replace campaign list with dashboard layout using new components

## Phase 8: Testing

- [x] 8.1 Create `__test__/application/usaCases/dashboard/useCases.test.ts` with unit tests for getDashboardStats, getRecentCampaigns, getRecentGroups

## Phase 9: Verification

- [x] 9.1 Run lint to ensure no code quality issues
- [x] 9.2 Run tests to verify all tests pass
- [x] 9.3 Verify build succeeds (fixed pre-existing type errors in group and mission schemas)
- [ ] 9.4 Manual verification: Check dashboard loads with stats, recent campaigns, recent groups

---

## Implementation Order

1. Started with Phase 1 (Character changes) - foundational for later work
2. Phase 2-3 (Domain/Use Cases) - defined interfaces before implementation
3. Phase 4 (Repository impl) - implemented interfaces from Phase 2
4. Phase 5 (API) - connected use cases to HTTP endpoints
5. Phase 6 (UI Components) - built presentation components
6. Phase 7 (Homepage) - integrated everything on the main page
7. Phase 8 (Tests) - ensured coverage (8 tests added)
8. Phase 9 (Verification) - lint passes, unit tests pass

## Notes

- The `playerName` field is optional - existing data won't break
- Dashboard queries are limited to 5 items by default (can be customized via query param)
- Followed hexagonal architecture: domain types → use cases → repository impl → API → UI

## Next Step
Ready for verification (sdd-verify) - need to fix pre-existing type error in group schema before build succeeds.
