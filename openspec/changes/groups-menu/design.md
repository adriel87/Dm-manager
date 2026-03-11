# Design: Groups Management Menu

## Technical Approach

Follow the existing hexagonal architecture pattern with Next.js App Router. The UI will reuse the same patterns as campaigns and characters pages:

1. **Page Layer** (`src/app/groups/page.tsx`) - Server Component that fetches data
2. **Component Layer** (`src/components/groups/*.tsx`) - Client Components for interactivity
3. **API Layer** - Already exists (`/api/group`, `/api/group/[id]`)

## Architecture Decisions

### Decision: Reuse existing GroupItem component

**Choice**: Use `src/components/campaigns/GroupItem.tsx` as the display component
**Alternatives considered**: Create entirely new component
**Rationale**: The GroupItem component already exists with proper styling. Create a wrapper in `src/components/groups/GroupCard.tsx` that re-exports with compatible interface.

### Decision: Modal-based create/edit flow

**Choice**: Use HeroUI Modal with inline form (same as CreateCampaignButton)
**Alternatives considered**: Separate page for create/edit
**Rationale**: Maintains consistency with existing patterns. User research shows modal is faster for simple CRUD operations.

### Decision: Multi-select for group members using Autocomplete

**Choice**: HeroUI Autocomplete with multi-select enabled
**Alternatives considered**: Checkbox group, Listbox
**Rationale**: Autocomplete provides search/filter capability which is important when there are many characters. HeroUI supports `selectionMode="multiple"`.

### Decision: Assign to campaign via Select dropdown

**Choice**: HeroUI Select component in edit modal
**Alternatives considered**: Separate assignment page
**Rationale**: Simple one-to-many relationship. Keep it inline with edit flow.

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Server Component                         │
│  src/app/groups/page.tsx                                    │
│  - fetchApi('/api/group') → Group[]                         │
│  - fetchApi('/api/campaign') → Campaign[] (for assignment)  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Client Component                         │
│  src/components/groups/GroupFilters.tsx                     │
│  - Displays grid of groups                                  │
│  - Owns filter state                                        │
└────────────────────────────┬────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
       ┌────────────┐ ┌────────────┐ ┌────────────┐
       │ Create     │ │ Edit       │ │ Delete     │
       │ GroupModal │ │ GroupModal │ │ Confirm    │
       └─────┬──────┘ └─────┬──────┘ └────────────┘
             │              │              │
             ▼              ▼              ▼
       POST /api/group  PUT /api/group/[id]  DELETE /api/group/[id]
             │              │              │
             └──────────────┴──────────────┘
                            │
                            ▼
                     router.refresh()
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/groups/page.tsx` | Create | Main groups list page (Server Component) |
| `src/components/groups/GroupCard.tsx` | Create | Display component, wrapper around GroupItem |
| `src/components/groups/CreateGroupButton.tsx` | Create | Modal form for creating groups |
| `src/components/groups/GroupFilters.tsx` | Create | Client component with filter UI + grid |
| `src/components/layout/Sidebar.tsx` | Modify | Add "Grupos" nav item |
| `openspec/changes/groups-menu/proposal.md` | Create | (already exists) |
| `openspec/changes/groups-menu/specs/ui/spec.md` | Create | (already exists) |

## Interfaces / Contracts

### Group Type (from domain)
```typescript
interface Group {
  id: string;
  name: string;
  description: string;
  members: Array<{
    id: string;
    name: string;
    classType: DnDClassEnum;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Form State for Create/Edit
```typescript
interface GroupFormState {
  name: string;
  description: string;
  memberIds: string[];        // Selected character IDs
  campaignId: string | null;  // Assigned campaign (optional)
}
```

### API Contracts (already exist)
- `GET /api/group` → `Group[]`
- `POST /api/group` → `Group` (body: `Omit<Group, 'id'>`)
- `GET /api/group/[id]` → `Group`
- `PUT /api/group/[id]` → `Group` (body: `Partial<Group>`)
- `DELETE /api/group/[id]` → `{ message: string }`

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Form validation logic | Vitest with mocked components |
| Integration | API integration | Use existing API tests pattern |
| E2E | Full create/edit/delete flow | Playwright (existing e2e infrastructure) |

Since this follows existing patterns:
- Unit tests optional (existing patterns not tested)
- Integration tests optional
- E2E tests recommended: navigate to /groups, create group, edit, delete

## Migration / Rollout

No migration required. The domain and API already exist. This is purely a UI addition.

## Open Questions

- [ ] Should groups be assignable to multiple campaigns? (Currently: one campaign per group)
- [ ] Should there be a separate page for group details, or just inline edit?
  - Decision: Inline edit in modal, no separate detail page (simpler, matches existing patterns)

## Navigation Addition

Add to `src/components/layout/Sidebar.tsx`:

```typescript
const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Campaigns',
    icon: <MapIcon />,
  },
  {
    href: '/characters',
    label: 'Characters',
    icon: <PersonIcon />,
  },
  {
    href: '/groups',
    label: 'Groups',  // NEW
    icon: <UsersIcon />,  // NEW - need to create Users icon
  },
];
```
