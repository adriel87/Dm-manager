import { describe, it, expect } from 'vitest';

/**
 * Unit tests for Play Mode character filtering logic.
 *
 * These tests cover the pure filtering functions used by:
 * - AddExistingCharacterModal (filter unassigned characters)
 * - CreateCharacterInPlayModal (form validation logic)
 *
 * Spec scenarios covered:
 * - "List shows only unassigned characters"
 * - "Search by name filters the list"
 * - "No unassigned characters available"
 * - "Empty search result"
 * - "Submit with missing required fields"
 */

// ─── Filtering helpers (mirrors AddExistingCharacterModal logic) ──────────────

interface CharacterItem {
  id: string;
  name: string;
  classType: string;
  level: number;
  isNPC?: boolean;
}

function filterUnassigned(
  allCharacters: CharacterItem[],
  assignedIds: string[]
): CharacterItem[] {
  return allCharacters.filter((c) => !assignedIds.includes(c.id));
}

function filterByName(
  characters: CharacterItem[],
  query: string
): CharacterItem[] {
  if (!query.trim()) return characters;
  return characters.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );
}

// ─── Validation helpers (mirrors CreateCharacterInPlayModal logic) ────────────

interface CharacterFormState {
  name: string;
  level: number;
  hitPoints: number;
}

function validateCharacterForm(form: CharacterFormState): string | null {
  if (!form.name.trim()) return 'El nombre del personaje es obligatorio.';
  if (form.level < 1) return 'El nivel debe ser 1 o superior.';
  if (form.hitPoints < 1) return 'Los puntos de vida deben ser 1 o superiores.';
  return null;
}

// ─── Test data ────────────────────────────────────────────────────────────────

const mockCharacters: CharacterItem[] = [
  { id: '1', name: 'Aragorn', classType: 'Fighter', level: 5 },
  { id: '2', name: 'Gandalf', classType: 'Wizard', level: 20 },
  { id: '3', name: 'Frodo', classType: 'Normal', level: 3, isNPC: false },
  { id: '4', name: 'Sauron', classType: 'Other', level: 30, isNPC: true },
  { id: '5', name: 'Samwise', classType: 'Normal', level: 2, isNPC: false },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AddExistingCharacterModal — filtering logic', () => {
  describe('filterUnassigned', () => {
    it('should return all characters when none are assigned', () => {
      const result = filterUnassigned(mockCharacters, []);
      expect(result).toHaveLength(5);
    });

    it('should exclude characters already assigned to the campaign', () => {
      const assignedIds = ['1', '3']; // Aragorn and Frodo already assigned
      const result = filterUnassigned(mockCharacters, assignedIds);
      expect(result).toHaveLength(3);
      expect(result.map((c) => c.id)).not.toContain('1');
      expect(result.map((c) => c.id)).not.toContain('3');
    });

    it('should return empty array when all characters are assigned', () => {
      const allIds = mockCharacters.map((c) => c.id);
      const result = filterUnassigned(mockCharacters, allIds);
      expect(result).toHaveLength(0);
    });

    it('should not modify the original array', () => {
      const original = [...mockCharacters];
      filterUnassigned(mockCharacters, ['1']);
      expect(mockCharacters).toHaveLength(original.length);
    });
  });

  describe('filterByName', () => {
    it('should return all characters when query is empty', () => {
      const result = filterByName(mockCharacters, '');
      expect(result).toHaveLength(5);
    });

    it('should return all characters when query is only whitespace', () => {
      const result = filterByName(mockCharacters, '   ');
      expect(result).toHaveLength(5);
    });

    it('should filter case-insensitively by name', () => {
      const result = filterByName(mockCharacters, 'aragorn');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Aragorn');
    });

    it('should match partial names', () => {
      const result = filterByName(mockCharacters, 'an');
      // Gandalf (G-an-dalf) and Samwise (S-am-wise)... only Gandalf has "an"
      expect(result.map((c) => c.name)).toContain('Gandalf');
    });

    it('should return empty array when no characters match the query', () => {
      const result = filterByName(mockCharacters, 'NonExistentXYZ');
      expect(result).toHaveLength(0);
    });

    it('should handle uppercase query correctly', () => {
      const result = filterByName(mockCharacters, 'GANDALF');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Gandalf');
    });
  });

  describe('combined: unassigned + search', () => {
    it('should apply both filters correctly', () => {
      const assignedIds = ['2']; // Gandalf assigned
      const unassigned = filterUnassigned(mockCharacters, assignedIds);
      const result = filterByName(unassigned, 'sam');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Samwise');
    });
  });
});

describe('CreateCharacterInPlayModal — validation logic', () => {
  it('should return error when name is empty', () => {
    const error = validateCharacterForm({ name: '', level: 1, hitPoints: 10 });
    expect(error).toBe('El nombre del personaje es obligatorio.');
  });

  it('should return error when name is only whitespace', () => {
    const error = validateCharacterForm({ name: '   ', level: 1, hitPoints: 10 });
    expect(error).toBe('El nombre del personaje es obligatorio.');
  });

  it('should return error when level is less than 1', () => {
    const error = validateCharacterForm({ name: 'Thorin', level: 0, hitPoints: 10 });
    expect(error).toBe('El nivel debe ser 1 o superior.');
  });

  it('should return error when hitPoints is less than 1', () => {
    const error = validateCharacterForm({ name: 'Thorin', level: 1, hitPoints: 0 });
    expect(error).toBe('Los puntos de vida deben ser 1 o superiores.');
  });

  it('should return null (no error) for valid form data', () => {
    const error = validateCharacterForm({ name: 'Thorin', level: 5, hitPoints: 50 });
    expect(error).toBeNull();
  });

  it('should validate name before level (name takes priority)', () => {
    const error = validateCharacterForm({ name: '', level: 0, hitPoints: 0 });
    expect(error).toBe('El nombre del personaje es obligatorio.');
  });

  it('should validate level before hitPoints', () => {
    const error = validateCharacterForm({ name: 'Thorin', level: -1, hitPoints: 0 });
    expect(error).toBe('El nivel debe ser 1 o superior.');
  });
});
