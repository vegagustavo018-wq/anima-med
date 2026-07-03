import { db } from '@core/db/database';
import { estaVencido } from '@core/srs/sm2';
const TETO_INTERVALO = 180;
// ── funções puras (recebem os arrays já lidos) ───────────────────────────────
function derivaCarga(prog, progQ, dias) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const mapa = new Map();
    for (let i = 0; i < dias; i++) {
        const d = new Date(hoje);
        d.setDate(d.getDate() + i);
        mapa.set(d.toISOString().slice(0, 10), { blocos: 0, questoes: 0 });
    }
    const bucket = (iso, chave) => {
        if (!iso)
            return;
        const dia = new Date(iso);
        const alvo = dia < hoje ? hoje : dia;
        const cel = mapa.get(alvo.toISOString().slice(0, 10));
        if (cel)
            cel[chave]++;
    };
    for (const p of prog)
        if (p.vezes_lido > 0 && p.srs.proxima_revisao)
            bucket(p.srs.proxima_revisao, 'blocos');
    for (const p of progQ)
        if (p.tentativas > 0 && p.srs.proxima_revisao)
            bucket(p.srs.proxima_revisao, 'questoes');
    return [...mapa.entries()].map(([data, v]) => ({ data, ...v, total: v.blocos + v.questoes }));
}
function derivaMassa(prog, progQ) {
    let massa = 0;
    let vivos = 0;
    let vencidos = 0;
    const consome = (srs, lido) => {
        if (!lido)
            return;
        vivos++;
        massa += Math.min(srs.intervalo_dias, TETO_INTERVALO);
        if (estaVencido(srs))
            vencidos++;
    };
    for (const p of prog)
        consome(p.srs, p.vezes_lido > 0);
    for (const p of progQ)
        consome(p.srs, p.tentativas > 0);
    return { massa: Math.round(massa), itensVivos: vivos, vencidos, retencaoEstim: vivos ? (vivos - vencidos) / vivos : 1 };
}
function derivaProntidao(prog, progQ, provas) {
    const iniciados = prog.filter((p) => p.vezes_lido > 0);
    const dominados = iniciados.filter((p) => p.srs.status === 'dominado').length;
    const dominioPct = iniciados.length ? dominados / iniciados.length : 0;
    const respondidas = progQ.filter((p) => p.tentativas > 0);
    const acertosTotais = respondidas.reduce((s, p) => s + p.acertos, 0);
    const tentativasTotais = respondidas.reduce((s, p) => s + p.tentativas, 0);
    const acertoQuestoesPct = tentativasTotais ? acertosTotais / tentativasTotais : 0;
    const vivos = iniciados.length + respondidas.length;
    const vencidos = iniciados.filter((p) => estaVencido(p.srs)).length + respondidas.filter((p) => estaVencido(p.srs)).length;
    const vencidosPct = vivos ? vencidos / vivos : 0;
    const agora = Date.now();
    const futuras = provas
        .map((pr) => ({ titulo: pr.titulo, dias: Math.ceil((new Date(pr.data).getTime() - agora) / 86400000) }))
        .filter((pr) => pr.dias >= 0)
        .sort((a, b) => a.dias - b.dias);
    const proxima = futuras[0] ?? null;
    const score = Math.round(Math.max(0, Math.min(100, (dominioPct * 45 + acertoQuestoesPct * 45 + 10) * (1 - vencidosPct * 0.5))));
    let veredito;
    if (vivos === 0)
        veredito = 'Ainda não há sinal suficiente. Estude e resolva questões para eu calibrar sua prontidão.';
    else if (score >= 75)
        veredito = 'Você está em boa forma. Mantenha a rega das revisões e afie os pontos fracos.';
    else if (score >= 50)
        veredito = 'Base sólida, mas há terreno a firmar. Priorize as questões que você erra e o backlog vencido.';
    else
        veredito = 'Ainda em construção. Foque em firmar domínio e zerar o que está vencido antes de simular prova cheia.';
    return { score, dominioPct, acertoQuestoesPct, vencidosPct, diasAteProva: proxima?.dias ?? null, provaTitulo: proxima?.titulo ?? null, veredito };
}
/** Leitura única → os três painéis. Preferir esta na UI. */
export async function montarPainelMemoria(dias = 30) {
    const [prog, progQ, provas] = await Promise.all([
        db.progresso.toArray(),
        db.progressoQuestao.toArray(),
        db.provas.toArray(),
    ]);
    return {
        carga: derivaCarga(prog, progQ, dias),
        massa: derivaMassa(prog, progQ),
        prontidao: derivaProntidao(prog, progQ, provas),
    };
}
