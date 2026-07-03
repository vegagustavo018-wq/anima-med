// ═══════════════════════════════════════════════════════════════════════════
// STREAK-RITMO — Serviço de acompanhamento de ritmo de estudo
//
// Responsabilidades:
// 1. Registrar sessões de estudo (bloco × tempo × qualidade)
// 2. Computar streak (dias consecutivos com qualidade > 0)
// 3. Gerar heatmap GitHub-style para visualização
// 4. Detectar milestones e disparar celebrações
// 5. Prever risco de quebra e oferecer intervenção
// ═══════════════════════════════════════════════════════════════════════════
import { db } from '@core/db/database';
import { MILESTONES_PADRAO, computarIntensidade, predizerRiscoQuebra, calcularFase, } from '@core/types/streak';
/**
 * Registrar uma sessão de estudo completa.
 *
 * Quando o aluno finaliza uma sessão de estudo (por ex., após fechar EstudarPage),
 * chamamos este função com os dados agregados.
 */
export async function registrarSessaoEstudo(sessao) {
    const agora = new Date().toISOString();
    const hoje = agora.split('T')[0];
    // Se já existe uma sessão hoje, atualizar em vez de criar
    const sessaoExistente = await db.sessoesEstudo
        .where('data')
        .equals(hoje)
        .first();
    let sessaoSalva;
    if (sessaoExistente) {
        // Merge: agregar blocos, somar tempos
        const blocosMap = new Map(sessaoExistente.blocos_estudados.map((b) => [b.bloco_id, b]));
        for (const bloco of sessao.blocos_estudados) {
            if (blocosMap.has(bloco.bloco_id)) {
                const existente = blocosMap.get(bloco.bloco_id);
                existente.tempo_minutos += bloco.tempo_minutos;
                existente.cards_revisados += bloco.cards_revisados;
                // Recalcular média de qualidade
                existente.qualidade_media =
                    (existente.qualidade_media + bloco.qualidade_media) / 2;
            }
            else {
                blocosMap.set(bloco.bloco_id, bloco);
            }
        }
        sessaoSalva = {
            ...sessaoExistente,
            hora_fim: sessao.hora_fim,
            blocos_estudados: Array.from(blocosMap.values()),
            tempo_total_minutos: sessaoExistente.tempo_total_minutos + sessao.tempo_total_minutos,
            tempo_sessao_ativa_minutos: (sessaoExistente.tempo_sessao_ativa_minutos || 0) + (sessao.tempo_sessao_ativa_minutos || 0),
            qualidade_flashcards_media: (sessaoExistente.qualidade_flashcards_media + sessao.qualidade_flashcards_media) / 2,
            finalizado_em: sessao.finalizado_em || agora,
        };
        await db.sessoesEstudo.put(sessaoSalva);
    }
    else {
        // Criar nova
        sessaoSalva = {
            data: hoje,
            ...sessao,
            criado_em: agora,
        };
        await db.sessoesEstudo.add(sessaoSalva);
    }
    // Atualizar cache de DiaEstudo
    await atualizarDiaEstudo(hoje);
    // Recalcular streak
    await recalcularStreak();
    return sessaoSalva;
}
/**
 * Atualizar cache de DiaEstudo para uma data específica.
 * Agregado de todas as sessões naquele dia.
 */
async function atualizarDiaEstudo(data) {
    const sessoes = await db.sessoesEstudo
        .where('data')
        .equals(data)
        .toArray();
    if (sessoes.length === 0) {
        // Remover dia se não há sessões
        await db.diasEstudo.delete(data);
        return;
    }
    const tempo_total = sessoes.reduce((sum, s) => sum + s.tempo_total_minutos, 0);
    const blocos_unicos = new Set(sessoes.flatMap((s) => s.blocos_estudados.map((b) => b.bloco_id))).size;
    const qualidade_media = sessoes.reduce((sum, s) => sum + s.qualidade_flashcards_media, 0) / sessoes.length;
    const intensidade = computarIntensidade(qualidade_media, tempo_total);
    const diaEstudo = {
        data,
        sessoes_count: sessoes.length,
        tempo_total_minutos: tempo_total,
        blocos_unicos_estudados: blocos_unicos,
        qualidade_media,
        intensidade,
        tem_dados: qualidade_media > 0,
    };
    await db.diasEstudo.put(diaEstudo);
}
/**
 * Recalcular o streak com base no histórico de DiaEstudo.
 *
 * Lógica:
 * - Dias com qualidade_media > 0 contam como "dia de estudo"
 * - Dias consecutivos (não precisa ser do calendário, mas consecutivos na timeline)
 * - Se há um dia com qualidade_media = 0, o streak quebra
 * - Registrar a quebra
 */
