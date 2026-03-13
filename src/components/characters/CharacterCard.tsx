'use client';

import { Card, CardBody, CardHeader, CardFooter, Chip } from '@heroui/react';
import { MapPinIcon } from '@/components/icons';

export interface Character {
  id: string;
  name: string;
  age: 'child' | 'teenager' | 'adult' | 'elderly';
  classType: string;
  level: number;
  hitPoints: number;
  description?: string;
  location?: string;
  isNPC?: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface CharacterCardProps {
  character: Character;
}

const AGE_LABELS: Record<Character['age'], string> = {
  child: 'Niño',
  teenager: 'Joven',
  adult: 'Adulto',
  elderly: 'Anciano',
};

/**
 * Pure Server Component — renders a single character card.
 * No interactivity: no event handlers, no client state.
 */
export function CharacterCard({ character }: CharacterCardProps) {
  const ageLabel = AGE_LABELS[character.age] ?? character.age;
  const isNPC = character.isNPC === true;

  return (
    <Card
      className="bg-zinc-800 border border-zinc-700 hover:border-zinc-500 transition-colors duration-200 h-full"
      shadow="none"
    >
      <CardHeader className="flex items-start justify-between gap-3 pb-2">
        <div className="min-w-0 flex-1">
          <h2 className="text-white font-semibold text-base leading-snug line-clamp-1">
            {character.name}
          </h2>
          <p className="text-zinc-500 text-xs mt-0.5">{ageLabel}</p>
        </div>

        {/* PC / NPC badge */}
        <Chip
          size="sm"
          color={isNPC ? 'default' : 'success'}
          variant="flat"
          className="shrink-0 text-xs"
        >
          {isNPC ? 'NPC' : 'PC'}
        </Chip>
      </CardHeader>

      <CardBody className="py-2 gap-2">
        {/* Class + Level row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Chip size="sm" color="primary" variant="flat" className="text-xs">
            {character.classType}
          </Chip>
          <span className="text-zinc-400 text-xs font-medium">
            Nv. {character.level}
          </span>
        </div>

        {/* HP */}
        <p className="text-zinc-300 text-sm font-medium">
          <span aria-hidden="true">&#x2764;&#xfe0f;</span>{' '}
          <span>{character.hitPoints} HP</span>
        </p>

        {/* Description — 2-line clamp */}
        {character.description && (
          <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2">
            {character.description}
          </p>
        )}
      </CardBody>

      {/* Location footer — only rendered when present */}
      {character.location && (
        <CardFooter className="pt-3 border-t border-zinc-700">
          <span className="flex items-center gap-1.5 text-zinc-500 text-xs">
            <MapPinIcon size={12} aria-hidden="true" />
            <span className="line-clamp-1">{character.location}</span>
          </span>
        </CardFooter>
      )}
    </Card>
  );
}
