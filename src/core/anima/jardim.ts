import { db } from '@core/db/database'
import { estaVencido } from '@core/srs/sm2'

/**
 * Jardim das Sementes — SRS afetivo. Cada bloco estudado é uma planta cujo
 * estado espelha a memória: brotando (aprendendo), florida (dominado em dia),
 * MURCHANDO quando venceu. Nada morre — murchar é um convite à rega (revisão),
 * não punição.
 */

export type EstadoPlanta = 'broto' | 'crescendo' | 'florida' | 'murchando'

export interface Planta {
  resumo_id: string
  titulo: string
  disciplina: string
  estado: EstadoPlanta
}

export interface Canteiro {
  disciplina: string
  plantas: Planta[]
  floridas: number
}

export interface Jardim {
  canteiros: Canteiro[]
  totalPlantas: number
  floridas: number
  murchando: number
  brotos: number
}

const ORDEM: Record<EstadoPlanta, number> = { murchando: 0, broto: 1, crescendo: 2, florida: 3 }

export async function montarJardim(): Promise<Jardim> {
  const [progresso, blocos] = await Promise.all([db.progresso.toArray(), db.blocos.toArray()])
  const blocoPorId = new Map(blocos.map((b) => [b.resumo_id, b]))

  const porDisciplina = new Map<string, Planta[]>()
  let floridas = 0
  let murchando = 0
  let brotos = 0

  for (const p of progresso) {
    if (p.vezes_lido === 0) continue
    const b = blocoPorId.get(p.resumo_id)
    if (!b) continue

    let estado: EstadoPlanta
    if (estaVencido(p.srs)) {
      estado = 'murchando'
      murchando++
    } else if (p.srs.status === 'dominado') {
      estado = 'florida'
      floridas++
    } else if (p.srs.status === 'novo') {
      estado = 'broto'
      brotos++
    } else {
      estado = 'crescendo'
    }

    const disc = b.metadata.disciplina
    const arr = porDisciplina.get(disc) ?? []
    arr.push({ resumo_id: p.resumo_id, titulo: b.metadata.titulo, disciplina: disc, estado })
    porDisciplina.set(disc, arr)
  }

  const canteiros: Canteiro[] = [...porDisciplina.entries()]
    .map(([disciplina, plantas]) => {
      plantas.sort((a, b) => ORDEM[a.estado] - ORDEM[b.estado])
      return { disciplina, plantas, floridas: plantas.filter((p) => p.estado === 'florida').length }
    })
    .sort((a, b) => b.plantas.length - a.plantas.length)

  const totalPlantas = canteiros.reduce((s, c) => s + c.plantas.length, 0)
  return { canteiros, totalPlantas, floridas, murchando, brotos }
}
