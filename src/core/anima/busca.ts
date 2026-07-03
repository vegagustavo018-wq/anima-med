import { db } from '@core/db/database'
import type { BlocoConteudo, BlocoPreview } from '@core/types/schema'

/**
 * Índice de busca enxuto e em memória.
 *
 * Antes: `buscar()` fazia `db.blocos.toArray()` — lendo os ~8.6 mil blocos
 * INTEIROS (com todas as narrativas) do IndexedDB a CADA tecla. Congelava.
 *
 * Agora: na primeira busca projetamos os blocos para documentos minúsculos
 * (só título + resumo + tags, já em minúsculas) e guardamos em módulo. As
 * buscas seguintes são varredura em memória sobre strings curtas — sub-5 ms,
 * sem tocar o IndexedDB. O índice se reconstrói sozinho quando a contagem de
 * blocos muda (nova ingestão de conteúdo).
 */

interface DocBusca {
  preview: BlocoPreview
  titulo: string // minúsculo, para boost de relevância
  alvo: string // titulo + resumo + tags, tudo minúsculo e concatenado
}

let corpus: DocBusca[] | null = null
let contagemIndexada = -1
let construindo: Promise<DocBusca[]> | null = null

function toPreview(b: BlocoConteudo): BlocoPreview {
  return {
    resumo_id: b.resumo_id,
    no_pai_id: b.no_pai_id,
    resumo_conciso: b.resumo_conciso,
    metadata: b.metadata,
  }
}

async function obterCorpus(): Promise<DocBusca[]> {
  const total = await db.blocos.count()
  if (corpus && total === contagemIndexada) return corpus
  if (construindo) return construindo
  construindo = (async () => {
    const todos = await db.blocos.toArray()
    const docs: DocBusca[] = todos.map((b) => {
      const titulo = b.metadata.titulo.toLowerCase()
      return {
        preview: toPreview(b),
        titulo,
        alvo: `${titulo}\n${b.resumo_conciso.toLowerCase()}\n${b.metadata.tags.join(' ').toLowerCase()}`,
      }
    })
    corpus = docs
    contagemIndexada = total
    construindo = null
    return docs
  })()
  return construindo
}

/**
 * Busca multi-termo com ranqueamento. Cada termo precisa aparecer (AND);
 * acerto no título pontua mais que no corpo, e prefixo de palavra pontua
 * mais que acerto no meio — ordena por relevância antes de cortar em `limite`.
 */
export async function buscarBlocos(termo: string, limite = 40): Promise<BlocoPreview[]> {
  const t = termo.trim().toLowerCase()
  if (!t) return []
  const termos = t.split(/\s+/).filter(Boolean)
  const docs = await obterCorpus()

  const pontuados: { preview: BlocoPreview; score: number }[] = []
  for (const d of docs) {
    let score = 0
    let combina = true
    for (const q of termos) {
      const noTitulo = d.titulo.indexOf(q)
      if (noTitulo !== -1) {
        // fronteira de palavra no título vale mais que acerto no meio
        score += noTitulo === 0 || d.titulo[noTitulo - 1] === ' ' ? 6 : 4
        continue
      }
      const noCorpo = d.alvo.indexOf(q)
      if (noCorpo === -1) {
        combina = false
        break
      }
      score += 1
    }
    if (combina) pontuados.push({ preview: d.preview, score })
  }

  pontuados.sort((a, b) => b.score - a.score)
  return pontuados.slice(0, limite).map((x) => x.preview)
}

/** Invalida o índice — chamar após ingestão que altere o acervo. */
export function invalidarBusca(): void {
  corpus = null
  contagemIndexada = -1
  construindo = null
}
