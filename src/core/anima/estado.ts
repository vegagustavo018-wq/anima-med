import { db } from '@core/db/database'
import { estaVencido, ehLeech } from '@core/srs/sm2'

export interface EstadoOrganismo {
  totalBlocos: number
  blocosIniciados: number
  blocosDominados: number
  cardsVencidos: number
  diasDesdeUltima: number | null
  percentualDominio: number // % de blocos com status revisando/dominado
}

export async function calcularEstado(): Promise<EstadoOrganismo> {
  const totalBlocos = await db.blocos.count()
  const progresso = await db.progresso.toArray()
  const agora = new Date()

  const iniciados = progresso.filter((p) => p.vezes_lido > 0)
  const dominados = progresso.filter(
    (p) => p.srs.status === 'dominado' || p.srs.status === 'revisando'
  )
  const vencidos = iniciados.filter((p) => estaVencido(p.srs, agora))

  let diasDesdeUltima: number | null = null
  const leituras = progresso
    .map((p) => p.ultima_leitura)
    .filter((d): d is string => !!d)
    .map((d) => new Date(d).getTime())
  if (leituras.length) {
    const ultima = Math.max(...leituras)
    diasDesdeUltima = Math.floor((agora.getTime() - ultima) / 86_400_000)
  }

  return {
    totalBlocos,
    blocosIniciados: iniciados.length,
    blocosDominados: dominados.length,
    cardsVencidos: vencidos.length,
    diasDesdeUltima,
    percentualDominio: totalBlocos ? Math.round((dominados.length / totalBlocos) * 100) : 0,
  }
}

/** Reaproveita ehLeech (@core/srs/sm2) — mesma regra usada em LeechWardPage. */
export async function contarLeeches(): Promise<number> {
  const progresso = await db.progresso.toArray()
  return progresso.filter((p) => ehLeech(p.srs)).length
}

export interface ProgressoSemestre {
  totalBlocos: number
  blocosDominados: number
  percentualDominio: number
}

/**
 * Mesma lógica de `calcularEstado()`, escopada a um semestre — reaproveitada
 * pelos cards de semestre em ExplorarPage (mini barra de progresso real).
 */
export async function calcularProgressoSemestre(numero: number): Promise<ProgressoSemestre> {
  const blocos = await db.blocos.where('metadata.semestre').equals(numero).toArray()
  if (blocos.length === 0) return { totalBlocos: 0, blocosDominados: 0, percentualDominio: 0 }

  const ids = blocos.map((b) => b.resumo_id)
  const progresso = await db.progresso.bulkGet(ids)
  const dominados = progresso.filter(
    (p) => p && (p.srs.status === 'dominado' || p.srs.status === 'revisando')
  ).length

  return {
    totalBlocos: blocos.length,
    blocosDominados: dominados,
    percentualDominio: Math.round((dominados / blocos.length) * 100),
  }
}
