// ═══════════════════════════════════════════════════════════════════════════
// STREAK-RITMO — Acompanhamento de ritmo de estudo
//
// Filosofia: O ritmo importa mais que a quantidade. 5 dias de estudo seguidos
// = +1 dia de streak. Visual: heatmap GitHub-style + celebração em milestones.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Sessão de estudo — registro granular de cada encontro do aluno com ANIMA.
 * Cada sessão marca: data, blocos estudados, tempo total, qualidade de
 * aprendizado (capturada via SRS feedback).
 */
export interface SessaoEstudo {
  id?: number
  data: string // YYYY-MM-DD, chave lógica (1 sessão por dia)
  hora_inicio: string // HH:MM:SS
  hora_fim: string | null // null se em progresso
  blocos_estudados: {
    bloco_id: string
    tempo_minutos: number
    cards_revisados: number
    qualidade_media: number // 0–5, média das respostas SRS naquele bloco
  }[]
  tempo_total_minutos: number
  tempo_sessao_ativa_minutos: number // tempo real com app em foco (opcional, v2)
  qualidade_flashcards_media: number // 0–5
  criado_em: string
  finalizado_em: string | null
}

/**
 * Estatísticas agregadas por dia — cache para otimizar o heatmap.
 * Recalculado incrementalmente quando nova sessão é registrada.
 */
export interface DiaEstudo {
  data: string // YYYY-MM-DD, chave única
  sessoes_count: number
  tempo_total_minutos: number
  blocos_unicos_estudados: number
  qualidade_media: number // 0–5
  intensidade: number // 0–1, normalizado para 0-5 em pixels no heatmap
  tem_dados: boolean // true se qualidade_media > 0
}

/**
 * Streak atual — quantas vezes seguidas o aluno estudou.
 * Meta: 5 dias de estudo seguidos = +1 dia de streak (não precisa ser
 * diariamente consecutivo no calendário, mas 5 sessões no ritmo de estudo).
 */
export interface Streak {
  dias_atuais: number // quantos dias consecutivos com qualidade_media > 0
  recorde: number // máximo histórico
  ultima_sessao_data: string | null
  dias_sem_quebra: number // contador de dias desde última quebra
  quebrarom_em: string | null // data da última quebra
}

/**
 * Milestone — celebração visual de conquistas no ritmo.
 * A cada 7, 30, 100 dias de streak, o app dispara uma celebração.
 */
export type MilestoneType = 'sete_dias' | 'trinta_dias' | 'cem_dias' | 'custom'

export interface Milestone {
  tipo: MilestoneType
  dias: number
  titulo: string
  descricao: string
  emoji: string
  confetiBurst: boolean
  som_celebracao?: string // URL do áudio
  cor_fundo?: string // CSS color
  animacao?: 'pulse' | 'bounce' | 'rainbow'
}

/**
 * Fases de ritmo — caracteriza o padrão de estudo do aluno.
 * Usado para sugerir otimizações e feedback.
 */
export type FaseRitmo = 'iniciante' | 'consistente' | 'intenso' | 'em_recuperacao' | 'abandonado'

/**
 * Resumo de ritmo — Dashboard principal (Progresso, Corpo, Memória).
 * Agrupa as informações para exibição visual.
 */
export interface ResumoRitmo {
  streak_atual: Streak
  fase: FaseRitmo
  heatmap_ultimas_12_semanas: DiaEstudo[] // 84 dias, ordenado por data
  ultima_sessao: SessaoEstudo | null
  proxima_meta: Milestone | null // próximo milestone a atingir
  milestonesAlcancados: Milestone[] // lista de milestones batidos no histórico
  tendencia: 'subindo' | 'estavel' | 'caindo' // comparação últimas 2 semanas vs semana anterior
  semana_atual_dias_com_estudo: number // 0–7
}

/**
 * Milestones pré-definidos — celebrações de longa duração.
 */
export const MILESTONES_PADRAO: Record<string, Milestone> = {
  sete_dias: {
    tipo: 'sete_dias',
    dias: 7,
    titulo: 'Primeira Semana!',
    descricao: 'Você manteve a consistência por 7 dias seguidos. ANIMA está apreendendo seu ritmo.',
    emoji: '🌱',
    confetiBurst: true,
    som_celebracao: 'primeira-semana.mp3',
    cor_fundo: '#e8f5e9',
    animacao: 'pulse',
  },
  trinta_dias: {
    tipo: 'trinta_dias',
    dias: 30,
    titulo: 'Um Mês de Disciplina!',
    descricao: 'Seu organismo aprendeu o ritmo. A neuroplasticidade está em marcha.',
    emoji: '🔥',
    confetiBurst: true,
    som_celebracao: 'um-mes.mp3',
    cor_fundo: '#fff3e0',
    animacao: 'bounce',
  },
  cem_dias: {
    tipo: 'cem_dias',
    dias: 100,
    titulo: 'Cem Dias de Maestria!',
    descricao: 'Você não apenas aprendeu a estudar. Você tornou-se um ritmo. ANIMA celebra em silêncio reverente.',
    emoji: '⭐',
    confetiBurst: true,
    som_celebracao: 'cem-dias.mp3',
    cor_fundo: '#f3e5f5',
    animacao: 'rainbow',
  },
}

