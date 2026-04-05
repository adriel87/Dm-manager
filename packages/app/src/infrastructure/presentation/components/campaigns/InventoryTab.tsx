'use client';

import { useState, useCallback } from 'react';
import { InventoryItem, type EmbeddedItem } from '@/infrastructure/presentation/components/campaigns/InventoryItem';
import { CreateInventoryItemButton } from '@/infrastructure/presentation/components/campaigns/CreateInventoryItemButton';
import { TransferMoneyButton } from '@/infrastructure/presentation/components/campaigns/TransferMoneyButton';
import { InfoCircleIcon } from '@/infrastructure/presentation/components/icons';
import { apiGet } from '@/lib/api';

interface Inventory {
  items: EmbeddedItem[];
  capacity: number;
  money: number;
}

interface InventoryTabProps {
  campaignId: string;
  initialInventory: Inventory;
}

export function InventoryTab({ campaignId, initialInventory }: InventoryTabProps) {
  const [inventory, setInventory] = useState<Inventory>(initialInventory);

  const refresh = useCallback(async () => {
    const data = await apiGet<{ inventory: Inventory }>(`/api/campaign/${campaignId}`);
    if (!data) return;
    setInventory(data.inventory ?? initialInventory);
  }, [campaignId, initialInventory]);

  return (
    <section aria-labelledby="inventory-heading">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 id="inventory-heading" className="text-white text-lg font-semibold">
            Inventario
            <span className="text-zinc-500 text-sm font-normal ml-2">
              ({inventory.items.length})
            </span>
          </h2>
          <span className={`text-sm font-medium ${inventory.money < 0 ? 'text-danger-400' : 'text-warning-400'}`}>
            {inventory.money} gp
          </span>
        </div>
        <div className="flex items-center gap-2">
          <TransferMoneyButton campaignId={campaignId} onTransferred={refresh} />
          <CreateInventoryItemButton campaignId={campaignId} onCreated={refresh} />
        </div>
      </div>

      {inventory.capacity > 0 && (
        <p className="text-zinc-500 text-xs mb-4">
          Capacidad:{' '}
          <span className="text-zinc-400">
            {inventory.items.length} / {inventory.capacity} slots
          </span>
        </p>
      )}

      {inventory.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
            <InfoCircleIcon size={22} className="text-zinc-500" />
          </div>
          <h3 className="text-white text-base font-semibold mb-1">Sin objetos todavía</h3>
          <p className="text-zinc-400 text-sm max-w-xs">
            Pulsa &quot;+ Nuevo objeto&quot; para añadir el primer objeto al inventario.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3" role="list" aria-label="Lista de objetos del inventario">
          {inventory.items.map((item) => (
            <li key={item.id}>
              <InventoryItem campaignId={campaignId} item={item} onUpdated={refresh} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
