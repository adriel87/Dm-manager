import { describe, it, expect, beforeEach, vi } from 'vitest'
import { resolveAutocomplete } from '../../src/commands/dm-record/autocomplete.js'
import type { Campaign } from '../../src/types/dm-manager.js'

const campaigns: Campaign[] = [
  { id: 'abc123', name: 'La Maldición de Strahd', status: 'Activa' },
  { id: 'def456', name: 'Descent into Avernus', status: 'Activa' },
  { id: 'ghi789', name: 'Curse of Strahd', status: 'Finalizada' },
]

describe('resolveAutocomplete', () => {
  beforeEach(() => vi.clearAllMocks())

  it('TC-1: query vacía devuelve todas las campañas', () => {
    const result = resolveAutocomplete(campaigns, '')
    expect(result).toHaveLength(3)
  })

  it('TC-2: filtra por nombre case-insensitive', () => {
    const result = resolveAutocomplete(campaigns, 'strahd')
    expect(result).toHaveLength(2)
    const names = result.map((c) => c.name)
    expect(names).toContain('La Maldición de Strahd')
    expect(names).toContain('Curse of Strahd')
  })

  it('TC-3: filtra por id que empiece por el valor', () => {
    const result = resolveAutocomplete(campaigns, 'def')
    expect(result).toHaveLength(1)
    expect(result[0].value).toBe('def456')
  })

  it('TC-4: limita a 25 resultados', () => {
    const manyCampaigns: Campaign[] = Array.from({ length: 30 }, (_, i) => ({
      id: `id-${i}`,
      name: `Campaign ${i}`,
      status: 'Activa',
    }))
    const result = resolveAutocomplete(manyCampaigns, '')
    expect(result).toHaveLength(25)
  })

  it('TC-5: campaña sin coincidencia no aparece', () => {
    const result = resolveAutocomplete(campaigns, 'zzznomatch')
    expect(result).toHaveLength(0)
  })

  it('TC-6: devuelve { name: campaign.name, value: campaign.id }', () => {
    const result = resolveAutocomplete(campaigns, 'avernus')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Descent into Avernus')
    expect(result[0].value).toBe('def456')
  })

  it('TC-7: query vacía con más de 25 campañas devuelve exactamente 25', () => {
    const manyCampaigns: Campaign[] = Array.from({ length: 100 }, (_, i) => ({
      id: `id-${i}`,
      name: `Campaign ${i}`,
      status: 'Activa',
    }))
    const result = resolveAutocomplete(manyCampaigns, '')
    expect(result).toHaveLength(25)
  })
})
