# Proposal: Groups Management Menu

## Intent

Create a dedicated UI page to manage groups (player parties) independently from campaigns. Currently, groups can only be viewed within a campaign's detail page, but there's no way to create, edit, or manage them centrally. This feature addresses the user need to:

- Create new groups with name, description, and member selection
- Edit existing groups
- Delete groups
- Assign groups to campaigns

## Scope

### In Scope
- **Groups List Page** (`/groups`) - View all groups with filtering
- **Group Card Component** - Display group info (name, description, members)
- **Create Group Modal/Form** - Form with name, description, member multi-select
- **Edit Group** - Update group details
- **Delete Group** - Remove group with confirmation
- **Assign to Campaign** - Link group to a campaign

### Out of Scope
- Campaign-level group unassignment (can be done via campaign edit)
- Group-specific session tracking (exists separately)
- NPCs management within groups (future enhancement)

## Approach

Follow the existing hexagonal architecture pattern:
- Reuse existing domain (`src/domain/group/`)
- Reuse existing API routes (`/api/group`, `/api/group/[id]`)
- Create UI following `campaigns/` and `characters/` page patterns
- Use HeroUI components (Card, Button, Modal, etc.)

**Technical Flow:**
1. List page fetches all groups via `fetchApi('/api/group')`
2. Create button opens modal with form
3. Form POSTs to `/api/group`
4. Edit/Delete via individual group page or inline actions

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/groups/page.tsx` | New | Main groups list page |
| `src/components/groups/GroupCard.tsx` | New | Display component (reuse GroupItem style) |
| `src/components/groups/CreateGroupButton.tsx` | New | Create modal + form |
| `src/components/groups/GroupFilters.tsx` | New | Optional: filter by campaign |
| `src/app/groups/[id]/page.tsx` | New | Optional: detail/edit page |
| `src/app/layout.tsx` | Modified | Add groups to navigation |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Group-Campaign relationship complexity | Medium | Keep simple: group can belong to one campaign |
| Member selection UX | Low | Use HeroUI's Autocomplete or Listbox for multi-select |
| API already exists | Low | No backend work needed |

## Rollback Plan

If issues arise:
1. Remove `src/app/groups/` directory
2. Remove created components in `src/components/groups/`
3. Revert any navigation changes in `layout.tsx`
4. No database migration needed (domain unchanged)

## Dependencies

- Campaign domain must have `groups` field (already exists: `groups: Array<{id, name}>`)
- Character domain for member selection (already exists)

## Success Criteria

- [ ] `/groups` page displays all groups
- [ ] Create group modal works with validation
- [ ] Groups can be edited and deleted
- [ ] New groups can be assigned to a campaign
- [ ] UI matches existing app patterns (HeroUI, dark theme)
- [ ] Tests pass (if existing tests cover similar patterns)
