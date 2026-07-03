import { db } from '@core/db/database';
const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export { DIAS };
/**
 * Ritmo circadiano do estudo — heatmap hora×dia de quanto se estuda E quanto
 * se acerta (nem sempre coincide). Bloco 11.
 */
export async function calcularCircadiano() {
    const progresso = await db.progresso.toArray();
    const grade = new Map();
    for (const p of progresso) {
        for (const h of p.historico_revisoes) {
            const d = new Date(h.data);
            const chave = `${d.getDay()}-${d.getHours()}`;
            const cel = grade.get(chave) ?? { diaSemana: d.getDay(), hora: d.getHours(), contagem: 0, acertos: 0 };
            cel.contagem++;
            if (h.qualidade >= 3)
                cel.acertos++;
            grade.set(chave, cel);
        }
    }
    return [...grade.values()];
}
export function melhorFaixa(celulas) {
    const comDados = celulas.filter((c) => c.contagem >= 2);
    if (!comDados.length)
        return null;
    const melhor = comDados.reduce((a, b) => {
        const taxaA = a.acertos / a.contagem;
        const taxaB = b.acertos / b.contagem;
        return taxaB > taxaA ? b : a;
    });
    const taxa = Math.round((melhor.acertos / melhor.contagem) * 100);
    return `${DIAS[melhor.diaSemana]} por volta das ${melhor.hora}h rende ${taxa}% de acerto — sua melhor faixa conhecida.`;
}
