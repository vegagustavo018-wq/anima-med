import { create } from 'zustand';
import { db } from '@core/db/database';
export const useDiarioStore = create((set, get) => ({
    entradas: new Map(),
    carregarTudo: async () => {
        const todas = await db.diarios.toArray();
        set({ entradas: new Map(todas.map((e) => [e.data, e])) });
    },
    salvar: async (data, texto, duvidas_ids) => {
        const entrada = { data, texto, duvidas_ids, atualizado_em: new Date().toISOString() };
        await db.diarios.put(entrada);
        const novo = new Map(get().entradas);
        novo.set(data, entrada);
        set({ entradas: novo });
    },
}));
