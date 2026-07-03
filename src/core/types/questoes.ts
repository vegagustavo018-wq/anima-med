import type { SRSState } from './schema'

// ═══════════════════════════════════════════════════════════════════════════
// QUESTÕES — vertical de banco de MCQ + flashcards (conteúdo REGENERÁVEL).
// Gerado a partir do app Revalida Clinical (scripts/gerar-questoes-revalida.mjs).
// Vive na tabela Dexie `questoes`; o desempenho do aluno vive em
// `progressoQuestao` (SAGRADO, chave natural questao_id).
// ═══════════════════════════════════════════════════════════════════════════

export interface AlternativaMCQ {
  id: string // 'a' | 'b' | ...
  texto: string
}

export interface QuestaoMCQ {
  id: string
  tipo: 'mcq'
  subtipo: string // 'diagnostico' | 'conduta'
  enunciado: string
  alternativas: AlternativaMCQ[]
  correta: string // id da alternativa correta
  comentario: string
  especialidade: string
  sistema: string
  tema: string
  cid: string | null
  dificuldade: string
  tags: string[]
  fonte: string
}

export interface FlashcardRevalida {
  id: string
  tipo: 'flashcard'
  subtipo: 'flip' | 'digitar'
  frente: string
  verso: string
  dica: string | null
  fraseParaPaciente: string | null
  especialidade: string
  categoria: string | null
  dificuldade: string
  tags: string[]
  fonte: string
}

export type ItemQuestao = QuestaoMCQ | FlashcardRevalida

export function ehMCQ(q: ItemQuestao): q is QuestaoMCQ {
  return q.tipo === 'mcq'
}

export type ModoResposta = 'treino' | 'exame' | 'revisao'

export interface TentativaQuestao {
  data: string
  acertou: boolean
  escolha?: string
  ms?: number
  modo: ModoResposta
}

export interface ProgressoQuestao {
  questao_id: string
  srs: SRSState
  tentativas: number
  acertos: number
  ultima_escolha: string | null
  historico: TentativaQuestao[]
  criado_em: string
  atualizado_em: string
}

export function progressoQuestaoInicial(questao_id: string, agora: string): ProgressoQuestao {
  return {
    questao_id,
    srs: {
      facilidade: 2.5,
      intervalo_dias: 0,
      repeticoes: 0,
      proxima_revisao: null,
      ultima_revisao: null,
      status: 'novo',
      lapsos: 0,
    },
    tentativas: 0,
    acertos: 0,
    ultima_escolha: null,
    historico: [],
    criado_em: agora,
    atualizado_em: agora,
  }
}
