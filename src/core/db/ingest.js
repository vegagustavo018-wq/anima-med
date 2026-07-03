import { db, setMeta, getMeta, registrarEvento } from './database';
import { invalidarBusca } from '@core/anima/busca';
/**
 * Guarda de forma: impede que JSON malformado entre no IndexedDB e só quebre
 * depois dentro de um componente (o "erro de 30/06 em escala"). Validação leve
 * — o esquema completo é checado no Studio.
 */
function blocoTemFormaValida(b) {
    if (!b || typeof b !== 'object')
        return false;
    const o = b;
    return (typeof o.resumo_id === 'string' &&
        o.resumo_id.length > 0 &&
        !!o.metadata &&
        typeof o.metadata === 'object' &&
        Array.isArray(o.narrativa));
}
/**
 * Ingestão sob demanda: busca o manifesto (pequeno), compara hashes com o que
 * já foi ingerido, e SÓ baixa os blocos novos/alterados. Escala para milhares
 * de blocos — o boot típico só busca o manifesto e não faz nada.
 * NUNCA toca na tabela `progresso`.
 */
export async function ingerirBlocos() {
    const rel = {
        criados: 0,
        atualizados: 0,
        inalterados: 0,
        removidos: 0,
        erros: [],
        total: 0,
    };
    let manifesto;
    try {
        // Sem cache-buster: o service worker (StaleWhileRevalidate) serve offline e
        // revalida em background. O ganho de escala vem daqui + do bulk abaixo.
        const resp = await fetch('/blocos/manifesto.json');
        if (!resp.ok)
            throw new Error(`HTTP ${resp.status}`);
        manifesto = await resp.json();
    }
    catch (e) {
        rel.erros.push({ id: 'manifesto', erro: `não foi possível carregar: ${e}` });
        return rel;
    }
    rel.total = manifesto.blocos.length;
    const local = (await getMeta('manifesto_ingestao')) ?? {};
    const novoLocal = { ...local };
    const idsManifesto = new Set(manifesto.blocos.map((b) => b.id));
    // UMA leitura de chaves em vez de milhares de get() sequenciais (boot rápido)
    const idsExistentes = new Set((await db.blocos.toCollection().primaryKeys()));
    // delta: novo ou hash mudou. Inalterados não fazem I/O nenhum.
    const paraBaixar = manifesto.blocos.filter((e) => !(local[e.id] === e.hash && idsExistentes.has(e.id)));
    rel.inalterados = manifesto.blocos.length - paraBaixar.length;
    // baixa em lotes paralelos, valida a forma, e grava tudo num único bulkPut
    const novos = [];
    const CONCORRENCIA = 12;
    for (let i = 0; i < paraBaixar.length; i += CONCORRENCIA) {
        const lote = paraBaixar.slice(i, i + CONCORRENCIA);
        const resultados = await Promise.all(lote.map(async (entrada) => {
            try {
                const resp = await fetch(entrada.arquivo);
                if (!resp.ok)
                    throw new Error(`HTTP ${resp.status}`);
                const bloco = (await resp.json());
                if (!blocoTemFormaValida(bloco))
                    throw new Error('bloco com forma inválida');
                bloco.content_hash = entrada.hash;
                return { entrada, bloco };
            }
            catch (e) {
                rel.erros.push({ id: entrada.id, erro: String(e) });
                novoLocal[entrada.id] = local[entrada.id] ?? '';
                return null;
            }
        }));
        for (const r of resultados) {
            if (!r)
                continue;
            novos.push(r.bloco);
            novoLocal[r.entrada.id] = r.entrada.hash;
            if (idsExistentes.has(r.entrada.id))
                rel.atualizados++;
            else
                rel.criados++;
        }
    }
    if (novos.length)
        await db.blocos.bulkPut(novos);
    // remove blocos que saíram do manifesto (progresso preservado)
    const removidos = [...idsExistentes].filter((id) => !idsManifesto.has(id));
    if (removidos.length) {
        await db.blocos.bulkDelete(removidos);
        rel.removidos = removidos.length;
        for (const id of removidos)
            delete novoLocal[id];
    }
    await setMeta('manifesto_ingestao', novoLocal);
    await setMeta('ultima_ingestao', new Date().toISOString());
    await registrarEvento('ingestao', rel);
    // o acervo mudou → invalida o índice de busca em memória para reconstruir
    if (novos.length || removidos.length)
        invalidarBusca();
    return rel;
}
