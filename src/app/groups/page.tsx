import type { Metadata } from 'next';
import { fetchApi } from '@/lib/api';
import { PageHeader } from '@/infrastructure/presentation/components/ui/PageHeader';
import { CreateGroupButton } from '@/infrastructure/presentation/components/groups/CreateGroupButton';
import { GroupFilters } from '@/infrastructure/presentation/components/groups/GroupFilters';
import type { Group } from '@/domain/group/group';

export const metadata: Metadata = {
  title: 'Grupos | DM Manager',
  description: 'Gestiona los grupos de personajes de tus campañas.',
};

/**
 * Groups page — Server Component.
 *
 * Fetches all groups and campaigns server-side.
 * The interactive filter island (GroupFilters) manages display state.
 */
export default async function GroupsPage() {
  const groups = (await fetchApi<Group[]>('/api/group')) ?? [];
  const campaigns = (await fetchApi<{ id: string; name: string }[]>('/api/campaign')) ?? [];

  return (
    <section aria-labelledby="groups-heading">
      {/* Page header */}
      <PageHeader
        title="Grupos"
        subtitle={
          groups.length === 0
            ? 'Crea tu primer grupo para empezar.'
            : `${groups.length} ${groups.length === 1 ? 'grupo' : 'grupos'}`
        }
        action={<CreateGroupButton campaigns={campaigns} />}
      />

      {/* Pass all data to the client component for filtering */}
      <GroupFilters groups={groups} campaigns={campaigns} />
    </section>
  );
}
