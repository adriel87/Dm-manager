import type { Metadata } from 'next';
import { type Character } from '@/components/characters/CharacterCard';
import { CharacterFilters } from '@/components/characters/CharacterFilters';
import { CreateCharacterButton } from '@/components/characters/CreateCharacterButton';
import { fetchApi } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata: Metadata = {
  title: 'Personajes | DM Manager',
  description: 'Gestiona todos los personajes jugadores y NPCs de tus campañas.',
};

/**
 * Characters page — Server Component.
 *
 * Data is fetched server-side. The interactive filter island (CharacterFilters)
 * is a Client Component that receives the full list and manages display state.
 * This keeps the RSC boundary at the lowest possible level.
 */
export default async function CharactersPage() {
  const characters = (await fetchApi<Character[]>('/api/character')) ?? [];

  return (
    <section aria-labelledby="characters-heading">
      {/* Page header */}
      <PageHeader
        title="Personajes"
        subtitle={
          characters.length === 0
            ? 'Crea tu primer personaje para empezar.'
            : `${characters.length} ${characters.length === 1 ? 'personaje' : 'personajes'}`
        }
        action={<CreateCharacterButton />}
      />

      {/*
       * CharacterFilters is a 'use client' island.
       * It owns the PC/NPC filter toggle and renders the grid.
       * Passing all characters here keeps server rendering in charge
       * of data fetching while the client handles display logic only.
       */}
      <CharacterFilters characters={characters} />
    </section>
  );
}
