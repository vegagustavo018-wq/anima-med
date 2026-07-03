import { create } from 'zustand';
import { db } from '@core/db/database';
export const useCheckInStore = create((set) => ({
    ultimo: null,
    carregarUltimo: async () => {
        const todos = await db.checkins.orderBy('criado_em').reverse().limit(1).toArray();
        set({ ultimo: todos[0] ?? null });
    },
    registrar: async (energia, humor, nota) => {
        const c = { energia, humor, nota, criado_em: new Date().toISOString() };
        await db.checkins.add(c);
        set({ ultimo: c });
    },
}));
