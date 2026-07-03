import { db } from '@core/db/database'

export interface Retrospectiva {
  periodo: 'semana' | 'mes'
  totalRevisoes: number
  conceitoTeimoso: { titulo: string; lapsos: number } | null
  maiorSalto: { titulo: string; delta: number } | null
  horaPico: number | null
  dominiosFirmados: number
  narrativa: string
}

export async function gerarRetrospectiva(periodo: 'semana' | 'mes' = 'semana'): Promise<Retrospectiva> {
  const dias = periodo === 'semana' ? 7 : 30
  const desde = new Date()
  desde.setDate(desde.getDate() - dias)
  const desdeIso = desde.toISOString()

  const progresso = await db.progresso.toArray()
  const blocos = await db.blocos.toArray()
  const blocoPorId = new Map(blocos.map((b) => [b.resumo_id, b]))
  const descobertas = await db.descobertas.where('criado_em').aboveOrEqual(desdeIso).toArray()

  let totalRevisoes = 0
  const lapsosNoPeriodo = new Map<string, number>()
  const saltoPorBloco = new Map<string, number>()
  const horas: number[] = []

  for (const p of progresso) {
    for (const h of p.historico_revisoes) {
      if (h.data < desdeIso) continue
      totalRevisoes++
      horas.push(new Date(h.data).getHours())
      if (h.qualidade < 3) {
        lapsosNoPeriodo.set(p.resumo_id, (lapsosNoPeriodo.get(p.resumo_id) ?? 0) + 1)
      }
      const delta = h.facilidade_depois - h.facilidade_antes
      saltoPorBloco.set(p.resumo_id, Math.max(saltoPorBloco.get(p.resumo_id) ?? -Infinity, delta))
    }
  }

  let conceitoTeimoso: Retrospectiva['conceitoTeimoso'] = null
  let maxLapsos = 0
  for (const [id, n] of lapsosNoPeriodo) {
    if (n > maxLapsos) {
      maxLapsos = n
      const b = blocoPorId.get(id)
      if (b) conceitoTeimoso = { titulo: b.metadata.titulo, lapsos: n }
    }
  }

  let maiorSalto: Retrospectiva['maiorSalto'] = null
  let maxDelta = 0
  for (const [id, delta] of saltoPorBloco) {
    if (delta > maxDelta) {
      maxDelta = delta
      const b = blocoPorId.get(id)
      if (b) maiorSalto = { titulo: b.metadata.titulo, delta }
    }
  }

  let horaPico: number | null = null
  if (horas.length) {
    const contagem = new Map<number, number>()
    for (const h of horas) contagem.set(h, (contagem.get(h) ?? 0) + 1)
    horaPico = [...contagem.entries()].sort((a, b) => b[1] - a[1])[0][0]
  }

  const dominiosFirmados = descobertas.filter((d) => d.tipo === 'dominio_firmado').length

  const partes: string[] = []
  if (totalRevisoes === 0) {
    partes.push(`Esta ${periodo === 'semana' ? 'semana' : 'mês'} ficou quieta entre nós. Sem julgamento — quando quiser, eu continuo aqui.`)
  } else {
    partes.push(`Foram ${totalRevisoes} ${totalRevisoes === 1 ? 'revisão' : 'revisões'} ${periodo === 'semana' ? 'esta semana' : 'este mês'}.`)
    if (dominiosFirmados > 0) partes.push(`${dominiosFirmados} ${dominiosFirmados === 1 ? 'domínio novo se firmou' : 'domínios novos se firmaram'}.`)
    if (maiorSalto) partes.push(`Seu maior salto foi em "${maiorSalto.titulo}".`)
    if (conceitoTeimoso && conceitoTeimoso.lapsos >= 2) partes.push(`"${conceitoTeimoso.titulo}" ainda resiste — voltaremos a ele com outro ângulo.`)
    if (horaPico != null) partes.push(`Você rendeu mais por volta das ${horaPico}h.`)
  }

  return {
    periodo,
    totalRevisoes,
    conceitoTeimoso,
    maiorSalto,
    horaPico,
    dominiosFirmados,
    narrativa: partes.join(' '),
  }
}
