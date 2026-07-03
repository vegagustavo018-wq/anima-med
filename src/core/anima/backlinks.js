import { db } from '@core/db/database';
/**
 * Backlinks bidirecionais (bloco 3) — "quem chega até aqui". Como as
 * conexões futuras/laterais/prerequisitos são declaradas de um lado só no
 * schema, o alvo precisa DESCOBRIR sozinho quem o cita (linked references).
 */
export async function backlinksDe(resumo_id) {
    const blocos = await db.blocos.toArray();
    const alvo = blocos.find((b) => b.resumo_id === resumo_id);
    const out = [];
    for (const b of blocos) {
        if (b.resumo_id === resumo_id)
            continue;
        if (b.conexoes.prerequisitos.some((p) => p.bloco_id === resumo_id)) {
            out.push({ resumo_id: b.resumo_id, titulo: b.metadata.titulo, tipo: 'prerequisito' });
        }
        if (b.conexoes.laterais.some((l) => l.bloco_id === resumo_id)) {
            out.push({ resumo_id: b.resumo_id, titulo: b.metadata.titulo, tipo: 'lateral' });
        }
        if (b.conexoes.futuras.some((f) => f.bloco_id_destino === resumo_id)) {
            out.push({ resumo_id: b.resumo_id, titulo: b.metadata.titulo, tipo: 'futura' });
        }
    }
    if (alvo?.no_pai_id) {
        const pai = blocos.find((b) => b.resumo_id === alvo.no_pai_id);
        if (pai)
            out.push({ resumo_id: pai.resumo_id, titulo: pai.metadata.titulo, tipo: 'pai' });
    }
    for (const filhoId of alvo?.nos_filhos_ids ?? []) {
        const filho = blocos.find((b) => b.resumo_id === filhoId);
        if (filho)
            out.push({ resumo_id: filho.resumo_id, titulo: filho.metadata.titulo, tipo: 'filho' });
    }
    return out;
}
