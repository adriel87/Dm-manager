# Tasks: Groups Management Menu

## Phase 1: Navigation

- [ ] 1.1 Add "Groups" nav item to `src/components/layout/Sidebar.tsx` with Users icon

## Phase 2: Page Component

- [ ] 2.1 Create `src/app/groups/page.tsx` - Server Component that fetches groups and campaigns
- [ ] 2.2 Add metadata export (title, description) to groups page

## Phase 3: UI Components

- [ ] 3.1 Create `src/components/groups/GroupCard.tsx` - Display component (re-export GroupItem with compatible interface)
- [ ] 3.2 Create `src/components/groups/CreateGroupButton.tsx` - Modal form for creating groups with:
  - Name input (required)
  - Description textarea (optional)
  - Member multi-select autocomplete (fetch characters from `/api/character`)
  - Campaign select dropdown (fetch campaigns from `/api/campaign`)
- [ ] 3.3 Create `src/components/groups/GroupFilters.tsx` - Client component that:
  - Receives all groups and campaigns as props
  - Displays grid of GroupCard components
  - Handles empty state
  - Owns edit/delete actions via modal

## Phase 4: Implementation Details

- [ ] 4.1 Create reusable `GroupModal.tsx` component for create/edit form (shared between CreateGroupButton and inline edit)
- [ ] 4.2 Implement edit functionality - open pre-filled modal
- [ ] 4.3 Implement delete with confirmation dialog
- [ ] 4.4 Handle campaign assignment via PUT to `/api/group/[id]`

## Phase 5: Verification

- [ ] 5.1 Run `npm run lint` to check for errors
- [ ] 5.2 Verify page renders at `/groups`
- [ ] 5.3 Test create group flow
- [ ] 5.4 Test edit group flow
- [ ] 5.5 Test delete group flow
- [ ] 5.6 Verify group appears in campaign detail if assigned
