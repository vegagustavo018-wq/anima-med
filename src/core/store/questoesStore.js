import { create } from 'zustand';
import { db } from '@core/db/database';
import { revisar, estaVencido } from '@core/srs/sm2';
import { progressoQuestaoInicial, ehMCQ, } from '@core/types/questoes';
function embaralhar(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
async function obterProg(cache, questao_id) {
    if (cache[questao_id])
        return cache[questao_id];
    const existente = await db.progressoQuestao.get(questao_id);
    return existente ?? progressoQuestaoInicial(questao_id, new Date().toISOString());
}
async function persistir(p) {
    p.atualizado_em = new Date().toISOString();
    await db.progressoQuestao.put(p);
}
const MAX_HIST = 100;
export const useQuestoesStore = create((set, get) => ({
    progresso: {},
    carregarProgresso: async () => {
        const todos = await db.progressoQuestao.toArray();
        const map = {};
        for (const p of todos)
            map[p.questao_id] = p;
        set({ progresso: map });
    },
    estatisticas: async () => {
        const [totalMCQ, totalFlashcards, progs, mcqs] = await Promise.all([
            db.questoes.where('tipo').equals('mcq').count(),
            db.questoes.where('tipo').equals('flashcard').count(),
            db.progressoQuestao.toArray(),
            db.questoes.where('tipo').equals('mcq').toArray(),
        ]);
        const respondidas = progs.filter((p) => p.tentativas > 0).length;
        const acertos = progs.reduce((s, p) => s + p.acertos, 0);
        const tentativasTotais = progs.reduce((s, p) => s + p.tentativas, 0);
        const vencidas = progs.filter((p) => p.tentativas > 0 && estaVencido(p.srs)).length;
        const progById = new Map(progs.map((p) => [p.questao_id, p]));
        const espMap = new Map();
        for (const q of mcqs) {
            const e = espMap.get(q.especialidade) ?? { total: 0, respondidas: 0 };
            e.total++;
            const pr = progById.get(q.id);
            if (pr && pr.tentativas > 0)
                e.respondidas++;
            espMap.set(q.especialidade, e);
        }
        const porEspecialidade = [...espMap.entries()]
            .map(([especialidade, v]) => ({ especialidade, ...v }))
            .sort((a, b) => b.total - a.total);
        return { totalMCQ, totalFlashcards, respondidas, tentativasTotais, acertos, vencidas, porEspecialidade };
    },
    listar: async ({ tipo, especialidade }) => {
        let col = tipo ? db.questoes.where('tipo').equals(tipo) : db.questoes.toCollection();
        let arr = await col.toArray();
        if (especialidade)
            arr = arr.filter((q) => q.especialidade === especialidade);
        return arr;
    },
    montarSessao: async ({ tipo, especialidade, quantidade, apenasNaoRespondidas }) => {
        let arr = await get().listar({ tipo, especialidade });
        if (apenasNaoRespondidas) {
            const progs = get().progresso;
            arr = arr.filter((q) => !(progs[q.id]?.tentativas > 0));
        }
        return embaralhar(arr).slice(0, quantidade);
    },
    // Revisão: questões já respondidas que venceram (SRS) — erradas primeiro.
    montarRevisao: async (quantidade) => {
        const progs = await db.progressoQuestao.toArray();
        const vencidas = progs
            .filter((p) => p.tentativas > 0 && estaVencido(p.srs))
            .sort((a, b) => a.acertos / Math.max(1, a.tentativas) - b.acertos / Math.max(1, b.tentativas));
        const ids = vencidas.slice(0, quantidade).map((p) => p.questao_id);
        const itens = await db.questoes.bulkGet(ids);
        return itens.filter(Boolean);
    },
    responderMCQ: async (q, escolha, modo, ms) => {
        const acertou = escolha === q.correta;
        const p = { ...(await obterProg(get().progresso, q.id)) };
        // qualidade SM-2: acerto rápido = 5, acerto = 4, erro = 1
        const qual = acertou ? (ms != null && ms < 12000 ? 5 : 4) : 1;
        p.srs = revisar(p.srs, qual);
        p.tentativas += 1;
        if (acertou)
            p.acertos += 1;
        p.ultima_escolha = escolha;
        p.historico = [...p.historico, { data: new Date().toISOString(), acertou, escolha, ms, modo }].slice(-MAX_HIST);
        await persistir(p);
        set((s) => ({ progresso: { ...s.progresso, [q.id]: p } }));
        return { acertou, correta: q.correta, comentario: q.comentario };
    },
    avaliarFlashcard: async (questao_id, qualidade, modo) => {
        const p = { ...(await obterProg(get().progresso, questao_id)) };
        p.srs = revisar(p.srs, qualidade);
        p.tentativas += 1;
        if (qualidade >= 3)
            p.acertos += 1;
        p.historico = [
            ...p.historico,
            { data: new Date().toISOString(), acertou: qualidade >= 3, modo },
        ].slice(-MAX_HIST);
        await persistir(p);
        set((s) => ({ progresso: { ...s.progresso, [questao_id]: p } }));
    },
}));
export { ehMCQ };