async function recalcularStreak() {
    const hoje = new Date().toISOString().split('T')[0];
    const historicoUltimo90 = await db.diasEstudo
        .orderBy('data')
        .reverse()
        .limit(90)
        .toArray();
    // Ordenar cronologicamente (mais antigo primeiro para contar dias consecutivos)
    historicoUltimo90.sort((a, b) => a.data.localeCompare(b.data));
    let dias_atuais = 0;
    let recorde = 0;
    let ultima_sessao_data = null;
    let quebrarom_em = null;
    // Contar regressivamente a partir de hoje
    const historicoReverso = [...historicoUltimo90].reverse();
    for (let i = 0; i < historicoReverso.length; i++) {
        const dia = historicoReverso[i];
        if (dia.tem_dados) {
            dias_atuais++;
            if (!ultima_sessao_data)
                ultima_sessao_data = dia.data;
        }
        else {
            // Quebra encontrada
            if (dias_atuais > 0) {
                recorde = Math.max(recorde, dias_atuais);
                quebrarom_em = dia.data;
            }
            break; // parar contagem regressiva
        }
    }
    // Se nenhuma quebra foi encontrada, recorde = dias_atuais
    if (recorde === 0)
        recorde = dias_atuais;
    const dias_desde_ultima = ultima_sessao_data
        ? Math.floor((new Date(hoje).getTime() - new Date(ultima_sessao_data).getTime()) /
            (1000 * 60 * 60 * 24))
        : 999;
    const streak = {
        dias_atuais,
        recorde,
        ultima_sessao_data,
        dias_sem_quebra: dias_atuais, // neste contexto, mesmo que dias_atuais
        quebrarom_em,
    };
    // Guardar como singleton (sempre ID 1)
    await db.streakAtual.put({ id: 1, ...streak });
}
/**
 * Obter o streak atual.
 */
export async function obterStreakAtual() {
    return db.streakAtual.get(1) || null;
}
/**
 * Gerar dados para o heatmap GitHub-style.
 *
 * Retorna: array de 84 dias (12 semanas × 7 dias) com cores e tooltips.
 */
export async function gerarHeatmap() {
    const hoje = new Date();
    const inicio = new Date(hoje);
    inicio.setDate(hoje.getDate() - 83); // 12 semanas atrás
    const diasIntervalo = [];
    for (let i = 0; i < 84; i++) {
        const data = new Date(inicio);
        data.setDate(data.getDate() + i);
        diasIntervalo.push(data.toISOString().split('T')[0]);
    }
    const diasEstudoMap = new Map();
    const diasEstudo = await db.diasEstudo
        .where('data')
        .anyOf(diasIntervalo)
        .toArray();
    for (const dia of diasEstudo) {
        diasEstudoMap.set(dia.data, dia);
    }
    const heatmap = [];
    for (let i = 0; i < 84; i++) {
        const data = diasIntervalo[i];
        const dia_semana = new Date(data).getDay();
        const semana = Math.floor(i / 7);
        const diaEstudo = diasEstudoMap.get(data);
        const intensidade = diaEstudo?.intensidade ?? 0;
        const tempo_minutos = diaEstudo?.tempo_total_minutos ?? 0;
        const cards = diaEstudo?.blocos_unicos_estudados ?? 0;
        const qualidade = diaEstudo?.qualidade_media ?? 0;
        heatmap.push({
            data,
            dia_semana,
            semana,
            intensidade,
            tempo_minutos,
            cards,
            qualidade,
            tooltip: `${data}: ${tempo_minutos}m, ${cards} tópicos, qualidade ${qualidade.toFixed(1)}/5`,
        });
    }
    return heatmap;
}
/**
 * Gerar resumo de ritmo para exibição no dashboard.
 */
