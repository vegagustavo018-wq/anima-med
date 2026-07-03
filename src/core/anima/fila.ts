import { db } from '@core/db/database'
import { estaVencido, ehLeech } from '@core/srs/sm2'

/**
 * Fila de estudo unificada e priorizada. Antes a fila era montada inline no
 * EstudarPage com um filtro simples (vencido || marcado), sem ordem de
 * prioridade e ignorando leeches/cards. Aqui ela vira um módulo único e
 * ordenado, e ganha um resumo cross-vertical (blocos + cards + questões) para
 * a Home mostrar "o que o organismo pede hoje".
 */

export type MotivoFila = 'vencido' | 'marcado' | 'leech'

export interface ItemFila {
  resumo_id: string
  prioridade: number
  motivo: MotivoFila
  diasAtraso: number
  lapsos: number
}

function diasDesde(iso: string | null, agora: number): number {
  if (!iso) return 0
  return Math.max(0, (agora - new Date(iso).getTime()) / 86_400_000)
}

/**
 * Monta a fila de blocos a revisar, ordenada por prioridade:
 * atraso (dias vencidos) + peso de leech + peso de marcado manual.
 */
export async function montarFilaEstudo(teto = 9999): Promise<ItemFila[]> {
  const agora = Date.now()
  const progresso = await db.progresso.toArray()
  const itens: ItemFila[] = []

  for (const p of progresso) {
    if (p.vezes_lido === 0 && !p.marcado_para_revisao) continue
    const vencido = p.vezes_lido > 0 && estaVencido(p.srs)
    const leech = ehLeech(p.srs)
    if (!vencido && !p.marcado_para_revisao) continue

    const diasAtraso = diasDesde(p.srs.proxima_revisao, agora)
    const motivo: MotivoFila = leech ? 'leech' : p.marcado_para_revisao && !vencido ? 'marcado' : 'vencido'
    // prioridade: atraso pesa, leech e marcado ganham empurrão
    const prioridade =
      diasAtraso * 2 + (leech ? 30 : 0) + (p.marcado_para_revisao ? 12 : 0) + p.srs.lapsos * 4

    itens.push({ resumo_id: p.resumo_id, prioridade, motivo, diasAtraso, lapsos: p.srs.lapsos })
  }

  itens.sort((a, b) => b.prioridade - a.prioridade)
  return itens.slice(0, teto)
}

export interface ResumoPendencias {
  blocos: number
  cards: number
  questoes: number
  total: number
}

/**
 * Conta o que está pedindo revisão hoje, através das verticais — para um
 * indicador reativo na Home. Leve: só varre tabelas de progresso (sagradas).
 */
export async function resumoPendencias(): Promise<ResumoPendencias> {
  const [progresso, progQuestoes] = await Promise.all([
    db.progresso.toArray(),
    db.progressoQuestao.toArray(),
  ])

  let blocos = 0
  let cards = 0
  for (const p of progresso) {
    if ((p.vezes_lido > 0 && estaVencido(p.srs)) || p.marcado_para_revisao) blocos++
    for (const card_id of Object.keys(p.srs_cards)) {
      if (estaVencido(p.srs_cards[card_id])) cards++
    }
  }
  const questoes = progQuestoes.filter((p) => p.tentativas > 0 && estaVencido(p.srs)).length

  return { blocos, cards, questoes, total: blocos + cards + questoes }
}
