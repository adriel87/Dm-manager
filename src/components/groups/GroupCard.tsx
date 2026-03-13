import { Card, CardBody, CardHeader, CardFooter, Chip } from '@heroui/react';
import type { Group } from '@/domain/group/group';

interface GroupCardProps {
  group: Group;
  onEdit?: (group: Group) => void;
  onDelete?: (groupId: string) => void;
}

/**
 * Group Card Component.
 * Displays group name, description, and member chips.
 * Includes edit and delete actions.
 */
export function GroupCard({ group, onEdit, onDelete }: GroupCardProps) {
  const memberCount = group.members?.length ?? 0;

  return (
    <Card
      className="bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-colors duration-200"
      shadow="none"
    >
      <CardHeader className="flex items-start justify-between gap-3 pb-2">
        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-1">
          {group.name}
        </h3>
        <span className="text-zinc-500 text-xs shrink-0">
          {memberCount} {memberCount === 1 ? 'miembro' : 'miembros'}
        </span>
      </CardHeader>

      <CardBody className="py-2">
        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2">
          {group.description || 'Sin descripción.'}
        </p>
      </CardBody>

      {memberCount > 0 && (
        <CardFooter className="flex flex-wrap gap-1.5 pt-3 border-t border-zinc-700">
          {group.members.map((member) => (
            <Chip
              key={member.id}
              size="sm"
              variant="flat"
              color="default"
              className="text-xs text-zinc-300"
            >
              {member.name}
              <span className="text-zinc-500 ml-1">({member.classType})</span>
            </Chip>
          ))}
        </CardFooter>
      )}

      {/* Action buttons */}
      <CardFooter className="flex justify-end gap-2 pt-3 border-t border-zinc-700">
        {onEdit && (
          <button
            onClick={() => onEdit(group)}
            className="text-zinc-400 hover:text-white text-sm px-2 py-1 rounded transition-colors"
            aria-label={`Editar ${group.name}`}
          >
            Editar
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(group.id)}
            className="text-zinc-400 hover:text-red-400 text-sm px-2 py-1 rounded transition-colors"
            aria-label={`Eliminar ${group.name}`}
          >
            Eliminar
          </button>
        )}
      </CardFooter>
    </Card>
  );
}
