import { create } from 'zustand'
import { db } from '@core/db/database'
import type { CheckIn, NivelEnergia, Humor } from '@core/types/schema'

interface CheckInState {
  ultimo: CheckIn | null
  carregarUltimo: () => Promise<void>
  registrar: (energia: NivelEnergia, humor: Humor, nota?: string) => Promise<void>
}

export const useCheckInStore = create<CheckInState>((set) => ({
  ultimo: null,

  carregarUltimo: async () => {
    const todos = await db.checkins.orderBy('criado_em').reverse().limit(1).toArray()
    set({ ultimo: todos[0] ?? null })
  },

  registrar: async (energia, humor, nota) => {
    const c: CheckIn = { energia, humor, nota, criado_em: new Date().toISOString() }
    await db.checkins.add(c)
    set({ ultimo: c })
  },
}))
