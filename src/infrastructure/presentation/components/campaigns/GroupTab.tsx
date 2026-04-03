'use client';

import { Tab } from '@heroui/react';
import { GroupItem } from '@/infrastructure/presentation/components/campaigns/GroupItem';
import { InfoCircleIcon } from '@/infrastructure/presentation/components/icons';
import type { GroupSnapshot } from '@/domain/campaign/campaign';

interface GroupTabProps {
  group: GroupSnapshot | null;
}

export function GroupTab({ group }: GroupTabProps) {
  if (!group) {
    return (
        <section aria-labelledby="group-heading">
          <h2 id="group-heading" className="text-white text-lg font-semibold mb-4">Grupo</h2>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <InfoCircleIcon size={22} className="text-zinc-500" />
            </div>
            <h3 className="text-white text-base font-semibold mb-1">Sin grupo asignado</h3>
            <p className="text-zinc-400 text-sm max-w-xs">
              Los grupos se asignan a la campaña desde la pantalla de gestión de grupos.
            </p>
          </div>
        </section>
    );
  }

  return (
      <section aria-labelledby="group-heading">
        <h2 id="group-heading" className="text-white text-lg font-semibold mb-4">Grupo</h2>
        <GroupItem group={group} />
      </section>
  );
}
