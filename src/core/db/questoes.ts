import { db, getMeta, setMeta } from './database'
import type { ItemQuestao } from '@core/types/questoes'

// Carrega o banco de Questões (MCQ + flashcards) dos assets estáticos para o
// IndexedDB. É CONTEÚDO regenerável — nunca toca `progressoQuestao`. Só recarrega
// quando a versão do banco muda (evita I/O a cada boot).

interface ArquivoBanco {
  versao: number | string // hash de conteúdo (string) ou inteiro legado
  gerado_em: string
  questoes: ItemQuestao[]
}

async function baixar(caminho: string): Promise<ArquivoBanco | null> {
  try {
    const resp = await fetch(caminho)
    if (!resp.ok) return null
    return (await resp.json()) as ArquivoBanco
  } catch {
    return null
  }
}

export async function carregarBancoQuestoes(): Promise<{ total: number; recarregado: boolean }> {
  const [mcq, fc, fcAnima] = await Promise.all([
    baixar('/questoes/mcq.json'),
    baixar('/questoes/flashcards.json'),
    baixar('/questoes/flashcards-anima.json'),
  ])
  const arquivos = [mcq, fc, fcAnima].filter(Boolean) as ArquivoBanco[]
  if (arquivos.length === 0) {
    const total = await db.questoes.count()
    return { total, recarregado: false }
  }

  // assinatura combinada das versões (hash de conteúdo) — recarrega quando muda
  const versaoBanco = arquivos.map((a) => String(a.versao ?? '')).join('|')
  const versaoLocal = (await getMeta<string>('questoes_versao')) ?? ''
  const jaTem = await db.questoes.count()

  if (versaoLocal === versaoBanco && jaTem > 0) {
    return { total: jaTem, recarregado: false }
  }

  const todas = arquivos.flatMap((a) => a.questoes ?? [])
  // reconcilia: grava o banco novo e REMOVE ids que saíram (ex.: um id mudou de
  // slug), senão sobram órfãos. Só mexe na tabela `questoes` (conteúdo) —
  // NUNCA toca progressoQuestao (desempenho do aluno é sagrado).
  const idsNovos = new Set(todas.map((q) => q.id))
  const idsExistentes = (await db.questoes.toCollection().primaryKeys()) as string[]
  const removidos = idsExistentes.filter((id) => !idsNovos.has(id))
  await db.questoes.bulkPut(todas)
  if (removidos.length) await db.questoes.bulkDelete(removidos)
  await setMeta('questoes_versao', versaoBanco)
  return { total: todas.length, recarregado: true }
}
