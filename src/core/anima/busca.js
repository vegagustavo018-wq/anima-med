import { db } from '@core/db/database';
let corpus = null;
let contagemIndexada = -1;
let construindo = null;
function toPreview(b) {
    return {
        resumo_id: b.resumo_id,
        no_pai_id: b.no_pai_id,
        resumo_conciso: b.resumo_conciso,
        metadata: b.metadata,
    };
}
async function obterCorpus() {
    const total = await db.blocos.count();
    if (corpus && total === contagemIndexada)
        return corpus;
    if (construindo)
        return construindo;
    construindo = (async () => {
        const todos = await db.blocos.toArray();
        const docs = todos.map((b) => {
            const titulo = b.metadata.titulo.toLowerCase();
            return {
                preview: toPreview(b),
                titulo,
                alvo: `${titulo}\n${b.resumo_conciso.toLowerCase()}\n${b.metadata.tags.join(' ').toLowerCase()}`,
            };
        });
        corpus = docs;
        contagemIndexada = total;
        construindo = null;
        return docs;
    })();
    return construindo;
}
/**
 * Busca multi-termo com ranqueamento. Cada termo precisa aparecer (AND);
 * acerto no título pontua mais que no corpo, e prefixo de palavra pontua
 * mais que acerto no meio — ordena por relevância antes de cortar em `limite`.
 */
export async function buscarBlocos(termo, limite = 40) {
    const t = termo.trim().toLowerCase();
    if (!t)
        return [];
    const termos = t.split(/\s+/).filter(Boolean);
    const docs = await obterCorpus();
    const pontuados = [];
    for (const d of docs) {
        let score = 0;
        let combina = true;
        for (const q of termos) {
            const noTitulo = d.titulo.indexOf(q);
            if (noTitulo !== -1) {
                // fronteira de palavra no título vale mais que acerto no meio
                score += noTitulo === 0 || d.titulo[noTitulo - 1] === ' ' ? 6 : 4;
                continue;
            }
            const noCorpo = d.alvo.indexOf(q);
            if (noCorpo === -1) {
                combina = false;
                break;
            }
            score += 1;
        }
        if (combina)
            pontuados.push({ preview: d.preview, score });
    }
    pontuados.sort((a, b) => b.score - a.score);
    return pontuados.slice(0, limite).map((x) => x.preview);
}
/** Invalida o índice — chamar após ingestão que altere o acervo. */
export function invalidarBusca() {
    corpus = null;
    contagemIndexada = -1;
    construindo = null;
}
