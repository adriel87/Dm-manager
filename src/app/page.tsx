import type { Metadata } from 'next';
import { CampaignCard, type Campaign } from '@/components/campaigns/CampaignCard';
import { CreateCampaignButton } from '@/components/campaigns/CreateCampaignButton';

export const metadata: Metadata = {
  title: 'Campañas | DM Manager',
  description: 'Gestiona todas tus campañas de rol desde un solo lugar.',
};

/**
 * Fetches campaigns from the internal API.
 * cache: 'no-store' ensures fresh data on every visit — campaigns change often.
 * Returns an empty array on any network or parse error so the page never crashes.
 */
async function getCampaigns(): Promise<Campaign[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

  try {
    const res = await fetch(`${baseUrl}/api/campaign`, {
      cache: 'no-store',
    });

    if (!res.ok) return [];

    const data: unknown = await res.json();

    if (Array.isArray(data)) return data as Campaign[];

    if (
      data !== null &&
      typeof data === 'object' &&
      'data' in data &&
      Array.isArray((data as { data: unknown }).data)
    ) {
      return (data as { data: Campaign[] }).data;
    }

    return [];
  } catch {
    return [];
  }
}

/**
 * Campaign Dashboard — Server Component.
 * Data is fetched server-side; no client-side fetch or useEffect needed.
 */
export default async function CampaignDashboard() {
  const campaigns = await getCampaigns();

  return (
    <section aria-labelledby="campaigns-heading">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            id="campaigns-heading"
            className="text-white text-2xl font-bold tracking-tight"
          >
            Campañas
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {campaigns.length === 0
              ? 'Crea tu primera campaña para empezar.'
              : `${campaigns.length} ${campaigns.length === 1 ? 'campaña' : 'campañas'}`}
          </p>
        </div>

        <CreateCampaignButton />
      </div>

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
        <EmptyState />
      )}
    </section>
  );
}

/** Informative empty state — tells the user what to do next. */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-6xl mb-4" role="img" aria-label="Dados">
        🎲
      </span>
      <h2 className="text-white text-xl font-semibold mb-2">
        No hay campañas todavía
      </h2>
      <p className="text-zinc-400 text-sm max-w-sm">
        Pulsa{' '}
        <span className="text-white font-medium">&ldquo;+ Nueva campaña&rdquo;</span>{' '}
        para empezar a gestionar tus aventuras.
      </p>
    </div>
  );
}
