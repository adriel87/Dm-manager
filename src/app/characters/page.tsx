import type { Metadata } from 'next';
import { type Character } from '@/components/characters/CharacterCard';
import { CharacterFilters } from '@/components/characters/CharacterFilters';
import { CreateCharacterButton } from '@/components/characters/CreateCharacterButton';

export const metadata: Metadata = {
  title: 'Personajes | DM Manager',
  description: 'Gestiona todos los personajes jugadores y NPCs de tus campañas.',
};

/**
 * Fetches the full character list from the internal API.
 * cache: 'no-store' guarantees fresh data on each request — characters are
 * frequently created and edited during active sessions.
 * Never throws: returns [] on any network or parse error so the page renders.
 */
async function getCharacters(): Promise<Character[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

  try {
    const res = await fetch(`${baseUrl}/api/character`, { cache: 'no-store' });

    if (!res.ok) return [];

    const data: unknown = await res.json();

    if (Array.isArray(data)) return data as Character[];

    // Guard against `{ data: Character[] }` envelope shape
    if (
      data !== null &&
      typeof data === 'object' &&
      'data' in data &&
      Array.isArray((data as { data: unknown }).data)
    ) {
      return (data as { data: Character[] }).data;
    }

    return [];
  } catch {
    return [];
  }
}

/**
 * Characters page — Server Component.
 *
 * Data is fetched server-side. The interactive filter island (CharacterFilters)
 * is a Client Component that receives the full list and manages display state.
 * This keeps the RSC boundary at the lowest possible level.
 */
export default async function CharactersPage() {
  const characters = await getCharacters();

  return (
    <section aria-labelledby="characters-heading">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            id="characters-heading"
            className="text-white text-2xl font-bold tracking-tight"
          >
            Personajes
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {characters.length === 0
              ? 'Crea tu primer personaje para empezar.'
              : `${characters.length} ${characters.length === 1 ? 'personaje' : 'personajes'}`}
          </p>
        </div>

        <CreateCharacterButton />
      </div>

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
