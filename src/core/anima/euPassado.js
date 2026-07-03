import { db } from '@core/db/database';
function diasEntre(iso, agora) {
    return Math.floor((agora - new Date(iso).getTime()) / 86_400_000);
}
export async function compararComPassado() {
    const [progresso, blocos] = await Promise.all([db.progresso.toArray(), db.blocos.toArray()]);
    const blocoPorId = new Map(blocos.map((b) => [b.resumo_id, b]));
    const agora = Date.now();
    const confrontos = [];
    let primeiroDia = null;
    for (const p of progresso) {
        if (!p.palpites || p.palpites.length === 0)
            continue;
        const primeiro = p.palpites[0];
        if (!primeiro?.resposta?.trim())
            continue;
        const b = blocoPorId.get(p.resumo_id);
        if (!b)
            continue;
        if (!primeiroDia || primeiro.data < primeiroDia)
            primeiroDia = primeiro.data;
        confrontos.push({
            resumo_id: p.resumo_id,
            titulo: b.metadata.titulo,
            disciplina: b.metadata.disciplina,
            palpiteData: primeiro.data,
            palpiteTexto: primeiro.resposta.trim(),
            statusAtual: p.srs.status,
            diasDesde: diasEntre(primeiro.data, agora),
            dominadoAgora: p.srs.status === 'dominado',
        });
    }
    // viradas primeiro (mais emocionantes), depois as mais antigas
    confrontos.sort((a, b) => {
        if (a.dominadoAgora !== b.dominadoAgora)
            return a.dominadoAgora ? -1 : 1;
        return b.diasDesde - a.diasDesde;
    });
    const viradas = confrontos.filter((c) => c.dominadoAgora).length;
    const totalPalpites = confrontos.length;
    let narrativa;
    if (totalPalpites === 0) {
        narrativa = 'Ainda não há passado para revisitar. Cada palpite que você arrisca antes de revelar vira um fóssil aqui — a prova de quem você era.';
    }
    else if (viradas === 0) {
        narrativa = `Você arriscou ${totalPalpites} ${totalPalpites === 1 ? 'palpite' : 'palpites'}. Nenhum virou domínio ainda — mas arriscar já é o começo. Eu guardei cada um.`;
    }
    else {
        narrativa = `${viradas} ${viradas === 1 ? 'coisa que você chutava' : 'coisas que você chutava'} hoje ${viradas === 1 ? 'é sua' : 'são suas'} por inteiro. Olhe o que o seu eu-de-antes não sabia — e veja o quanto você andou.`;
    }
    return { confrontos, primeiroDia, totalPalpites, viradas, narrativa };
}
