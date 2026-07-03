import { db } from '@core/db/database';
/**
 * Barômetro de Bem-Estar Cognitivo (bloco 7) — percebe sobrecarga (fila
 * explodindo, sessões de madrugada repetidas) e oferece pausa em vez de
 * empurrar mais. Nunca é bloqueante — só uma oferta.
 */
export async function lerBemEstar() {
    const progresso = await db.progresso.toArray();
    const agora = new Date();
    let vencidosAcumulados = 0;
    for (const p of progresso) {
        if (p.vezes_lido > 0 && p.srs.proxima_revisao && new Date(p.srs.proxima_revisao) <= agora) {
            vencidosAcumulados++;
        }
    }
    const seteDiasAtras = new Date(agora);
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    let sessoesTardias7d = 0;
    for (const p of progresso) {
        for (const h of p.historico_revisoes) {
            const d = new Date(h.data);
            if (d < seteDiasAtras)
                continue;
            const hora = d.getHours();
            if (hora >= 0 && hora < 5)
                sessoesTardias7d++;
        }
    }
    let sobrecarga = false;
    let motivo = null;
    if (vencidosAcumulados > 40) {
        sobrecarga = true;
        motivo = `${vencidosAcumulados} blocos vencidos se acumularam. Não precisa zerar hoje.`;
    }
    else if (sessoesTardias7d >= 4) {
        sobrecarga = true;
        motivo = `Você estudou de madrugada ${sessoesTardias7d}× esta semana. Seu corpo está pedindo sono.`;
    }
    return { sobrecarga, motivo, sessoesTardias7d, vencidosAcumulados };
}
