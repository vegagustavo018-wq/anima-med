// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA v3.1 — Separação Conteúdo / Progresso
//
// LIÇÃO FUNDACIONAL (revisão 30/06/2026): o progresso do estudante NUNCA pode
// viver dentro do bloco de conteúdo. Blocos são regeráveis; progresso é sagrado.
// Duas tabelas Dexie: `blocos` (substituível) + `progresso` (intocável).
// ═══════════════════════════════════════════════════════════════════════════

// ── Enumerações ──────────────────────────────────────────────────────────────
export type NivelDominio = 'CORE' | 'EXPANSAO' | 'APROFUNDAMENTO'
export type TipoBloco = 'conceito' | 'processo' | 'comparacao' | 'clinico' | 'farmaco'
export type StatusEstudo = 'novo' | 'aprendendo' | 'revisando' | 'dominado'
export type StatusCicloVida =
  | 'rascunho'
  | 'revisado_pelo_autor'
  | 'validado_cross_fonte'
  | 'em_uso_clinico'
  | 'em_revisao'
  | 'obsoleto'
export type HorizonteValidade = 'estavel' | 'em_mudanca' | 'volatil'
export type NivelConfianca = 'rascunho' | 'estudo' | 'clinica'
// Proveniência de imagem — define o selo de honestidade mostrado ao aluno.
export type OrigemImagem = 'esquema' | 'ia' | 'real'

// ── Narrativa — união discriminada ───────────────────────────────────────────
export type NarrativaItem =
  | { tipo: 'texto'; conteudo: string }
  | { tipo: 'secao'; titulo: string }
  | { tipo: 'pausa'; conteudo: string }
  | { tipo: 'highlight'; conteudo: string }
  | { tipo: 'contrafactual'; pergunta: string; resposta: string }
  | { tipo: 'analogia'; icone: string; conteudo: string }
  | {
      tipo: 'etimologia'
      termo: string
      origem: string
      significado: string
      explicacao: string
    }
  | {
      tipo: 'imagem'
      titulo: string
      descricao: string
      prompt_ia: string
      // Proveniência — governa o selo de honestidade exibido (ver OrigemImagem).
      // 'esquema' = diagrama vetorial didático; 'ia' = ilustração gerada por IA
      // (auxílio, pode ter imprecisões); 'real' = imagem real/domínio público verificada.
      origem?: OrigemImagem
      // URL da imagem quando já existe (gerada/curada). null/ausente → mostra o
      // placeholder didático com a descrição + o prompt pronto para gerar.
      url?: string | null
    }
  | {
      tipo: 'passo_a_passo'
      titulo: string
      passos: { numero: number; titulo: string; explicacao: string }[]
    }
  | {
      tipo: 'tabela_comparativa'
      titulo: string
      colunas: string[]
      linhas: Record<string, string>[]
    }

// ── Flashcard ─────────────────────────────────────────────────────────────────
export type TipoFlashcard =
  | 'por_que'
  | 'mecanismo'
  | 'contrafactual'
  | 'clinico'
  | 'comparacao'
  | 'armadilha'
  | 'sintese_transdisciplinar'
  | 'etimologia'
  | 'cloze'

export interface Flashcard {
  card_id: string
  pergunta: string
  resposta: string
  tipo: TipoFlashcard
  dificuldade: number // 1–5
  nivel_alvo: number // 1–5 (taxonomia ANIMA: reconhecer→recordar→explicar→aplicar→transferir)
  tags: string[]
  imagem_apoio?: string | null
  // formato de resposta: 'flip' (virar e avaliar) ou 'digitar' (escrever, diff letra a letra)
  formato?: 'flip' | 'digitar'
  resposta_curta?: string // forma canônica curta, usada só quando formato='digitar'
}

// ── Caso Clínico ──────────────────────────────────────────────────────────────
export interface EtapaCascata {
  etapa: 'Causa' | 'Estrutura Afetada' | 'Disfunção' | 'Sintoma' | 'Consequência'
  descricao: string
}

export interface CasoClinicos {
  caso_id: string
  titulo: string
  apresentacao: string
  cascata: EtapaCascata[]
  conexao_com_bloco: string
  disciplinas_relacionadas: string[]
  diagnostico_revelado: string
  tratamento_resumido: string
}

// ── Conexões ──────────────────────────────────────────────────────────────────
export type TipoConexaoFutura =
  | 'CASCATA_CAUSAL'
  | 'ALVO_TERAPEUTICO'
  | 'RECONHECIMENTO_CLINICO'
  | 'MECANISMO_COMPARTILHADO'

export interface Conexoes {
  prerequisitos: {
    bloco_id: string
    titulo: string
    disciplina: string
    semestre: number
    relevancia: 'base_necessaria' | 'complementar'
    explicacao: string
  }[]
  futuras: {
    tipo: TipoConexaoFutura
    bloco_id_destino: string | null
    disciplina: string
    semestre_futuro: number
    topico: string
    mecanismo_conexao: string
  }[]
  laterais: {
    bloco_id: string
    tipo_relacao: 'ANALOGIA' | 'CONTRASTE' | 'EXEMPLO_PARALELO'
    explicacao: string
  }[]
}

