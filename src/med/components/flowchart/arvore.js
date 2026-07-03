/**
 * Monta a floresta de árvores a partir dos ponteiros no_pai_id.
 * Robusto a lacunas: raízes são blocos cujo pai não existe no conjunto.
 * Nós filhos declarados que não existem viram nós-fantasma (preview null).
 */
export function montarArvore(previews) {
    const porId = new Map();
    for (const p of previews)
        porId.set(p.resumo_id, p);
    const filhosDe = new Map();
    const temPai = new Set();
    for (const p of previews) {
        const pai = p.no_pai_id;
        if (pai && porId.has(pai)) {
            if (!filhosDe.has(pai))
                filhosDe.set(pai, []);
            filhosDe.get(pai).push(p.resumo_id);
            temPai.add(p.resumo_id);
        }
    }
    // raízes = blocos sem pai válido no conjunto
    const raizes = previews
        .filter((p) => !temPai.has(p.resumo_id))
        .map((p) => p.resumo_id)
        .sort();
    function construir(id, prof) {
        const preview = porId.get(id) ?? null;
        const filhosIds = (filhosDe.get(id) ?? []).sort();
        return {
            id,
            preview,
            titulo: preview?.metadata.titulo ?? id,
            filhos: filhosIds.map((f) => construir(f, prof + 1)),
            profundidade: prof,
            x: 0,
            y: 0,
        };
    }
    return raizes.map((r) => construir(r, 0));
}
/**
 * Layout tidy-tree simples: folhas recebem x sequencial; pais centram sobre os filhos.
 * y = profundidade. Suporta floresta (várias raízes lado a lado).
 */
export function calcularLayout(raizes, cfg) {
    let cursorFolha = 0;
    let maxProf = 0;
    function posicionar(no) {
        maxProf = Math.max(maxProf, no.profundidade);
        no.y = no.profundidade * (cfg.alturaNo + cfg.gapY);
        if (no.filhos.length === 0) {
            no.x = cursorFolha * (cfg.larguraNo + cfg.gapX);
            cursorFolha++;
        }
        else {
            for (const f of no.filhos)
                posicionar(f);
            const primeiro = no.filhos[0];
            const ultimo = no.filhos[no.filhos.length - 1];
            no.x = (primeiro.x + ultimo.x) / 2;
        }
    }
    for (const r of raizes) {
        posicionar(r);
        cursorFolha += 1; // separação entre árvores da floresta
    }
    // achatar para medir extents
    const todos = [];
    function coletar(no) {
        todos.push(no);
        no.filhos.forEach(coletar);
    }
    raizes.forEach(coletar);
    const maxX = Math.max(0, ...todos.map((n) => n.x)) + cfg.larguraNo;
    const altura = (maxProf + 1) * cfg.alturaNo + maxProf * cfg.gapY;
    return { nos: todos, largura: maxX, altura };
}
/** Achata a floresta numa lista de nós (para iterar). */
export function achatar(raizes) {
    const out = [];
    function rec(n) {
        out.push(n);
        n.filhos.forEach(rec);
    }
    raizes.forEach(rec);
    return out;
}
