import { db } from '@core/db/database';
/**
 * Diário de Erros Diagnósticos (bloco 11) — detecta PADRÕES nos erros, não um
 * placar. 100% local. "Toda vez que envolve X você tropeça" é mais útil que
 * "você errou 12 questões".
 */
export async function diagnosticarErros() {
    const progresso = await db.progresso.toArray();
    const blocos = await db.blocos.toArray();
    const blocoPorId = new Map(blocos.map((b) => [b.resumo_id, b]));
    const erros = [];
    for (const p of progresso) {
        const bloco = blocoPorId.get(p.resumo_id);
        if (!bloco)
            continue;
        for (const h of p.historico_revisoes) {
            if (h.qualidade >= 3)
                continue;
            let tipoCard = null;
            if (h.alvo !== 'bloco') {
                const fc = bloco.flashcards.find((f) => f.card_id === h.alvo);
                tipoCard = fc?.tipo ?? null;
            }
            erros.push({
                data: h.data,
                resumo_id: p.resumo_id,
                titulo: bloco.metadata.titulo,
                disciplina: bloco.metadata.disciplina,
                tipoCard,
            });
        }
    }
    const totalErros = erros.length;
    const contarPor = (fn) => {
        const mapa = new Map();
        for (const e of erros) {
            const chave = fn(e);
            if (!chave)
                continue;
            mapa.set(chave, (mapa.get(chave) ?? 0) + 1);
        }
        return [...mapa.entries()]
            .map(([chave, contagem]) => ({
            chave,
            rotulo: chave,
            contagem,
            percentual: totalErros ? Math.round((contagem / totalErros) * 100) : 0,
        }))
            .sort((a, b) => b.contagem - a.contagem);
    };
    const porDisciplina = contarPor((e) => e.disciplina);
    const porTipoCard = contarPor((e) => e.tipoCard);
    let fraseDiagnostico = null;
    if (porDisciplina.length && porDisciplina[0].percentual >= 30) {
        const top = porDisciplina[0];
        const topTipo = porTipoCard[0];
        fraseDiagnostico = topTipo
            ? `${top.percentual}% dos seus erros são em ${top.rotulo} — e frequentemente do tipo "${topTipo.rotulo.replace(/_/g, ' ')}". Vale revisitar a base, não só repetir o card.`
            : `${top.percentual}% dos seus erros se concentram em ${top.rotulo}. Há um padrão aí.`;
    }
    return {
        totalErros,
        porDisciplina: porDisciplina.slice(0, 6),
        porTipoCard: porTipoCard.slice(0, 6),
        recentes: erros
            .sort((a, b) => b.data.localeCompare(a.data))
            .slice(0, 10),
        fraseDiagnostico,
    };
}
