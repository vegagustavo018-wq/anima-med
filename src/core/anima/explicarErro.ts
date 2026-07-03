import { db } from '@core/db/database'
import type { BlocoConteudo, ProgressoBloco } from '@core/types/schema'
import { diagnosticarErros } from '@core/anima/erros'

export interface ExplicacaoErro {
  origem: 'prerequisito' | 'padrao_tipo' | 'generico'
  titulo: string
  explicacao: string
  bloco_alvo_id: string | null
}

/**
 * Explique Meu Erro (bloco 4) — heurística local via cascata de
 * pré-requisitos. Sem IA externa: cruza o que o aluno já sabe (SRS) com o
 * que o bloco exige, e aponta o elo mais provável da confusão.
 */
export async function explicarErro(bloco: BlocoConteudo): Promise<ExplicacaoErro> {
  const prereqs = bloco.conexoes.prerequisitos
  if (prereqs.length > 0) {
    const progressos = await Promise.all(prereqs.map((p) => db.progresso.get(p.bloco_id)))
    const forcaDe = (p: ProgressoBloco | undefined): number =>
      !p ? -1 : p.srs.status === 'dominado' ? 3 : p.srs.status === 'revisando' ? 2 : p.srs.status === 'aprendendo' ? 1 : 0

    let piorIdx = 0
    for (let i = 1; i < prereqs.length; i++) {
      if (forcaDe(progressos[i]) < forcaDe(progressos[piorIdx])) piorIdx = i
    }
    const prereq = prereqs[piorIdx]
    const p = progressos[piorIdx]
    if (!p || p.srs.status === 'novo' || p.srs.status === 'aprendendo') {
      return {
        origem: 'prerequisito',
        titulo: `Provável origem: ${prereq.titulo}`,
        explicacao: `Este bloco depende de "${prereq.titulo}" (sem ${prereq.semestre}), que ${!p ? 'você ainda não estudou' : 'ainda está em fase inicial'}. Talvez o problema não seja este bloco — seja o alicerce dele.`,
        bloco_alvo_id: prereq.bloco_id,
      }
    }
  }

  const diagnostico = await diagnosticarErros()
  const mesmaDisc = diagnostico.porDisciplina.find((d) => d.chave === bloco.metadata.disciplina)
  if (mesmaDisc && mesmaDisc.percentual >= 25) {
    return {
      origem: 'padrao_tipo',
      titulo: `Padrão em ${bloco.metadata.disciplina}`,
      explicacao: `${mesmaDisc.percentual}% dos seus erros recentes estão em ${bloco.metadata.disciplina}. Não é falta de sorte — é uma área que pede mais tempo de base.`,
      bloco_alvo_id: null,
    }
  }

  return {
    origem: 'generico',
    titulo: 'Sem padrão claro ainda',
    explicacao: 'Este erro parece isolado — pode ser só o SRS fazendo seu trabalho. Releia com calma e tente de novo mais tarde.',
    bloco_alvo_id: null,
  }
}
