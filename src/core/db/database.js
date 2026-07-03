import Dexie, {} from 'dexie';
const db = new Dexie('AnimaMedDB');
// ── v1: schema legado (tabela única com progresso acoplado) ──────────────────
db.version(1).stores({
    blocos: [
        'resumo_id',
        'no_pai_id',
        '*nos_filhos_ids',
        'metadata.disciplina',
        'metadata.semestre',
        'metadata.nivel',
        'metadata.tipo',
        '*metadata.tags',
        'metricas_estudo.status',
        'metricas_estudo.proxima_revisao',
    ].join(', '),
});
// ── v2: separação conteúdo/progresso + tabelas de apoio ──────────────────────
db.version(2)
    .stores({
    blocos: [
        'resumo_id',
        'no_pai_id',
        'metadata.disciplina',
        'metadata.semestre',
        'metadata.nivel',
        'metadata.tipo',
        '*metadata.tags',
    ].join(', '),
    progresso: ['resumo_id', 'srs.status', 'srs.proxima_revisao', 'marcado_para_revisao'].join(', '),
    meta: 'chave',
    duvidas: '++id, resumo_id, resolvida, criado_em',
    eventos: '++id, tipo, criado_em',
})
    .upgrade(async (tx) => {
    // Migração: extrai qualquer progresso que vivia dentro dos blocos antigos
    const agora = new Date().toISOString();
    const antigos = await tx.table('blocos').toArray();
    for (const b of antigos) {
        const m = b.metricas_estudo;
        if (m && (m.vezes_lido > 0 || m.ultima_leitura)) {
            await tx.table('progresso').put({
                resumo_id: b.resumo_id,
                vezes_lido: m.vezes_lido ?? 0,
                ultima_leitura: m.ultima_leitura ?? null,
                tempo_total_estudo_minutos: m.tempo_total_estudo_minutos ?? 0,
                marcado_para_revisao: m.marcado_para_revisao ?? false,
                srs: {
                    facilidade: m.facilidade ?? 2.5,
                    intervalo_dias: m.intervalo_dias ?? 0,
                    repeticoes: m.repeticoes ?? 0,
                    proxima_revisao: m.proxima_revisao ?? null,
                    ultima_revisao: m.ultima_revisao ?? null,
                    status: m.status ?? 'novo',
                    lapsos: 0,
                },
                srs_cards: {},
                palpites: [],
                auto_avaliacao: m.auto_avaliacao ?? {
                    explicar_para_leigo: null,
                    prever_sintomas: null,
                    aplicar_caso_novo: null,
                    conexoes_claras: null,
                },
                calibracao: [],
                notas_do_usuario: m.notas_do_usuario ?? '',
                diario_aprendizagem: m.diario_aprendizagem ?? '',
                destaques: [],
                criado_em: agora,
                atualizado_em: agora,
            });
        }
        // Remove o campo acoplado do bloco
        delete b.metricas_estudo;
        await tx.table('blocos').put(b);
    }
});
// ── v3: bem-estar, crescimento, autoria, produtividade ────────────────────────
db.version(3)
    .stores({
    checkins: '++id, criado_em',
    descobertas: '++id, resumo_id, tipo, criado_em',
    diarios: 'data',
    sessaoConfig: 'chave',
    provas: '++id, data',
})
    .upgrade(async (tx) => {
    // Compatibiliza registros antigos de progresso sem os novos campos
    const todos = await tx.table('progresso').toArray();
    for (const p of todos) {
        let mudou = false;
        if (!Array.isArray(p.historico_revisoes)) {
            p.historico_revisoes = [];
            mudou = true;
        }
        if (!Array.isArray(p.destaques)) {
            p.destaques = [];
            mudou = true;
        }
        else if (p.destaques.some((d) => !d.cor)) {
            p.destaques = p.destaques.map((d) => ({
                ...d,
                cor: d.cor ?? 'amarelo',
            }));
            mudou = true;
        }
        if (mudou)
            await tx.table('progresso').put(p);
    }
});
// ── v4: canvas de síntese ──────────────────────────────────────────────────
db.version(4).stores({
    sinteses: '++id, titulo, criado_em',
});
// ── v5: Questões (banco de MCQ + flashcards) ─────────────────────────────────
// `questoes` = conteúdo regenerável (id natural, ingerido de /questoes/*.json).
// `progressoQuestao` = desempenho do aluno (SAGRADO, chave natural questao_id).
db.version(5).stores({
    questoes: 'id, tipo, subtipo, especialidade, sistema, *tags',
    progressoQuestao: 'questao_id, srs.status, srs.proxima_revisao',
});
// ── v6: Streak-Ritmo (acompanhamento de ritmo de estudo) ──────────────────────
// `sessoesEstudo` = registro granular de cada sessão (data, tempo, qualidade).
// `diasEstudo` = cache agregado por dia (1 registro/dia, atualizado incrementalmente).
// `streakAtual` = estado do streak (dias_atuais, recorde, última sessão).
db.version(6).stores({
    sessoesEstudo: '++id, data, criado_em',
    diasEstudo: 'data',
    streakAtual: '++id',
});
export { db };
// ── Helpers de meta ──────────────────────────────────────────────────────────
export async function getMeta(chave) {
    const r = await db.meta.get(chave);
    return r?.valor;
}
export async function setMeta(chave, valor) {
    await db.meta.put({ chave, valor });
}
// ── Telemetria pessoal (local) ───────────────────────────────────────────────
export async function registrarEvento(tipo, dados) {
    try {
        await db.eventos.add({ tipo, dados, criado_em: new Date().toISOString() });
    }
    catch {
        // telemetria nunca deve quebrar o app
    }
}
