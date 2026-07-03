// ═══════════════════════════════════════════════════════════════════════════
// STREAK-RITMO — Acompanhamento de ritmo de estudo
//
// Filosofia: O ritmo importa mais que a quantidade. 5 dias de estudo seguidos
// = +1 dia de streak. Visual: heatmap GitHub-style + celebração em milestones.
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Milestones pré-definidos — celebrações de longa duração.
 */
export const MILESTONES_PADRAO = {
    sete_dias: {
        tipo: 'sete_dias',
        dias: 7,
        titulo: 'Primeira Semana!',
        descricao: 'Você manteve a consistência por 7 dias seguidos. ANIMA está apreendendo seu ritmo.',
        emoji: '🌱',
        confetiBurst: true,
        som_celebracao: 'primeira-semana.mp3',
        cor_fundo: '#e8f5e9',
        animacao: 'pulse',
    },
    trinta_dias: {
        tipo: 'trinta_dias',
        dias: 30,
        titulo: 'Um Mês de Disciplina!',
        descricao: 'Seu organismo aprendeu o ritmo. A neuroplasticidade está em marcha.',
        emoji: '🔥',
        confetiBurst: true,
        som_celebracao: 'um-mes.mp3',
        cor_fundo: '#fff3e0',
        animacao: 'bounce',
    },
    cem_dias: {
        tipo: 'cem_dias',
        dias: 100,
        titulo: 'Cem Dias de Maestria!',
        descricao: 'Você não apenas aprendeu a estudar. Você tornou-se um ritmo. ANIMA celebra em silêncio reverente.',
        emoji: '⭐',
        confetiBurst: true,
        som_celebracao: 'cem-dias.mp3',
        cor_fundo: '#f3e5f5',
        animacao: 'rainbow',
    },
};
/**
 * Padrões para detectar a fase de ritmo.
 * Ajustáveis via analytics e feedback do usuário.
 */
export const LIMIARES_FASE = {
    iniciante: { dias_minimos: 0, dias_maximos: 6 }, // menos de uma semana
    consistente: { dias_minimos: 7, dias_maximos: 29 }, // 1–4 semanas
    intenso: { dias_minimos: 30, dias_maximos: 999 }, // 1+ meses
    em_recuperacao: { dias_sem_estudar: 3 }, // 3 dias de pausa = recuperação
    abandonado: { dias_sem_estudar: 14 }, // 2 semanas = abandono
};
/**
 * Função para computar intensidade (0–1) a partir de qualidade (0–5) e tempo (minutos).
 * Mantém o usuário motivado mesmo em dias curtos: preferimos consistência sobre quantidade.
 */
export function computarIntensidade(qualidade_media, tempo_minutos) {
    // Fórmula: 40% qualidade + 60% tempo (normalizado a 45 min = intensidade 1.0)
    const peso_qualidade = (qualidade_media / 5) * 0.4;
    const peso_tempo = Math.min(tempo_minutos / 45, 1) * 0.6; // máximo 45 min = 100%
    return peso_qualidade + peso_tempo;
}
/**
 * Mapeia intensidade (0–1) para cor hexadecimal (GitHub-style).
 * Branco → Cinza claro → Verde claro → Verde médio → Verde escuro
 */
export function intensidadeParaCor(intensidade) {
    if (intensidade === 0)
        return '#ebedf0'; // branco
    if (intensidade < 0.25)
        return '#c6e48b'; // verde muito claro
    if (intensidade < 0.5)
        return '#7bc96f'; // verde claro
    if (intensidade < 0.75)
        return '#239a3b'; // verde médio
    return '#196127'; // verde escuro
}
/**
 * Mapeia intensidade para tamanho de raio em SVG (círculos aninhados).
 * Opcional: em vez de cor sólida, raios concêntricos para acessibilidade.
 */
export function intensidadeParaRaio(intensidade) {
    // Escala: 0 → 2px, 1.0 → 12px
    return 2 + intensidade * 10;
}
/**
 * Preditor de quebra de streak — detecta risco de abandono.
 * Retorna: número de dias até risco (0 = em risco hoje, null = seguro)
 */
export function predizerRiscoQuebra(dias_atuais, ultimo_dia_com_estudo, historico_ultimas_2_semanas) {
    if (dias_atuais < 7)
        return null; // menos de 1 semana = sem risco ainda
    const hoje = new Date().toISOString().split('T')[0];
    const ultimo = new Date(ultimo_dia_com_estudo);
    const agora = new Date(hoje);
    const dias_sem_estudar = Math.floor((agora.getTime() - ultimo.getTime()) / (1000 * 60 * 60 * 24));
    // Se já passou 3 dias sem estudar, streak está em risco
    if (dias_sem_estudar >= 3)
        return 0;
    // Tendência: se últimas 5 dias têm qualidade < 2/5, risco para amanhã
    const ultimos_5 = historico_ultimas_2_semanas.slice(-5);
    const qualidade_media = ultimos_5.reduce((sum, d) => sum + d.qualidade_media, 0) / ultimos_5.length;
    if (qualidade_media < 2)
        return 1;
    return null;
}
/**
 * Calcula a fase de ritmo atual.
 */
export function calcularFase(streak_atual, dias_desde_ultima_sessao) {
    if (dias_desde_ultima_sessao > LIMIARES_FASE.abandonado.dias_sem_estudar)
        return 'abandonado';
    if (dias_desde_ultima_sessao >= LIMIARES_FASE.em_recuperacao.dias_sem_estudar)
        return 'em_recuperacao';
    if (streak_atual.dias_atuais >= LIMIARES_FASE.intenso.dias_minimos)
        return 'intenso';
    if (streak_atual.dias_atuais >= LIMIARES_FASE.consistente.dias_minimos)
        return 'consistente';
    return 'iniciante';
}
