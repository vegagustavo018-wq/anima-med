import { db, getMeta, setMeta } from './database';
async function baixar(caminho) {
    try {
        const resp = await fetch(caminho);
        if (!resp.ok)
            return null;
        return (await resp.json());
    }
    catch {
        return null;
    }
}
export async function carregarBancoQuestoes() {
    const [mcq, fc] = await Promise.all([
        baixar('/questoes/mcq.json'),
        baixar('/questoes/flashcards.json'),
    ]);
    const arquivos = [mcq, fc].filter(Boolean);
    if (arquivos.length === 0) {
        const total = await db.questoes.count();
        return { total, recarregado: false };
    }
    // assinatura combinada das versões (hash de conteúdo) — recarrega quando muda
    const versaoBanco = arquivos.map((a) => String(a.versao ?? '')).join('|');
    const versaoLocal = (await getMeta('questoes_versao')) ?? '';
    const jaTem = await db.questoes.count();
    if (versaoLocal === versaoBanco && jaTem > 0) {
        return { total: jaTem, recarregado: false };
    }
    const todas = arquivos.flatMap((a) => a.questoes ?? []);
    // reconcilia: grava o banco novo e REMOVE ids que saíram (ex.: um id mudou de
    // slug), senão sobram órfãos. Só mexe na tabela `questoes` (conteúdo) —
    // NUNCA toca progressoQuestao (desempenho do aluno é sagrado).
    const idsNovos = new Set(todas.map((q) => q.id));
    const idsExistentes = (await db.questoes.toCollection().primaryKeys());
    const removidos = idsExistentes.filter((id) => !idsNovos.has(id));
    await db.questoes.bulkPut(todas);
    if (removidos.length)
        await db.questoes.bulkDelete(removidos);
    await setMeta('questoes_versao', versaoBanco);
    return { total: todas.length, recarregado: true };
}
