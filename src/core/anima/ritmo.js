import { db } from '@core/db/database';
const JANELA_DIAS = 30;
/**
 * Constrói os últimos N dias como "ondas de ritmo" — não um contador que zera
 * com drama. Dias de descanso são normais; o que se celebra é a RETOMADA.
 */
export async function calcularOnda() {
    const progresso = await db.progresso.toArray();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const porDia = new Map();
    for (const p of progresso) {
        if (p.ultima_leitura) {
            const d = p.ultima_leitura.slice(0, 10);
            porDia.set(d, (porDia.get(d) ?? 0) + 1);
        }
        for (const c of p.calibracao) {
            const d = c.data.slice(0, 10);
            porDia.set(d, (porDia.get(d) ?? 0) + 1);
        }
    }
    const maxContagem = Math.max(1, ...porDia.values());
    const dias = [];
    let diasSemAtividadeSeguidos = 0;
    for (let i = JANELA_DIAS - 1; i >= 0; i--) {
        const d = new Date(hoje);
        d.setDate(d.getDate() - i);
        const iso = d.toISOString().slice(0, 10);
        const contagem = porDia.get(iso) ?? 0;
        const intensidade = Math.min(1, contagem / maxContagem);
        const ehRetomada = contagem > 0 && diasSemAtividadeSeguidos >= 2;
        dias.push({ data: iso, intensidade, ehHoje: i === 0, ehRetomada });
        diasSemAtividadeSeguidos = contagem > 0 ? 0 : diasSemAtividadeSeguidos + 1;
    }
    return dias;
}
/** Continuidade atual: dias seguidos com atividade, contando "hoje" só se já houve algo. */
export function continuidadeAtual(dias) {
    let n = 0;
    for (let i = dias.length - 1; i >= 0; i--) {
        if (dias[i].intensidade > 0)
            n++;
        else if (!dias[i].ehHoje)
            break;
        else
            continue; // hoje sem atividade ainda não quebra
    }
    return n;
}
