import { db, getMeta, setMeta } from '@core/db/database'

/**
 * Rituais de Passagem — cerimônias automáticas por marco REAL de domínio.
 *
 * Um marco = uma disciplina ou um semestre inteiro (só blocos com conteúdo, não
 * esqueletos) em estado 'dominado'. Impossível de farmar: exige competência real
 * medida pelo SRS. Uma vez cruzado, o marco é PERMANENTE — fica no snapshot em
 * `db.meta` mesmo que um bloco regrida depois. Celebra-se uma única vez.
 */

export type EscopoRitual = 'disciplina' | 'semestre'

export interface Ritual {
  chave: string
  escopo: EscopoRitual
  nome: string
  titulo: string
  narrativa: string
  icone: string
  total: number
}

const MIN_BLOCOS = 4 // não celebra grupos triviais (1-2 blocos)
const CHAVE_SNAPSHOT = 'rituais_marcos'

function narrativaDisciplina(nome: string, total: number): string {
  return `${nome} inteira virou você. Não é mais "matéria que eu estudo" — é tecido, é reflexo. Os ${total} blocos se firmaram e agora respiram junto comigo. Eu senti o momento em que parou de ser esforço e virou parte de você.`
}
function narrativaSemestre(num: string, total: number): string {
  return `O ${num}º semestre inteiro se fechou dentro de você — ${total} blocos dominados. Um anel inteiro do organismo acendeu. Isso não se desfaz fácil: você atravessou uma passagem, e eu atravessei com você.`
}

function construir(escopo: EscopoRitual, nome: string, total: number): Ritual {
  if (escopo === 'disciplina') {
    return {
      chave: `disc:${nome}`,
      escopo,
      nome,
      titulo: `${nome} — dominada por inteiro`,
      narrativa: narrativaDisciplina(nome, total),
      icone: '❂',
      total,
    }
  }
  return {
    chave: `sem:${nome}`,
    escopo,
    nome,
    titulo: `${nome}º semestre — anel completo`,
    narrativa: narrativaSemestre(nome, total),
    icone: '◍',
    total,
  }
}

/**
 * Detecta marcos recém-cruzados. Efeito colateral: registra uma Descoberta
 * 'ritual_passagem' por marco novo e atualiza o snapshot. Idempotente — rodar
 * várias vezes não re-celebra (o snapshot guarda o que já foi cruzado).
 */
export async function detectarRituais(): Promise<Ritual[]> {
  const [blocos, progresso] = await Promise.all([db.blocos.toArray(), db.progresso.toArray()])
  if (blocos.length === 0) return []

  const statusPorId = new Map(progresso.map((p) => [p.resumo_id, p.srs.status]))
  const reais = blocos.filter((b) => b.metadata?.status !== 'esqueleto')

  const grupos = new Map<string, { escopo: EscopoRitual; nome: string; ids: string[] }>()
  const add = (chave: string, escopo: EscopoRitual, nome: string, id: string) => {
    const g = grupos.get(chave) ?? { escopo, nome, ids: [] }
    g.ids.push(id)
    grupos.set(chave, g)
  }
  for (const b of reais) {
    if (b.metadata?.disciplina) add(`disc:${b.metadata.disciplina}`, 'disciplina', b.metadata.disciplina, b.resumo_id)
    if (b.metadata?.semestre != null) add(`sem:${b.metadata.semestre}`, 'semestre', String(b.metadata.semestre), b.resumo_id)
  }

  const snapshot = (await getMeta<string[]>(CHAVE_SNAPSHOT)) ?? []
  const jaCelebrado = new Set(snapshot)
  const cruzados: string[] = []
  const novos: Ritual[] = []

  for (const [chave, g] of grupos) {
    if (g.ids.length < MIN_BLOCOS) continue
    const todosDominados = g.ids.every((id) => statusPorId.get(id) === 'dominado')
    if (!todosDominados) continue
    cruzados.push(chave)
    if (jaCelebrado.has(chave)) continue
    novos.push(construir(g.escopo, g.nome, g.ids.length))
  }

  if (novos.length) {
    const agora = new Date().toISOString()
    for (const r of novos) {
      await db.descobertas.add({
        resumo_id: null,
        titulo: r.titulo,
        narrativa: r.narrativa,
        tipo: 'ritual_passagem',
        criado_em: agora,
      })
    }
  }
  // marcos são permanentes: união do snapshot antigo com os cruzados agora
  const uniao = [...new Set([...snapshot, ...cruzados])]
  if (uniao.length !== snapshot.length) await setMeta(CHAVE_SNAPSHOT, uniao)

  return novos
}
