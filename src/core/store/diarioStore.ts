import { create } from 'zustand'
import { db } from '@core/db/database'
import type { EntradaDiario } from '@core/types/schema'

interface DiarioState {
  entradas: Map<string, EntradaDiario>
  carregarTudo: () => Promise<void>
  salvar: (data: string, texto: string, duvidas_ids: number[]) => Promise<void>
}

export const useDiarioStore = create<DiarioState>((set, get) => ({
  entradas: new Map(),

  carregarTudo: async () => {
    const todas = await db.diarios.toArray()
    set({ entradas: new Map(todas.map((e) => [e.data, e])) })
  },

  salvar: async (data, texto, duvidas_ids) => {
    const entrada: EntradaDiario = { data, texto, duvidas_ids, atualizado_em: new Date().toISOString() }
    await db.diarios.put(entrada)
    const novo = new Map(get().entradas)
    novo.set(data, entrada)
    set({ entradas: novo })
  },
}))
