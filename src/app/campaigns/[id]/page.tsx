import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CampaignDetailHeader } from '@/components/campaigns/CampaignDetailHeader';
import { CampaignTabs } from '@/components/campaigns/CampaignTabs';
import type { Campaign } from '@/components/campaigns/CampaignCard';
import { fetchApi } from '@/lib/api';

interface CampaignDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Generates page metadata from the campaign name.
 * Falls back gracefully if the campaign cannot be fetched.
 */
export async function generateMetadata(
  { params }: CampaignDetailPageProps
): Promise<Metadata> {
  const { id } = await params;
  const campaign = await fetchApi<Campaign>(`/api/campaign/${id}`);

  if (!campaign) {
    return {
      title: 'Campaña no encontrada | DM Manager',
    };
  }

  return {
    title: `${campaign.name} | DM Manager`,
    description: campaign.description || `Detalle de la campaña ${campaign.name}.`,
  };
}

/**
 * Campaign Detail Page — Server Component.
 *
 * Architecture:
 * - This page is a pure Server Component: it fetches the campaign server-side
 *   and passes it down as props. No client JS is needed for the initial render.
 * - `CampaignDetailHeader` is also a Server Component (static display).
 * - `CampaignTabs` is a Client Component island: it owns tab state and
 *   fetches missions/sessions/groups client-side so each tab can be
 *   independently refreshed after a create action without a full page reload.
 */
export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { id } = await params;
  const campaign = await fetchApi<Campaign>(`/api/campaign/${id}`);

  if (!campaign) {
    notFound();
  }

  return (
    <article aria-labelledby="campaign-heading">
      <CampaignDetailHeader campaign={campaign} />
      <CampaignTabs campaignId={id} campaign={campaign} />
    </article>
  );
}
