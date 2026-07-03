import type { BlocoConteudo } from '@core/types/schema'

// ═══════════════════════════════════════════════════════════════════════════
// VALIDADOR DE BLOCO — impede que o erro de 30/06 se repita em escala.
// Três checagens: schema estrutural, 8 etapas pedagógicas, integridade da árvore.
// ═══════════════════════════════════════════════════════════════════════════

export interface ProblemaSchema {
  campo: string
  mensagem: string
  gravidade: 'erro' | 'aviso'
}

export function validarSchema(b: BlocoConteudo): ProblemaSchema[] {
  const p: ProblemaSchema[] = []
  const req = (cond: boolean, campo: string, msg: string, g: 'erro' | 'aviso' = 'erro') => {
    if (!cond) p.push({ campo, mensagem: msg, gravidade: g })
  }

  req(!!b.resumo_id, 'resumo_id', 'faltando')
  req(!!b.metadata?.titulo, 'metadata.titulo', 'faltando')
  req(!!b.metadata?.disciplina, 'metadata.disciplina', 'faltando')
  req(typeof b.metadata?.semestre === 'number', 'metadata.semestre', 'deve ser número')
  req(!!b.resumo_conciso && b.resumo_conciso.length > 40, 'resumo_conciso', 'muito curto ou ausente')
  req(Array.isArray(b.narrativa) && b.narrativa.length > 0, 'narrativa', 'vazia')

  // narrativa: cada item deve ter os campos do seu tipo
  b.narrativa?.forEach((n, i) => {
    if (n.tipo === 'tabela_comparativa') {
      req(Array.isArray(n.colunas) && n.colunas.length > 0, `narrativa[${i}]`, 'tabela sem colunas')
      req(Array.isArray(n.linhas), `narrativa[${i}]`, 'tabela sem linhas')
    }
    if (n.tipo === 'etimologia') {
      req(!!n.termo && !!n.explicacao, `narrativa[${i}]`, 'etimologia incompleta')
    }
  })

  // flashcards
  b.flashcards?.forEach((f, i) => {
    req(!!f.card_id, `flashcards[${i}].card_id`, 'faltando')
    req(!!f.pergunta && !!f.resposta, `flashcards[${i}]`, 'pergunta/resposta faltando')
    req(f.nivel_alvo >= 1 && f.nivel_alvo <= 5, `flashcards[${i}].nivel_alvo`, 'fora de 1–5', 'aviso')
  })

  // casos: cascata de 5 etapas
  b.casos_clinicos?.forEach((c, i) => {
    req(c.cascata?.length === 5, `casos_clinicos[${i}].cascata`, 'cascata deve ter 5 etapas', 'aviso')
    req(!!c.diagnostico_revelado, `casos_clinicos[${i}].diagnostico_revelado`, 'faltando', 'aviso')
  })

  req(!!b.procedencia?.gerado_por, 'procedencia', 'faltando')
  req(!!b.horizonte_validade, 'horizonte_validade', 'faltando')

  return p
}

// ── Checagem das 8 etapas + anti-padrões ──────────────────────────────────────
export interface Checagem8Etapas {
  score: number // 0–100
  presentes: string[]
  faltando: string[]
  antiPadroes: string[]
}

export function checar8Etapas(b: BlocoConteudo): Checagem8Etapas {
  const tipos = new Set(b.narrativa?.map((n) => n.tipo) ?? [])
  const secoes = (b.narrativa ?? [])
    .filter((n) => n.tipo === 'secao')
    .map((n) => (n as { titulo: string }).titulo.toLowerCase())
  const temSecao = (kw: string[]) => secoes.some((s) => kw.some((k) => s.includes(k)))

  const checks: { nome: string; ok: boolean }[] = [
    { nome: 'POR QUE EXISTE', ok: temSecao(['por que', 'problema', 'resolve']) },
    { nome: 'COMO SE RESOLVE', ok: temSecao(['resolv', 'solução', 'como a natureza']) },
    { nome: 'DO QUE É FEITO', ok: temSecao(['do que é feito', 'composição', 'feito']) || tipos.has('passo_a_passo') },
    { nome: 'COMO FUNCIONA', ok: temSecao(['como funciona', 'em movimento', 'em ação']) || tipos.has('passo_a_passo') },
    { nome: 'COM O QUE SE ARTICULA', ok: temSecao(['articula', 'conexão', 'com o que']) || (b.conexoes?.futuras?.length ?? 0) > 0 },
    { nome: 'NOME + ETIMOLOGIA', ok: tipos.has('etimologia') },
    { nome: 'ANALOGIA', ok: tipos.has('analogia') },
    { nome: 'IMAGEM', ok: tipos.has('imagem') },
  ]

  const presentes = checks.filter((c) => c.ok).map((c) => c.nome)
  const faltando = checks.filter((c) => !c.ok).map((c) => c.nome)

  // anti-padrões detectáveis
  const anti: string[] = []
  const temContrafactual =
    tipos.has('contrafactual') || (b.flashcards ?? []).some((f) => f.tipo === 'contrafactual')
  if (!temContrafactual) anti.push('sem contrafactual')
  const temClinico = (b.flashcards ?? []).some((f) => f.tipo === 'clinico')
  if (!temClinico && (b.casos_clinicos?.length ?? 0) === 0) anti.push('sem elemento clínico')
  const flashDefinicao = (b.flashcards ?? []).some((f) => /^(o que é|defina|cite os tipos)/i.test(f.pergunta))
  if (flashDefinicao) anti.push('flashcard de definição seca ("O que é X?")')
  const primeiro = b.narrativa?.[0]
  if (primeiro?.tipo === 'texto' && /^[A-ZÀ-Ú][\wà-ú]+ (é|são) /.test(primeiro.conteudo)) {
    anti.push('abre com definição em vez de contexto')
  }

  const score = Math.round((presentes.length / checks.length) * 100)
  return { score, presentes, faltando, antiPadroes: anti }
}

// ── Integridade referencial da árvore ─────────────────────────────────────────
export interface ProblemaIntegridade {
  resumo_id: string
  tipo: 'pai_inexistente' | 'filho_inexistente' | 'conexao_orfa'
  alvo: string
}

export function checarIntegridade(blocos: BlocoConteudo[]): ProblemaIntegridade[] {
  const ids = new Set(blocos.map((b) => b.resumo_id))
  const problemas: ProblemaIntegridade[] = []

  for (const b of blocos) {
    if (b.no_pai_id && !ids.has(b.no_pai_id)) {
      // pai inexistente só é problema se não for uma raiz de módulo (termina em -000)
      if (!b.no_pai_id.endsWith('-000')) {
        problemas.push({ resumo_id: b.resumo_id, tipo: 'pai_inexistente', alvo: b.no_pai_id })
      }
    }
    for (const f of b.nos_filhos_ids ?? []) {
      if (!ids.has(f)) problemas.push({ resumo_id: b.resumo_id, tipo: 'filho_inexistente', alvo: f })
    }
    for (const l of b.conexoes_laterais_ids ?? []) {
      if (!ids.has(l)) problemas.push({ resumo_id: b.resumo_id, tipo: 'conexao_orfa', alvo: l })
    }
  }
  return problemas
}
