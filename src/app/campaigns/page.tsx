import type { Metadata } from 'next';
import { CampaignCard, type Campaign } from '@/components/campaigns/CampaignCard';
import { CreateCampaignButton } from '@/components/campaigns/CreateCampaignButton';
import { fetchApi } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export const metadata: Metadata = {
  title: 'Campañas | DM Manager',
  description: 'Gestiona todas tus campañas de rol desde un solo lugar.',
};

/**
 * Campaigns page — Server Component.
 * 
 * Data is fetched server-side and renders the campaign grid.
 */
export default async function CampaignsPage() {
  const campaigns = (await fetchApi<Campaign[]>('/api/campaign')) ?? [];

  return (
    <section aria-labelledby="campaigns-heading">
      {/* Page header */}
      <PageHeader
        title="Campañas"
        subtitle={
          campaigns.length === 0
            ? 'Crea tu primera campaña para empezar.'
            : `${campaigns.length} ${campaigns.length === 1 ? 'campaña' : 'campañas'}`
        }
        action={<CreateCampaignButton />}
      />

      {/* Campaign grid */}
      {campaigns.length > 0 ? (
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          role="list"
          aria-label="Lista de campañas"
        >
          {campaigns.map((campaign) => (
            <li key={campaign.id}>
              <CampaignCard campaign={campaign} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          emoji="🎲"
          title="No hay campañas todavía"
          message={'Pulsa "+ Nueva campaña" para empezar a gestionar tus aventuras.'}
        />
      )}
    </section>
  );
}
