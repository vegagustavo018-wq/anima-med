import { create } from 'zustand';
import { db } from '@core/db/database';
import { buscarBlocos } from '@core/anima/busca';
function toPreview(b) {
    return {
        resumo_id: b.resumo_id,
        no_pai_id: b.no_pai_id,
        resumo_conciso: b.resumo_conciso,
        metadata: b.metadata,
    };
}
export const useBlocoStore = create((set) => ({
    blocoAtual: null,
    carregando: false,
    erro: null,
    carregarBloco: async (id) => {
        set({ carregando: true, erro: null });
        try {
            const bloco = (await db.blocos.get(id)) ?? null;
            set({ blocoAtual: bloco, carregando: false });
            return bloco;
        }
        catch (e) {
            set({ erro: String(e), carregando: false });
            return null;
        }
    },
    previewsPorPrefixo: async (prefixo) => {
        const todos = await db.blocos.where('resumo_id').startsWith(prefixo).toArray();
        return todos.map(toPreview);
    },
    previewsPorDisciplina: async (disciplina) => {
        const todos = await db.blocos.where('metadata.disciplina').equals(disciplina).toArray();
        return todos.map(toPreview);
    },
    contarPorPrefixo: async (prefixo) => {
        return db.blocos.where('resumo_id').startsWith(prefixo).count();
    },
    // Delega ao índice enxuto em memória (core/anima/busca.ts): projeta o acervo
    // uma vez e ranqueia em memória, em vez de reler 8.6k blocos inteiros por tecla.
    buscar: (termo) => buscarBlocos(termo),
}));
