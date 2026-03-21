'use client';

import { useState, useCallback } from 'react';
import { Tab } from '@heroui/react';
import { MissionItem, type Mission } from '@/infrastructure/presentation/components/campaigns/MissionItem';
import { CreateMissionButton } from '@/infrastructure/presentation/components/campaigns/CreateMissionButton';
import { InfoCircleIcon } from '@/infrastructure/presentation/components/icons';
import { EmbeddedMission } from '@/domain/campaign/campaign';

interface MissionsTabProps {
  campaignId: string;
  initialMissions: EmbeddedMission[];
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export function MissionsTab({ campaignId, initialMissions }: MissionsTabProps) {
  const [missions, setMissions] = useState<EmbeddedMission[]>(initialMissions);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/api/campaign/${campaignId}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setMissions(data.missions ?? []);
    } catch {
      // Silent — list keeps stale data; user can retry via next action
    }
  }, [campaignId]);

  return (
    
      <section aria-labelledby="missions-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="missions-heading" className="text-white text-lg font-semibold">
            Misiones
            <span className="text-zinc-500 text-sm font-normal ml-2">({missions.length})</span>
          </h2>
          <CreateMissionButton campaignId={campaignId} onCreated={refresh} />
        </div>

        {missions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <InfoCircleIcon size={22} className="text-zinc-500" />
            </div>
            <h3 className="text-white text-base font-semibold mb-1">Sin misiones todavía</h3>
            <p className="text-zinc-400 text-sm max-w-xs">
              Pulsa &quot;+ Nueva misión&quot; para añadir la primera misión a esta campaña.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3" role="list" aria-label="Lista de misiones">
            {missions.map((mission) => (
              <li key={mission.id}>
                <MissionItem campaignId={campaignId} mission={mission} onUpdated={refresh} />
              </li>
            ))}
          </ul>
        )}
      </section>
  );
}
