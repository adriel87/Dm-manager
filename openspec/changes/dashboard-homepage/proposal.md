# Proposal: Dashboard Homepage

## Intent

Create a dashboard homepage that provides Dungeon Masters with a quick overview of their campaign data. Currently, the app lacks a central landing page showing key metrics and recent activity. This feature addresses the need for:

- Quick stats overview (campaigns, groups, players)
- Quick access to recent campaigns
- Quick access to recent groups with player details

## Scope

### In Scope

- **Dashboard Stats Block** (upper): Display key metrics:
  - Total campaigns
  - Active campaigns (status = 'active')
  - Total groups
  - Total human players (characters with playerName)
  - Next upcoming session date

- **Recent Campaigns Block** (left down): List of recent campaign cards showing:
  - Campaign title
  - Campaign state (active/completed/paused)
  - Associated group name
  - Sessions played count
  - Next/last session date

- **Recent Groups Block** (right down): List of recent groups with player details:
  - Real player name (from new `playerName` field)
  - Character name
  - Character class
  - Character level

- **Database Schema Change**: Add `playerName` optional field to Character entity

### Out of Scope

- Real-time updates (future enhancement)
- Dashboard customization/personalization
- Export/print dashboard data

## Approach

Follow the existing hexagonal architecture pattern:

1. **Domain Layer**:
   - Add `playerName?: string` to Character entity (`src/domain/character/character.ts`)
   - Update Character repository interface if needed

2. **Infrastructure Layer**:
   - Update MongoDB mapper to handle `playerName` field
   - Create new dashboard repository implementation

3. **Application Layer**:
   - Create `getDashboardStats` use case
   - Create `getRecentCampaigns` use case
   - Create `getRecentGroups` use case

4. **API Layer**:
   - Create `/api/dashboard/stats` endpoint
   - Create `/api/dashboard/recent-campaigns` endpoint
   - Create `/api/dashboard/recent-groups` endpoint

5. **Presentation Layer**:
   - Replace current homepage (`src/app/page.tsx`) with dashboard layout
   - Create dashboard components following HeroUI patterns

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/domain/character/character.ts` | Modified | Add playerName field |
| `src/domain/character/characterRepository.ts` | Modified | Add playerName to types |
| `src/infrastructure/adapters/mappers/characterMapper.ts` | Modified | Map playerName from MongoDB |
| `src/infrastructure/adapters/repositories/mongo/characterRepository.ts` | Modified | Handle playerName in queries |
| `src/infrastructure/adapters/schemas/characterSchema.ts` | Modified | Add playerName to Zod schema |
| `src/application/useCases/dashboard/` | New | Use cases for dashboard data |
| `src/app/api/dashboard/` | New | API routes for dashboard |
| `src/app/page.tsx` | Modified | Replace with dashboard UI |
| `src/components/dashboard/` | New | Dashboard UI components |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Breaking existing character queries | Low | playerName is optional, backwards compatible |
| Performance with large datasets | Medium | Add pagination/limits to recent items queries |
| UI layout on different screen sizes | Low | Use HeroUI Grid for responsive layout |

## Rollback Plan

If issues arise:

1. Revert `src/domain/character/character.ts` changes
2. Revert mapper and schema changes
3. Remove dashboard API routes
4. Restore original `src/app/page.tsx`
5. Remove dashboard components directory

No database migration rollback needed as playerName is optional.

## Dependencies

- Existing Character, Campaign, Group domain entities
- Existing MongoDB infrastructure
- HeroUI components (already in use)

## Success Criteria

- [ ] Dashboard displays all 5 stats correctly
- [ ] Recent campaigns show up to 5 most recent campaigns with correct data
- [ ] Recent groups show up to 5 most recent groups with player details
- [ ] playerName field can be added/edited via character forms
- [ ] UI matches existing app patterns (HeroUI, dark theme)
- [ ] All existing tests pass
- [ ] Dashboard loads within 2 seconds
