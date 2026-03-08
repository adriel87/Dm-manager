'use client';

import { Card, CardBody, CardHeader, CardFooter, Chip } from '@heroui/react';

export interface Group {
  id: string;
  name: string;
  description: string;
  members: { id: string; name: string; classType: string }[];
  createdAt?: string;
  updatedAt?: string;
}

interface GroupItemProps {
  group: Group;
}

/**
 * Pure Server Component — displays a single group card.
 * Shows group name, description, and member chips.
 */
export function GroupItem({ group }: GroupItemProps) {
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
    </Card>
  );
}
