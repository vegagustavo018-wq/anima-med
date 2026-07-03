import { db } from '@core/db/database';
/**
 * Grafo Global de Domínio — constelação de todo o acervo. Layout radial por
 * disciplina (setores angulares), sem dependência de física externa.
 * Tamanho do nó = grau de conexão; brilho = domínio real (calculado por quem consome).
 */
export async function construirGrafoGlobal() {
    const blocos = await db.blocos.toArray();
    const progresso = await db.progresso.toArray();
    const statusPorId = new Map(progresso.map((p) => [p.resumo_id, p.srs.status]));
    const disciplinas = [...new Set(blocos.map((b) => b.metadata.disciplina))].sort();
    const setorPorDisciplina = new Map(disciplinas.map((d, i) => [d, (i / disciplinas.length) * Math.PI * 2]));
    // grau de conexão por bloco (para tamanho)
    const grauPorId = new Map();
    const inc = (id) => grauPorId.set(id, (grauPorId.get(id) ?? 0) + 1);
    // Set de ids uma vez → lookup O(1) por aresta (antes: blocos.some() = O(N²),
    // dezenas de milhões de comparações com o acervo cheio, congelava a aba).
    const existe = new Set(blocos.map((b) => b.resumo_id));
    const arestas = [];
    for (const b of blocos) {
        if (b.no_pai_id) {
            arestas.push({ de: b.no_pai_id, para: b.resumo_id, tipo: 'arvore' });
            inc(b.no_pai_id);
            inc(b.resumo_id);
        }
        for (const p of b.conexoes.prerequisitos) {
            if (existe.has(p.bloco_id)) {
                arestas.push({ de: p.bloco_id, para: b.resumo_id, tipo: 'prerequisito' });
                inc(p.bloco_id);
                inc(b.resumo_id);
            }
        }
        for (const l of b.conexoes.laterais) {
            if (existe.has(l.bloco_id)) {
                arestas.push({ de: b.resumo_id, para: l.bloco_id, tipo: 'lateral' });
                inc(l.bloco_id);
                inc(b.resumo_id);
            }
        }
    }
    // posiciona nós dentro do setor angular da disciplina, raio variando por índice
    const porDisciplina = new Map();
    for (const b of blocos) {
        const arr = porDisciplina.get(b.metadata.disciplina) ?? [];
        arr.push(b);
        porDisciplina.set(b.metadata.disciplina, arr);
    }
    const nos = [];
    const R = 220;
    for (const [disc, lista] of porDisciplina) {
        const setorCentro = setorPorDisciplina.get(disc) ?? 0;
        const larguraSetor = (Math.PI * 2) / disciplinas.length;
        lista.forEach((b, i) => {
            const frac = lista.length > 1 ? i / (lista.length - 1) : 0.5;
            const angulo = setorCentro - larguraSetor / 2 + frac * larguraSetor;
            const raio = 70 + ((b.metadata.profundidade_arvore ?? 1) / 5) * R;
            nos.push({
                id: b.resumo_id,
                titulo: b.metadata.titulo,
                disciplina: disc,
                x: Math.cos(angulo) * raio,
                y: Math.sin(angulo) * raio,
                status: statusPorId.get(b.resumo_id) ?? 'novo',
                grau: grauPorId.get(b.resumo_id) ?? 0,
            });
        });
    }
    return { nos, arestas, disciplinas };
}
