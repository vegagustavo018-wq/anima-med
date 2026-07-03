import { db } from '@core/db/database'
import { estaVencido } from '@core/srs/sm2'

export interface MetricasDisciplina {
  disciplina: string
  total: number
  iniciados: number
  dominados: number
  percentual: number
}

export interface MetricasGerais {
  totalBlocos: number
  iniciados: number
  dominados: number
  vencidos: number
  percentualDominio: number
  streak: number
  sessoesSemana: number
  calibracao: number | null // % de acerto quando confiança alta (calibração metacognitiva)
  porDisciplina: MetricasDisciplina[]
}

export async function calcularMetricas(): Promise<MetricasGerais> {
  const blocos = await db.blocos.toArray()
  const progresso = await db.progresso.toArray()
  const eventos = await db.eventos.toArray()
  const agora = new Date()
  const progById = new Map(progresso.map((p) => [p.resumo_id, p]))

  const dominadoStatus = (s: string) => s === 'dominado' || s === 'revisando'

  // por disciplina
  const discMap = new Map<string, MetricasDisciplina>()
  for (const b of blocos) {
    const d = b.metadata.disciplina
    if (!discMap.has(d)) discMap.set(d, { disciplina: d, total: 0, iniciados: 0, dominados: 0, percentual: 0 })
    const m = discMap.get(d)!
    m.total++
    const p = progById.get(b.resumo_id)
    if (p && p.vezes_lido > 0) m.iniciados++
    if (p && dominadoStatus(p.srs.status)) m.dominados++
  }
  for (const m of discMap.values()) m.percentual = m.total ? Math.round((m.dominados / m.total) * 100) : 0

  const iniciados = progresso.filter((p) => p.vezes_lido > 0)
  const dominados = progresso.filter((p) => dominadoStatus(p.srs.status))
  const vencidos = iniciados.filter((p) => estaVencido(p.srs, agora))

  // streak: dias consecutivos com atividade (eventos de revisão/leitura)
  const diasComAtividade = new Set(
    eventos
      .filter((e) => e.tipo === 'boot' || e.tipo === 'palpite' || e.tipo === 'ingestao' || e.tipo === 'duvida_capturada')
      .map((e) => e.criado_em.slice(0, 10))
  )
  // usa leituras de progresso também
  for (const p of progresso) if (p.ultima_leitura) diasComAtividade.add(p.ultima_leitura.slice(0, 10))
  let streak = 0
  const d = new Date(agora)
  for (;;) {
    const iso = d.toISOString().slice(0, 10)
    if (diasComAtividade.has(iso)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else if (iso === agora.toISOString().slice(0, 10)) {
      // hoje sem atividade ainda não zera; olha ontem
      d.setDate(d.getDate() - 1)
    } else break
    if (streak > 400) break
  }

  // sessões na última semana
  const seteDias = new Date(agora.getTime() - 7 * 86_400_000).toISOString()
  const sessoesSemana = new Set(
    progresso.flatMap((p) => p.calibracao.filter((c) => c.data >= seteDias).map((c) => c.data.slice(0, 13)))
  ).size

  // calibração: quando confiança alta (3-4) e acertou
  let altaConf = 0
  let altaConfAcerto = 0
  for (const p of progresso) {
    for (const c of p.calibracao) {
      if (c.confianca >= 3) {
        altaConf++
        if (c.acertou) altaConfAcerto++
      }
    }
  }
  const calibracao = altaConf > 0 ? Math.round((altaConfAcerto / altaConf) * 100) : null

  return {
    totalBlocos: blocos.length,
    iniciados: iniciados.length,
    dominados: dominados.length,
    vencidos: vencidos.length,
    percentualDominio: blocos.length ? Math.round((dominados.length / blocos.length) * 100) : 0,
    streak,
    sessoesSemana,
    calibracao,
    porDisciplina: [...discMap.values()].sort((a, b) => b.total - a.total),
  }
}
