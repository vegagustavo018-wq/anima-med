export function ehMCQ(q) {
    return q.tipo === 'mcq';
}
export function progressoQuestaoInicial(questao_id, agora) {
    return {
        questao_id,
        srs: {
            facilidade: 2.5,
            intervalo_dias: 0,
            repeticoes: 0,
            proxima_revisao: null,
            ultima_revisao: null,
            status: 'novo',
            lapsos: 0,
        },
        tentativas: 0,
        acertos: 0,
        ultima_escolha: null,
        historico: [],
        criado_em: agora,
        atualizado_em: agora,
    };
}
