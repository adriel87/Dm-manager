'use client';

import { useState } from 'react';
import { Button, ButtonGroup } from '@heroui/react';
import { CharacterCard, type Character } from './CharacterCard';

type FilterKey = 'all' | 'pc' | 'npc';

interface FilterOption {
  key: FilterKey;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'Todos' },
  { key: 'pc', label: 'Personajes (PC)' },
  { key: 'npc', label: 'NPCs' },
];

interface CharacterFiltersProps {
  characters: Character[];
}

/**
 * Client Component island — owns the PC/NPC filter state.
 * Receives the full character list from the Server Component parent
 * and renders the filtered grid without any additional fetch.
 */
export function CharacterFilters({ characters }: CharacterFiltersProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const filtered = characters.filter((c) => {
    if (activeFilter === 'pc') return !c.isNPC;
    if (activeFilter === 'npc') return c.isNPC === true;
    return true;
  });

  const isEmpty = filtered.length === 0;

  return (
    <div className="space-y-6">
      {/* Filter controls */}
      <div className="flex items-center gap-3" role="group" aria-label="Filtrar personajes">
        <ButtonGroup size="sm" variant="flat">
          {FILTER_OPTIONS.map(({ key, label }) => (
            <Button
              key={key}
              onPress={() => setActiveFilter(key)}
              className={
                activeFilter === key
                  ? 'bg-primary-600 text-white font-medium'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white border-zinc-700'
              }
              aria-pressed={activeFilter === key}
            >
              {label}
            </Button>
          ))}
        </ButtonGroup>

        {/* Count label */}
        <span className="text-zinc-500 text-sm" aria-live="polite">
          {filtered.length}{' '}
          {filtered.length === 1 ? 'personaje' : 'personajes'}
        </span>
      </div>

      {/* Character grid */}
      {isEmpty ? (
        <FilteredEmptyState filter={activeFilter} />
      ) : (
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          role="list"
          aria-label="Lista de personajes"
        >
          {filtered.map((character) => (
            <li key={character.id}>
              <CharacterCard character={character} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Contextual empty state message based on the active filter. */
function FilteredEmptyState({ filter }: { filter: FilterKey }) {
  const messages: Record<FilterKey, string> = {
    all: 'Crea tu primer personaje pulsando \u201c+ Nuevo personaje\u201d.',
    pc: 'No hay personajes jugadores (PC) todavía.',
    npc: 'No hay NPCs en esta lista.',
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-5xl mb-4" role="img" aria-label="Personaje">
        🧝
      </span>
      <h2 className="text-white text-lg font-semibold mb-2">
        Sin personajes
      </h2>
      <p className="text-zinc-400 text-sm max-w-sm">
        {messages[filter]}
      </p>
    </div>
  );
}
