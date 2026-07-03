import { create } from 'zustand';
import { db } from '@core/db/database';
export const useDescobertasStore = create((set, get) => ({
    descobertas: [],
    carregar: async () => {
        const d = await db.descobertas.orderBy('criado_em').reverse().toArray();
        set({ descobertas: d });
    },
    registrar: async (d) => {
        await db.descobertas.add({ ...d, criado_em: new Date().toISOString() });
        await get().carregar();
    },
    jaRegistradaHoje: async (tipo) => {
        const hoje = new Date().toISOString().slice(0, 10);
        const todas = await db.descobertas.where('tipo').equals(tipo).toArray();
        return todas.some((d) => d.criado_em.slice(0, 10) === hoje);
    },
}));
