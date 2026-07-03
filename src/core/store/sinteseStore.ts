import { create } from 'zustand'
import { db } from '@core/db/database'
import type { Sintese, NoCanvas, ArestaCanvas } from '@core/types/schema'

interface SinteseState {
  lista: Sintese[]
  carregarLista: () => Promise<void>
  criar: (titulo: string) => Promise<number>
  remover: (id: number) => Promise<void>
  salvarConteudo: (id: number, nos: NoCanvas[], arestas: ArestaCanvas[]) => Promise<void>
}

export const useSinteseStore = create<SinteseState>((set, get) => ({
  lista: [],

  carregarLista: async () => {
    const todas = await db.sinteses.orderBy('criado_em').reverse().toArray()
    set({ lista: todas })
  },

  criar: async (titulo) => {
    const agora = new Date().toISOString()
    const id = await db.sinteses.add({ titulo, nos: [], arestas: [], criado_em: agora, atualizado_em: agora })
    await get().carregarLista()
    return id as number
  },

  remover: async (id) => {
    await db.sinteses.delete(id)
    await get().carregarLista()
  },

  salvarConteudo: async (id, nos, arestas) => {
    await db.sinteses.update(id, { nos, arestas, atualizado_em: new Date().toISOString() })
  },
}))
