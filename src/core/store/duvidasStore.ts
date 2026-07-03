import { create } from 'zustand'
import { db, registrarEvento } from '@core/db/database'
import type { Duvida } from '@core/types/schema'

interface DuvidasState {
  duvidas: Duvida[]
  carregar: () => Promise<void>
  capturar: (trecho: string, resumo_id: string | null, contexto: string) => Promise<void>
  resolver: (id: number) => Promise<void>
  remover: (id: number) => Promise<void>
}

export const useDuvidasStore = create<DuvidasState>((set, get) => ({
  duvidas: [],

  carregar: async () => {
    const d = await db.duvidas.orderBy('criado_em').reverse().toArray()
    set({ duvidas: d })
  },

  capturar: async (trecho, resumo_id, contexto) => {
    await db.duvidas.add({
      trecho,
      resumo_id,
      contexto,
      resolvida: false,
      criado_em: new Date().toISOString(),
    })
    await registrarEvento('duvida_capturada', { resumo_id })
    await get().carregar()
  },

  resolver: async (id) => {
    await db.duvidas.update(id, { resolvida: true })
    await get().carregar()
  },

  remover: async (id) => {
    await db.duvidas.delete(id)
    await get().carregar()
  },
}))