// ── Metadados ────────────────────────────────────────────────────────────────
export interface Metadata {
  titulo: string
  subtitulo?: string
  semestre: number
  disciplina: string
  sistema_corporal?: string
  regiao_anatomica?: string | null
  profundidade_arvore?: number
  importancia?: number
  dificuldade?: number
  tempo_leitura_minutos?: number
  status: string
  data_criacao: string
  data_ultima_revisao: string
  versao: string
  tags: string[]
  nivel?: NivelDominio
  tipo?: TipoBloco
  canmeds?: string[]
  // Internato (S10-12): a "pele"/formato do bloco. Ausente nos S1-9 → fallback.
  formato_internato?: FormatoInternato
  epa_codigo?: string
  epa_nivel_alvo?: number
}

// Formato de apresentação dos blocos de internato — decide a "pele" no BlocoPage.
export type FormatoInternato =
  | 'visao_geral'
  | 'avaliacao'
  | 'caso_paradigmatico'
  | 'competencia_epa'
  | 'procedimento'
  | 'integrador'
  | 'reflexao'
  | 'analise_erro'

// ═══════════════════════════════════════════════════════════════════════════
// BLOCO DE CONTEÚDO — regerável, substituível. NÃO contém progresso.
// ═══════════════════════════════════════════════════════════════════════════
export interface BlocoConteudo {
  resumo_id: string
  no_pai_id: string | null
  nos_filhos_ids: string[]
  conexoes_laterais_ids: string[]

  metadata: Metadata

  resumo_conciso: string
  narrativa: NarrativaItem[]
  conexoes: Conexoes

  flashcards: Flashcard[]
  casos_clinicos: CasoClinicos[]

  midia: {
    imagens: {
      id: string
      url: string | null
      prompt_ia: string
      status: 'gerada' | 'pendente'
      origem?: OrigemImagem
      titulo?: string
      descricao?: string
    }[]
    videos: { id: string; url: string; duracao: string }[]
    audios: { id: string; url: string; duracao: string }[]
  }

  // Palpite pré-teste (inversão pedagógica) — pergunta antes de revelar a narrativa
  palpite?: {
    pergunta: string
    dica?: string
  }

  horizonte_validade: HorizonteValidade
  estado_ciclo_vida: StatusCicloVida
  nivel_aceitacao: string

  procedencia: {
    gerado_por: string
    data_geracao: string
    revisado_por: string | null
    data_revisao: string | null
    nivel_confianca: NivelConfianca
  }

  fontes: {
    tipo: string
    citacao: string
    forca_evidencia?: string
    data_acesso?: string
  }[]

  // Preenchido no momento da ingestão — hash do conteúdo, para UPSERT idempotente
  content_hash?: string
}

// ═══════════════════════════════════════════════════════════════════════════
// PROGRESSO DO BLOCO — sagrado, intocável pela ingestão. Chave: resumo_id.
// ═══════════════════════════════════════════════════════════════════════════
export interface SRSState {
  facilidade: number // SM-2: 1.3–2.5
  intervalo_dias: number
  repeticoes: number
  proxima_revisao: string | null
  ultima_revisao: string | null
  status: StatusEstudo
  lapsos: number // quantas vezes "Errei" — detecção de leech
}

export interface ProgressoBloco {
  resumo_id: string

  // Leitura
  vezes_lido: number
  ultima_leitura: string | null
  tempo_total_estudo_minutos: number
  marcado_para_revisao: boolean

  // SRS (bloco como unidade + por card)
  srs: SRSState
  srs_cards: Record<string, SRSState> // card_id → estado

  // Palpite (inversão pedagógica) — respostas do pré-teste guardadas para o reencontro em espiral
  palpites: { data: string; resposta: string }[]

  // Metacognição
  auto_avaliacao: {
    explicar_para_leigo: number | null
    prever_sintomas: number | null
    aplicar_caso_novo: number | null
    conexoes_claras: number | null
  }
  calibracao: { data: string; confianca: number; acertou: boolean }[]

  // Pessoal
  notas_do_usuario: string
  diario_aprendizagem: string
  destaques: Destaque[]

  // Timeline de revisões (undo + linha do tempo do card/bloco) — bloco 1
  historico_revisoes: EventoRevisao[]

  criado_em: string
  atualizado_em: string
}

// Cor semântica do highlight: amarelo=não entendi, vermelho=cai na prova, roxo=conecta, verde=dominei
export type CorDestaque = 'amarelo' | 'vermelho' | 'roxo' | 'verde'

export interface Destaque {
  trecho: string
  cor: CorDestaque
  criado_em: string
}

export interface EventoRevisao {
  data: string
  alvo: 'bloco' | string // 'bloco' ou card_id
  qualidade: number
  facilidade_antes: number
  facilidade_depois: number
  intervalo_depois: number
}

