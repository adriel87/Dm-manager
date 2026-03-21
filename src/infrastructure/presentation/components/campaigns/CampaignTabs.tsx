import type { CampaignI } from '@/domain/campaign/campaign';
import { TabGroupCampaign } from '@/infrastructure/presentation/components/campaigns/TabGroupCampaign';
import type { Note } from '@/infrastructure/presentation/components/campaigns/NoteItem';

interface CampaignTabsProps {
  campaign: CampaignI;
}

/**
 * Server Component — sorts campaign sub-collections and delegates rendering
 * to TabGroupCampaign (Client Component island with HeroUI <Tabs>).
 *
 * Each *Tab component owns a <Tab> wrapper, so TabGroupCampaign receives
 * them as children and HeroUI registers them via React context.
 */
export function CampaignTabs({ campaign }: CampaignTabsProps) {
  const sortedSessions = [...campaign.sessions].sort(
    (a, b) => b.sessionNumber - a.sessionNumber
  );

  const sortedNotes = [...campaign.notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  console.log({group:campaign.group})
  return (
    <TabGroupCampaign 
      campaignId={campaign.id} 
      initialMissions={campaign.missions ?? []}
      initialSessions={sortedSessions ?? []}
      initialNotes={sortedNotes as unknown as Note[]}
      group={campaign.group}
      />
  );
}
