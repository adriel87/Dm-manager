import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { PlayModeView } from '@/infrastructure/presentation/components/play/PlayModeView';
import type { SpeakerPreset } from '@/infrastructure/presentation/components/play/SpeakerMappingModal';
import type { CharacterRef } from '@/domain/campaign/campaign';
import type { Character } from '@/domain/character/character';
import type { Note } from '@/infrastructure/presentation/components/campaigns/NoteItem';

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
  characters: CharacterRef[];
  notes: Note[];
}

export async function generateMetadata({ params }: PlayModePageProps): Promise<Metadata> {
  const { id } = await params;
  const campaign = await apiGet<CampaignAggregate>(`/api/campaign/${id}`);

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
 * Fetches the full Campaign Aggregate (with embedded missions, sessions and characters)
 * server-side, then delegates all interactivity to the PlayModeView client island.
 *
 * Route: /campaigns/[id]/play
 */
export default async function PlayModePage({ params }: PlayModePageProps) {
  const { id } = await params;
  const campaign = await apiGet<CampaignAggregate>(`/api/campaign/${id}`);

  if (!campaign) {
    notFound();
  }

  // Sort sessions descending so the most recent is first in the panel
  const sortedSessions = [...(campaign.sessions ?? [])].sort(
    (a, b) => b.sessionNumber - a.sessionNumber
  );

  // Compute speaker presets from characters with a Discord speakerId
  const allCharacters = await apiGet<Character[]>('/api/character') ?? [];
  const assignedIds = new Set(campaign.characters.map((c) => c.id));
  const speakerPresets: SpeakerPreset[] = allCharacters
    .filter((c) => assignedIds.has(c.id) && !c.isNPC && c.speakerId)
    .map((c) => ({
      discordUserId: c.speakerId!,
      discordUsername: c.playerAlias ?? c.playerName ?? c.name,
      characterId: c.id,
      characterName: c.name,
    }));

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
        characters={campaign.characters ?? []}
        notes={campaign.notes ?? []}
        speakerPresets={speakerPresets}
      />
    </main>
  );
}
