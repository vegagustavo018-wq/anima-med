import { db } from '@core/db/database';
import { estaVencido, ehLeech } from '@core/srs/sm2';
function diasDesde(iso, agora) {
    if (!iso)
        return 0;
    return Math.max(0, (agora - new Date(iso).getTime()) / 86_400_000);
}
/**
 * Monta a fila de blocos a revisar, ordenada por prioridade:
 * atraso (dias vencidos) + peso de leech + peso de marcado manual.
 */
export async function montarFilaEstudo(teto = 9999) {
    const agora = Date.now();
    const progresso = await db.progresso.toArray();
    const itens = [];
    for (const p of progresso) {
        if (p.vezes_lido === 0 && !p.marcado_para_revisao)
            continue;
        const vencido = p.vezes_lido > 0 && estaVencido(p.srs);
        const leech = ehLeech(p.srs);
        if (!vencido && !p.marcado_para_revisao)
            continue;
        const diasAtraso = diasDesde(p.srs.proxima_revisao, agora);
        const motivo = leech ? 'leech' : p.marcado_para_revisao && !vencido ? 'marcado' : 'vencido';
        // prioridade: atraso pesa, leech e marcado ganham empurrão
        const prioridade = diasAtraso * 2 + (leech ? 30 : 0) + (p.marcado_para_revisao ? 12 : 0) + p.srs.lapsos * 4;
        itens.push({ resumo_id: p.resumo_id, prioridade, motivo, diasAtraso, lapsos: p.srs.lapsos });
    }
    itens.sort((a, b) => b.prioridade - a.prioridade);
    return itens.slice(0, teto);
}
/**
 * Conta o que está pedindo revisão hoje, através das verticais — para um
 * indicador reativo na Home. Leve: só varre tabelas de progresso (sagradas).
 */
export async function resumoPendencias() {
    const [progresso, progQuestoes] = await Promise.all([
        db.progresso.toArray(),
        db.progressoQuestao.toArray(),
    ]);
    let blocos = 0;
    let cards = 0;
    for (const p of progresso) {
        if ((p.vezes_lido > 0 && estaVencido(p.srs)) || p.marcado_para_revisao)
            blocos++;
        for (const card_id of Object.keys(p.srs_cards)) {
            if (estaVencido(p.srs_cards[card_id]))
                cards++;
        }
    }
    const questoes = progQuestoes.filter((p) => p.tentativas > 0 && estaVencido(p.srs)).length;
    return { blocos, cards, questoes, total: blocos + cards + questoes };
}
