import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CampaignDetailHeader } from '@/infrastructure/presentation/components/campaigns/CampaignDetailHeader';
import { CampaignTabs } from '@/infrastructure/presentation/components/campaigns/CampaignTabs';
import { getCampaignById } from '@/application/useCases/campaign';
import { repositories } from '@/infrastructure/config/repositories';

interface CampaignDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  { params }: CampaignDetailPageProps
): Promise<Metadata> {
  const { id } = await params;
  const campaign = await getCampaignById(repositories.campaign, id);

  if (!campaign) {
    return { title: 'Campaña no encontrada | DM Manager' };
  }

  return {
    title: `${campaign.name} | DM Manager`,
    description: campaign.description || `Detalle de la campaña ${campaign.name}.`,
  };
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { id } = await params;
  const campaign = await getCampaignById(repositories.campaign, id);

  if (!campaign) {
    notFound();
  }

  return (
    <article aria-labelledby="campaign-heading">
      <CampaignDetailHeader campaign={campaign} />
      <CampaignTabs campaign={campaign} />
    </article>
  );
}