export function progressoInicial(resumo_id: string, agora: string): ProgressoBloco {
  return {
    resumo_id,
    vezes_lido: 0,
    ultima_leitura: null,
    tempo_total_estudo_minutos: 0,
    marcado_para_revisao: false,
    srs: {
      facilidade: 2.5,
      intervalo_dias: 0,
      repeticoes: 0,
      proxima_revisao: null,
      ultima_revisao: null,
      status: 'novo',
      lapsos: 0,
    },
    srs_cards: {},
    palpites: [],
    auto_avaliacao: {
      explicar_para_leigo: null,
      prever_sintomas: null,
      aplicar_caso_novo: null,
      conexoes_claras: null,
    },
    calibracao: [],
    notas_do_usuario: '',
    diario_aprendizagem: '',
    destaques: [],
    historico_revisoes: [],
    criado_em: agora,
    atualizado_em: agora,
  }
}

// ── Dúvida capturada (inbox leve) ─────────────────────────────────────────────
export interface Duvida {
  id?: number
  resumo_id: string | null
  trecho: string
  contexto: string
  resolvida: boolean
  criado_em: string
}

// ═══════════════════════════════════════════════════════════════════════════
// BEM-ESTAR — check-in de energia/humor, respiração (bloco 7)
// ═══════════════════════════════════════════════════════════════════════════
export type NivelEnergia = 'baixa' | 'media' | 'alta'
export type Humor = 'ansioso' | 'neutro' | 'motivado' | 'cansado' | 'sobrecarregado'

export interface CheckIn {
  id?: number
  energia: NivelEnergia
  humor: Humor
  nota?: string
  criado_em: string
}

// ═══════════════════════════════════════════════════════════════════════════
// MARCOS DE DESCOBERTA — insights genuínos, nunca farmáveis (bloco 8)
// ═══════════════════════════════════════════════════════════════════════════
export interface Descoberta {
  id?: number
  resumo_id: string | null
  titulo: string
  narrativa: string // a fala da ANIMA descrevendo o que aconteceu
  tipo:
    | 'conexao_antecipada'
    | 'ensinou_de_volta'
    | 'ritual_passagem'
    | 'retorno_apos_pausa'
    | 'imunidade_erro'
    | 'dominio_firmado'
  criado_em: string
}

// ═══════════════════════════════════════════════════════════════════════════
// DIÁRIO DO ORGANISMO — daily note (bloco 9)
// ═══════════════════════════════════════════════════════════════════════════
export interface EntradaDiario {
  data: string // YYYY-MM-DD, chave única
  texto: string
  duvidas_ids: number[]
  atualizado_em: string
}

// ═══════════════════════════════════════════════════════════════════════════
// SESSÕES — presets/perfis de estudo (bloco 1, 10)
// ═══════════════════════════════════════════════════════════════════════════
export type PresetSessao = 'prova' | 'plantao' | 'exploracao' | 'manutencao' | 'padrao'

export interface ConfigSessao {
  chave: 'atual'
  preset: PresetSessao
  retencao_alvo: number // 0.7–0.97
  teto_cards_dia: number | null
  atualizado_em: string
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVAS — contagem regressiva com plano vivo (bloco 6)
// ═══════════════════════════════════════════════════════════════════════════
export interface Prova {
  id?: number
  titulo: string
  data: string // YYYY-MM-DD
  disciplinas: string[] // filtro de disciplinas relevantes; vazio = todas
  criado_em: string
}

// ═══════════════════════════════════════════════════════════════════════════
// CANVAS DE SÍNTESE — mapa mental livre (bloco 9)
// ═══════════════════════════════════════════════════════════════════════════
export interface NoCanvas {
  id: string
  x: number
  y: number
  texto: string
  cor: CorDestaque
}
export interface ArestaCanvas {
  de: string
  para: string
}
export interface Sintese {
  id?: number
  titulo: string
  nos: NoCanvas[]
  arestas: ArestaCanvas[]
  criado_em: string
  atualizado_em: string
}

// ═══════════════════════════════════════════════════════════════════════════
// VINHETAS RAMIFICADAS — raciocínio clínico com decisões e desfechos (bloco 5)
// ═══════════════════════════════════════════════════════════════════════════
export interface OpcaoVinheta {
  texto: string
  proximo_no_id: string
  feedback: string
  correta: boolean
}
export interface NoVinheta {
  no_id: string
  tipo: 'decisao' | 'desfecho'
  narrativa: string
  opcoes?: OpcaoVinheta[] // presente quando tipo = 'decisao'
  desfecho_bom?: boolean // presente quando tipo = 'desfecho'
}
export interface VinhetaClinica {
  vinheta_id: string
  bloco_id: string | null
  titulo: string
  disciplina: string
  no_inicial_id: string
  nos: NoVinheta[]
}

// ── Preview (para listas e fluxograma) ───────────────────────────────────────
export type BlocoPreview = Pick<
  BlocoConteudo,
  'resumo_id' | 'no_pai_id' | 'resumo_conciso' | 'metadata'
>
