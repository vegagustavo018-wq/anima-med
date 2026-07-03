import { create } from 'zustand';
import { db } from '@core/db/database';
export const useSinteseStore = create((set, get) => ({
    lista: [],
    carregarLista: async () => {
        const todas = await db.sinteses.orderBy('criado_em').reverse().toArray();
        set({ lista: todas });
    },
    criar: async (titulo) => {
        const agora = new Date().toISOString();
        const id = await db.sinteses.add({ titulo, nos: [], arestas: [], criado_em: agora, atualizado_em: agora });
        await get().carregarLista();
        return id;
    },
    remover: async (id) => {
        await db.sinteses.delete(id);
        await get().carregarLista();
    },
    salvarConteudo: async (id, nos, arestas) => {
        await db.sinteses.update(id, { nos, arestas, atualizado_em: new Date().toISOString() });
    },
}));
