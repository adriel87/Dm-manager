import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { PlayModeView } from '@/components/play/PlayModeView';

interface PlayModePageProps {
  params: Promise<{ id: string }>;
}

interface CampaignAggregate {
  id: string;
  name: string;
  description: string;
  status: string;
  missions: Array<{
    id: string;
    name: string;
    description: string;
    missionGuide: string;
    missionEvents: { name: string; difficult: string }[] | null;
    missionPriority: string;
    status: 'Activa' | 'Pausada' | 'Finalizada';
    relatedCharacters: { id: string; name: string }[] | null;
    rewards?: string | null;
    startDate?: string;
    endDate?: string;
  }>;
  sessions: Array<{
    id: string;
    title: string;
    notes: string;
    sessionNumber: number;
    date: string;
  }>;
}

export async function generateMetadata({ params }: PlayModePageProps): Promise<Metadata> {
  const { id } = await params;
  const campaign = await fetchApi<CampaignAggregate>(`/api/campaign/${id}`);

  if (!campaign) {
    return { title: 'Campaña no encontrada | DM Manager' };
  }

  return {
    title: `${campaign.name} — Modo Juego | DM Manager`,
    description: `Modo partida activa para la campaña ${campaign.name}.`,
  };
}

/**
 * Play Mode Page — Server Component.
 *
 * Fetches the full Campaign Aggregate (with embedded missions and sessions)
 * server-side, then delegates all interactivity to the PlayModeView client island.
 *
 * Route: /campaigns/[id]/play
 */
export default async function PlayModePage({ params }: PlayModePageProps) {
  const { id } = await params;
  const campaign = await fetchApi<CampaignAggregate>(`/api/campaign/${id}`);

  if (!campaign) {
    notFound();
  }

  // Sort sessions descending so the most recent is first in the panel
  const sortedSessions = [...(campaign.sessions ?? [])].sort(
    (a, b) => b.sessionNumber - a.sessionNumber
  );

  return (
    <main
      className="min-h-screen bg-zinc-900 px-4 py-6 lg:px-8"
      aria-label={`Modo juego — ${campaign.name}`}
    >
      <PlayModeView
        campaignId={id}
        campaignName={campaign.name}
        missions={campaign.missions ?? []}
        sessions={sortedSessions}
      />
    </main>
  );
}