/**
 * Padrões para detectar a fase de ritmo.
 * Ajustáveis via analytics e feedback do usuário.
 */
export const LIMIARES_FASE = {
  iniciante: { dias_minimos: 0, dias_maximos: 6 }, // menos de uma semana
  consistente: { dias_minimos: 7, dias_maximos: 29 }, // 1–4 semanas
  intenso: { dias_minimos: 30, dias_maximos: 999 }, // 1+ meses
  em_recuperacao: { dias_sem_estudar: 3 }, // 3 dias de pausa = recuperação
  abandonado: { dias_sem_estudar: 14 }, // 2 semanas = abandono
}

/**
 * Algoritmo GitHub-style para o heatmap:
 * 1. Agregar dados em DiaEstudo (já feito, cache incremental)
 * 2. Renderizar grid 7 × 12 (dias semana × semanas, variável)
 * 3. Cores: branco (sem dados) → cinza (baixa) → verde (média) → verde escuro (alta)
 * 4. Tooltip: "(data): X min, Y cards, qualidade Z"
 *
 * Retorna: array de objetos para renderizar no canvas/SVG
 */
export interface CelHeatmap {
  data: string // YYYY-MM-DD
  dia_semana: number // 0–6 (domingo–sábado)
  semana: number // 0–51 (dentro das 12 últimas semanas)
  intensidade: number // 0–1 (mapeado a RGB)
  tempo_minutos: number
  cards: number
  qualidade: number // 0–5
  tooltip: string
}

/**
 * Função para computar intensidade (0–1) a partir de qualidade (0–5) e tempo (minutos).
 * Mantém o usuário motivado mesmo em dias curtos: preferimos consistência sobre quantidade.
 */
export function computarIntensidade(qualidade_media: number, tempo_minutos: number): number {
  // Fórmula: 40% qualidade + 60% tempo (normalizado a 45 min = intensidade 1.0)
  const peso_qualidade = (qualidade_media / 5) * 0.4
  const peso_tempo = Math.min(tempo_minutos / 45, 1) * 0.6 // máximo 45 min = 100%
  return peso_qualidade + peso_tempo
}

/**
 * Mapeia intensidade (0–1) para cor hexadecimal (GitHub-style).
 * Branco → Cinza claro → Verde claro → Verde médio → Verde escuro
 */
export function intensidadeParaCor(intensidade: number): string {
  if (intensidade === 0) return '#ebedf0' // branco
  if (intensidade < 0.25) return '#c6e48b' // verde muito claro
  if (intensidade < 0.5) return '#7bc96f' // verde claro
  if (intensidade < 0.75) return '#239a3b' // verde médio
  return '#196127' // verde escuro
}

/**
 * Mapeia intensidade para tamanho de raio em SVG (círculos aninhados).
 * Opcional: em vez de cor sólida, raios concêntricos para acessibilidade.
 */
export function intensidadeParaRaio(intensidade: number): number {
  // Escala: 0 → 2px, 1.0 → 12px
  return 2 + intensidade * 10
}

/**
 * Preditor de quebra de streak — detecta risco de abandono.
 * Retorna: número de dias até risco (0 = em risco hoje, null = seguro)
 */
export function predizerRiscoQuebra(
  dias_atuais: number,
  ultimo_dia_com_estudo: string,
  historico_ultimas_2_semanas: DiaEstudo[]
): number | null {
  if (dias_atuais < 7) return null // menos de 1 semana = sem risco ainda

  const hoje = new Date().toISOString().split('T')[0]
  const ultimo = new Date(ultimo_dia_com_estudo)
  const agora = new Date(hoje)
  const dias_sem_estudar = Math.floor((agora.getTime() - ultimo.getTime()) / (1000 * 60 * 60 * 24))

  // Se já passou 3 dias sem estudar, streak está em risco
  if (dias_sem_estudar >= 3) return 0

  // Tendência: se últimas 5 dias têm qualidade < 2/5, risco para amanhã
  const ultimos_5 = historico_ultimas_2_semanas.slice(-5)
  const qualidade_media = ultimos_5.reduce((sum, d) => sum + d.qualidade_media, 0) / ultimos_5.length
  if (qualidade_media < 2) return 1

  return null
}

/**
 * Calcula a fase de ritmo atual.
 */
export function calcularFase(
  streak_atual: Streak,
  dias_desde_ultima_sessao: number
): FaseRitmo {
  if (dias_desde_ultima_sessao > LIMIARES_FASE.abandonado.dias_sem_estudar)
    return 'abandonado'
  if (dias_desde_ultima_sessao >= LIMIARES_FASE.em_recuperacao.dias_sem_estudar)
    return 'em_recuperacao'
  if (streak_atual.dias_atuais >= LIMIARES_FASE.intenso.dias_minimos)
    return 'intenso'
  if (streak_atual.dias_atuais >= LIMIARES_FASE.consistente.dias_minimos)
    return 'consistente'
  return 'iniciante'
}
