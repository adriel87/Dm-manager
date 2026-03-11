'use client';

import { useState, useCallback } from 'react';
import { GroupCard, type Group } from './GroupCard';
import { EmptyState } from '@/components/ui/EmptyState';

interface Campaign {
  id: string;
  name: string;
}

interface GroupFiltersProps {
  groups: Group[];
  campaigns?: Campaign[];
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * GroupFilters - Client Component that manages the display of groups.
 * Shows a grid of group cards with filtering and CRUD actions.
 */
export function GroupFilters({ groups, campaigns = [] }: GroupFiltersProps) {
  const [localGroups, setLocalGroups] = useState(groups);

  // Keep campaigns for future filtering feature
  void campaigns;

  // Refresh groups from server
  const refreshGroups = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/api/group`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setLocalGroups(Array.isArray(data) ? data : data.data ?? []);
      }
    } catch {
      // Silent
    }
  }, []);

  // Get filtered groups (filtering not implemented yet)
  const filteredGroups = localGroups;

  // Handle delete
  const handleDelete = async (groupId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este grupo?')) {
      return;
    }

    try {
      const res = await fetch(`${BASE}/api/group/${groupId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await refreshGroups();
      }
    } catch {
      // Silent
    }
  };

  // Handle edit (placeholder - opens modal)
  const handleEdit = (group: Group) => {
    // TODO: Implement edit modal
    alert('Editar grupo: ' + group.name);
  };

  if (localGroups.length === 0) {
    return (
      <EmptyState
        emoji="👥"
        title="No hay grupos todavía"
        message={'Pulsa "+ Nuevo grupo" para crear el primer grupo de tu campaña.'}
      />
    );
  }

  return (
    <div>
      {/* Groups grid */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Lista de grupos">
        {filteredGroups.map((group) => (
          <li key={group.id}>
            <GroupCard
              group={group}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