export async function gerarResumoRitmo() {
    const streak = (await obterStreakAtual()) || {
        dias_atuais: 0,
        recorde: 0,
        ultima_sessao_data: null,
        dias_sem_quebra: 0,
        quebrarom_em: null,
    };
    const heatmap = await gerarHeatmap();
    const ultimaSessao = await db.sessoesEstudo
        .orderBy('data')
        .reverse()
        .first();
    // Detectar próximo milestone
    const milestonesOrdenados = Object.values(MILESTONES_PADRAO).sort((a, b) => a.dias - b.dias);
    let proximaMeta = null;
    for (const m of milestonesOrdenados) {
        if (streak.dias_atuais < m.dias) {
            proximaMeta = m;
            break;
        }
    }
    // Milestones alcançados
    const milestonesAlcancados = milestonesOrdenados.filter((m) => streak.dias_atuais >= m.dias);
    // Tendência: comparar últimas 2 semanas vs semana anterior
    const heatmapAgregado = heatmap.slice(-28); // últimas 4 semanas
    const semanaAtual = heatmapAgregado.slice(-7);
    const semanaAnterior = heatmapAgregado.slice(-14, -7);
    const mediaAtual = semanaAtual.reduce((sum, d) => sum + d.qualidade, 0) / semanaAtual.length;
    const mediaAnterior = semanaAnterior.reduce((sum, d) => sum + d.qualidade, 0) / semanaAnterior.length;
    let tendencia = 'estavel';
    if (mediaAtual > mediaAnterior + 0.5)
        tendencia = 'subindo';
    else if (mediaAtual < mediaAnterior - 0.5)
        tendencia = 'caindo';
    // Dias com estudo na semana atual
    const semanaAtualDias = semanaAtual.filter((d) => d.tem_dados).length;
    const dias_desde_ultima = ultimaSessao
        ? Math.floor((new Date().getTime() - new Date(ultimaSessao.data).getTime()) /
            (1000 * 60 * 60 * 24))
        : 999;
    const fase = calcularFase(streak, dias_desde_ultima);
    return {
        streak_atual: streak,
        fase,
        heatmap_ultimas_12_semanas: heatmap.map((h) => ({
            data: h.data,
            sessoes_count: 0, // será preenchido do diasEstudo se necessário
            tempo_total_minutos: h.tempo_minutos,
            blocos_unicos_estudados: h.cards,
            qualidade_media: h.qualidade,
            intensidade: h.intensidade,
            tem_dados: h.qualidade > 0,
        })),
        ultima_sessao: ultimaSessao || null,
        proxima_meta: proximaMeta,
        milestonesAlcancados,
        tendencia,
        semana_atual_dias_com_estudo: semanaAtualDias,
    };
}
/**
 * Detectar e registrar risco de quebra de streak.
 * Retorna a quantidade de dias até a quebra, ou null se seguro.
 */
export async function detectarRiscoQuebra() {
    const streak = await obterStreakAtual();
    if (!streak || streak.dias_atuais < 7)
        return null; // sem risco ainda
    const historicoUltimas2sem = await db.diasEstudo
        .orderBy('data')
        .reverse()
        .limit(14)
        .toArray();
    return predizerRiscoQuebra(streak.dias_atuais, streak.ultima_sessao_data || new Date().toISOString().split('T')[0], historicoUltimas2sem);
}
/**
 * Obter milestones que foram alcançados historicamente.
 * Usado para exibir badges no Corpo ou Memória.
 */
export async function obterMilestonesHistoricos() {
    const streak = await obterStreakAtual();
    if (!streak)
        return [];
    const milestonesOrdenados = Object.values(MILESTONES_PADRAO).sort((a, b) => a.dias - b.dias);
    return milestonesOrdenados.filter((m) => streak.dias_atuais >= m.dias);
}
export { MILESTONES_PADRAO, computarIntensidade, intensidadeParaCor, intensidadeParaRaio } from '@core/types/streak';
