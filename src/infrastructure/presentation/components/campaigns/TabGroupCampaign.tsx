'use client';

import { Campaign } from '@/domain/campaign/campaign';
import { Tab, Tabs } from '@heroui/react';
import { GroupTab } from './GroupTab';
import { InventoryTab } from './InventoryTab';
import { MissionsTab } from './MissionsTab';
import { NotesTab } from './NotesTab';
import type { Note } from './NoteItem';
import { SessionsTab } from './SessionsTab';

interface TabGroupCampaignProps {
  campaignId: string;
  initialMissions: Campaign['missions'];
  initialSessions: Campaign['sessions'];
  initialNotes: Note[];
  initialInventory: Campaign['inventory'];
  group: Campaign['group'];
}

/**
 * Client Component island — owns the HeroUI <Tabs> context.
 * Each *Tab component owns its state and refresh logic.
 * CampaignTabs (Server Component) provides initial data from the aggregate.
 */
export function TabGroupCampaign({ campaignId, initialMissions, initialNotes, initialSessions, initialInventory, group }: TabGroupCampaignProps) {
  return (
    <div className="mt-2">
      <Tabs
        aria-label="Secciones de la campaña"
        color="primary"
        variant="underlined"
        classNames={{
          tabList: 'border-b border-zinc-800 w-full pb-0 gap-6',
          tab: 'text-zinc-400 data-[selected=true]:text-white font-medium pb-3',
          cursor: 'bg-primary-500',
          panel: 'pt-6',
        }}
      >
        <Tab key="missions" title="Misiones">
          <MissionsTab campaignId={campaignId} initialMissions={initialMissions ?? []} />
        </Tab>
        <Tab key="sessions" title="Sesiones">
          <SessionsTab campaignId={campaignId} initialSessions={initialSessions ?? []} />
        </Tab>
        <Tab key="notes" title="Notas">
          <NotesTab campaignId={campaignId} initialNotes={initialNotes ?? []} />
        </Tab>
        <Tab key="inventory" title="Inventario">
          <InventoryTab campaignId={campaignId} initialInventory={initialInventory ?? { items: [], capacity: 0, money: 0 }} />
        </Tab>
        <Tab key="group" title="Grupo">
          <GroupTab group={group} />
        </Tab>
      </Tabs>
    </div>
  );
}
