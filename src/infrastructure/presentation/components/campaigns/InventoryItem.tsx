'use client';

import { useState, useTransition } from 'react';
import { Card, CardBody, CardHeader, CardFooter, Chip } from '@heroui/react';
import { apiDelete } from '@/lib/api';
import { EditInventoryItemButton } from '@/infrastructure/presentation/components/campaigns/EditInventoryItemButton';

export type TagType = 'common' | 'rare' | 'unique' | 'mission';

export interface EmbeddedItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  value: number;
  tags: TagType[];
}

const TAG_COLOR: Record<TagType, 'default' | 'primary' | 'secondary' | 'warning'> = {
  common: 'default',
  rare: 'primary',
  unique: 'secondary',
  mission: 'warning',
};

const TAG_LABEL: Record<TagType, string> = {
  common: 'Común',
  rare: 'Raro',
  unique: 'Único',
  mission: 'Misión',
};

interface InventoryItemProps {
  campaignId: string;
  item: EmbeddedItem;
  onUpdated?: () => void;
}

/**
 * Inventory item card with edit and delete actions.
 * Delete is handled client-side with a loading state to prevent double-clicks.
 */
export function InventoryItem({ campaignId, item, onUpdated }: InventoryItemProps) {
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleDelete() {
    setDeleteError(null);
    startDeleteTransition(async () => {
      const { error } = await apiDelete(`/api/campaign/${campaignId}/inventory/${item.id}`);
      if (error) {
        setDeleteError(error);
        return;
      }
      onUpdated?.();
    });
  }

  return (
    <Card
      className="bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-colors duration-200"
      shadow="none"
    >
      <CardHeader className="flex items-start justify-between gap-3 pb-2">
        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-1 flex-1">
          {item.title}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          {item.value > 0 && (
            <Chip size="sm" color="warning" variant="flat" className="text-xs">
              {item.value} gp
            </Chip>
          )}
          <Chip size="sm" color="primary" variant="flat" className="text-xs">
            x{item.quantity}
          </Chip>
        </div>
      </CardHeader>

      <CardBody className="py-2">
        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2">
          {item.description || 'Sin descripción.'}
        </p>
      </CardBody>

      <CardFooter className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-700">
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.tags.map((tag) => (
            <Chip key={tag} size="sm" color={TAG_COLOR[tag]} variant="flat" className="text-xs">
              {TAG_LABEL[tag]}
            </Chip>
          ))}
          {item.tags.length === 0 && (
            <span className="text-zinc-600 text-xs">Sin etiquetas</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <EditInventoryItemButton
            campaignId={campaignId}
            item={item}
            onUpdated={onUpdated}
          />
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Eliminar objeto"
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-xs font-medium bg-danger-500/10 text-danger-400 hover:bg-danger-500/20 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </CardFooter>

      {deleteError && (
        <div className="px-3 pb-3">
          <p role="alert" className="text-danger-400 text-xs bg-danger-50/10 border border-danger-200/20 rounded-lg px-3 py-2">
            {deleteError}
          </p>
        </div>
      )}
    </Card>
  );
}
