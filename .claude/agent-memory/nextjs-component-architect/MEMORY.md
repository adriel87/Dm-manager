# Next.js Component Architect — Memory

## Project: DM Manager

### Key File Paths
- Layout root: `src/app/layout.tsx` — wraps in `GeneralProvider` + `AppLayout`
- Provider: `src/infrastructure/presentation/providers/GeneralProvider.tsx` — HeroUIProvider (client)
- HeroUI plugin: `src/app/hero.ts`
- Globals CSS: `src/app/globals.css` — Tailwind v4 + HeroUI, dark mode via `.dark` class on `<html>`

### UI Foundation (Phase 1 — built)
- `src/components/layout/Sidebar.tsx` — `'use client'`, `usePathname` for active links, fixed left sidebar w-60
- `src/components/layout/AppLayout.tsx` — Server Component, `ml-60` main to offset sidebar
- `src/components/campaigns/CampaignCard.tsx` — Server Component, HeroUI Card + Chip
- `src/components/campaigns/CreateCampaignButton.tsx` — `'use client'`, HeroUI Modal + form, `useTransition` + `router.refresh()`

### Campaign Detail Feature (Phase 2 — built)
- `src/app/campaigns/[id]/page.tsx` — async RSC, `await params`, fetches campaign, calls `notFound()` on null
- `src/components/campaigns/CampaignDetailHeader.tsx` — pure RSC, back link + title + status + stats
- `src/components/campaigns/CampaignTabs.tsx` — `'use client'` island, HeroUI Tabs, parallel fetch on mount, per-tab refresh after create
- `src/components/campaigns/MissionItem.tsx` — pure RSC card, exports `Mission` type
- `src/components/campaigns/SessionItem.tsx` — pure RSC card, exports `Session` type
- `src/components/campaigns/GroupItem.tsx` — pure RSC card with member Chips, exports `Group` type
- `src/components/campaigns/CreateMissionButton.tsx` — `'use client'`, modal form, `onCreated()` callback
- `src/components/campaigns/CreateSessionButton.tsx` — `'use client'`, modal form with campaignId baked in

**Client-side tab fetch pattern**: When a page has tabs + Create buttons that need per-tab refresh, make the tab panel a `'use client'` island. Fetch all datasets in `Promise.all` on mount. Each Create button receives an `onCreated` callback that re-fetches only its dataset (not the whole page). This avoids `router.refresh()` which would refetch the server-side campaign and cause a loading flash.

**Next.js 15 `params` pattern**: Both `default export` and `generateMetadata` receive `params` as `Promise<{id: string}>` — always `await params` before destructuring.

**`notFound()` narrows type**: `notFound()` from `next/navigation` returns `never` — TypeScript correctly narrows `campaign` to non-null after the guard. No type assertion needed.

**Per-entity type exports**: Each item component (`MissionItem`, `SessionItem`, `GroupItem`) exports its own interface (`Mission`, `Session`, `Group`). `CampaignTabs` imports these types from the item components, keeping types co-located with their display logic.

**Client-side array normalise + filter**: Groups are filtered by `Set<string>` built from `campaign.groups.map(g => g.id)`. Sessions are filtered by `campaignId` and sorted by `sessionNumber` desc. Both happen client-side since no API query params exist.

### Characters Feature (Phase 3 — built)
- `src/app/characters/page.tsx` — async RSC, fetches GET /api/character, passes array to CharacterFilters
- `src/components/characters/CharacterCard.tsx` — pure RSC, exports `Character` interface used by all character components
- `src/components/characters/CharacterFilters.tsx` — `'use client'` filter island, owns FilterKey state ('all'|'pc'|'npc'), renders filtered grid
- `src/components/characters/CreateCharacterButton.tsx` — `'use client'`, same modal pattern as CreateCampaignButton + Switch for isNPC

**Filter island pattern**: Page RSC fetches all data → passes to client island → island filters/renders. Zero extra fetches, client state stays shallow.

**Multi-field form DX**: Extract shared `INPUT_CLASSES` constant to avoid repeating HeroUI `classNames` on every Input. Group related fields in `grid-cols-2 gap-3`.

**Switch (boolean toggle) pattern**: Wrap in a `bg-zinc-800 border border-zinc-700 px-4 py-3 rounded-xl` row with label + description text + right-aligned Switch.

### Established Patterns

**Dark theme**: `<html className="dark">`, zinc-950 body, zinc-900 sidebar, zinc-800 cards, zinc-700 borders.

**HeroUI imports**: Use `@heroui/react` barrel for all components (Card, Chip, Button, Modal, Input, Textarea, Select, useDisclosure). Individual package `@heroui/button` also works but prefer barrel.

**Campaign API response shape**: May return plain array OR `{ data: Campaign[] }`. Always normalise in the fetch helper.

**Server Component data fetch pattern**:
```typescript
async function getData(): Promise<T[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/<entity>`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data: unknown = await res.json();
    return Array.isArray(data) ? data as T[] : [];
  } catch { return []; }
}
```

**Client mutation pattern** (CreateButton):
- `useDisclosure` for modal open/close
- `useTransition` wrapping the async fetch (shows isPending on button)
- `router.refresh()` after success to revalidate the Server Component tree
- Reset form + error state on modal close

**Sidebar active link logic**:
- Root `/`: exact match (`pathname === '/'`)
- All others: prefix match (`pathname.startsWith(href)`)

**Accessibility conventions**:
- `aria-current="page"` on active nav link
- `aria-label` on icon-only SVGs (`aria-hidden="true"`)
- `role="list"` on `<ul>` grids for screen readers
- `aria-labelledby` linking section `<h1>` id

**TypeScript**: `unknown` for raw API responses, narrowed before cast. Never `any`.

### Lint / Type Check
- `npx tsc --noEmit` — zero errors baseline
- `npx next lint` — zero warnings baseline (note: `next lint` deprecated in Next 16, shows warning but still works)
