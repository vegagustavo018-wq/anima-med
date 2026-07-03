import { db } from '@core/db/database'

export interface Lacuna {
  bloco_id: string
  bloco_titulo: string
  bloco_disciplina: string
  prereq_id: string
  prereq_titulo: string
  motivo: 'nunca_estudado' | 'fraco'
}

/**
 * Detector de Lacunas (bloco 4) — heurística local via SRS + pré-requisitos.
 * Sinaliza quando o aluno avançou para um bloco sem que a base dele esteja
 * sólida. Não é IA — é aritmética sobre o próprio histórico.
 */
export async function detectarLacunas(): Promise<Lacuna[]> {
  const blocos = await db.blocos.toArray()
  const progresso = await db.progresso.toArray()
  const progressoPorId = new Map(progresso.map((p) => [p.resumo_id, p]))

  const lacunas: Lacuna[] = []
  for (const b of blocos) {
    const meuProgresso = progressoPorId.get(b.resumo_id)
    if (!meuProgresso || meuProgresso.vezes_lido === 0) continue // só avalia o que já foi estudado

    for (const prereq of b.conexoes.prerequisitos) {
      const pProgresso = progressoPorId.get(prereq.bloco_id)
      if (!pProgresso || pProgresso.vezes_lido === 0) {
        lacunas.push({
          bloco_id: b.resumo_id,
          bloco_titulo: b.metadata.titulo,
          bloco_disciplina: b.metadata.disciplina,
          prereq_id: prereq.bloco_id,
          prereq_titulo: prereq.titulo,
          motivo: 'nunca_estudado',
        })
      } else if (pProgresso.srs.status === 'novo' || pProgresso.srs.lapsos >= 3) {
        lacunas.push({
          bloco_id: b.resumo_id,
          bloco_titulo: b.metadata.titulo,
          bloco_disciplina: b.metadata.disciplina,
          prereq_id: prereq.bloco_id,
          prereq_titulo: prereq.titulo,
          motivo: 'fraco',
        })
      }
    }
  }
  return lacunas
}
