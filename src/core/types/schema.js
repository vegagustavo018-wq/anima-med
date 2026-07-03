// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA v3.1 — Separação Conteúdo / Progresso
//
// LIÇÃO FUNDACIONAL (revisão 30/06/2026): o progresso do estudante NUNCA pode
// viver dentro do bloco de conteúdo. Blocos são regeráveis; progresso é sagrado.
// Duas tabelas Dexie: `blocos` (substituível) + `progresso` (intocável).
// ═══════════════════════════════════════════════════════════════════════════
export function progressoInicial(resumo_id, agora) {
    return {
        resumo_id,
        vezes_lido: 0,
        ultima_leitura: null,
        tempo_total_estudo_minutos: 0,
        marcado_para_revisao: false,
        srs: {
            facilidade: 2.5,
            intervalo_dias: 0,
            repeticoes: 0,
            proxima_revisao: null,
            ultima_revisao: null,
            status: 'novo',
            lapsos: 0,
        },
        srs_cards: {},
        palpites: [],
        auto_avaliacao: {
            explicar_para_leigo: null,
            prever_sintomas: null,
            aplicar_caso_novo: null,
            conexoes_claras: null,
        },
        calibracao: [],
        notas_do_usuario: '',
        diario_aprendizagem: '',
        destaques: [],
        historico_revisoes: [],
        criado_em: agora,
        atualizado_em: agora,
    };
}
