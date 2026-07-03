import { create } from 'zustand'
import { db } from '@core/db/database'
import type { Prova } from '@core/types/schema'

interface ProvasState {
  provas: Prova[]
  carregar: () => Promise<void>
  criar: (titulo: string, data: string, disciplinas: string[]) => Promise<void>
  remover: (id: number) => Promise<void>
  proxima: () => Prova | null
}

export const useProvasStore = create<ProvasState>((set, get) => ({
  provas: [],

  carregar: async () => {
    const todas = await db.provas.orderBy('data').toArray()
    set({ provas: todas })
  },

  criar: async (titulo, data, disciplinas) => {
    await db.provas.add({ titulo, data, disciplinas, criado_em: new Date().toISOString() })
    await get().carregar()
  },

  remover: async (id) => {
    await db.provas.delete(id)
    await get().carregar()
  },

  proxima: () => {
    const hoje = new Date().toISOString().slice(0, 10)
    return get().provas.filter((p) => p.data >= hoje).sort((a, b) => a.data.localeCompare(b.data))[0] ?? null
  },
}))

export function diasAte(dataIso: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const alvo = new Date(dataIso + 'T00:00:00')
  return Math.round((alvo.getTime() - hoje.getTime()) / 86_400_000)
}
