/**
 * MÓDULO DE INTEGRAÇÃO DEXIE v3
 *
 * Responsabilidades:
 * 1. Carregar blocos em lote (com paralelismo controlado)
 * 2. Validar IDs únicos e relacionamentos antes de gravar
 * 3. Criar índices secundários para busca rápida (disciplina, tags, semestre)
 * 4. Exportar backup JSON para segurança
 * 5. Relatar métricas de performance e integridade
 */
// @ts-nocheck

import { db, getMeta, setMeta, registrarEvento } from './database'
import type { BlocoConteudo } from '@core/types/schema'

// ════════════════════════════════════════════════════════════════════════════
// TIPOS
// ════════════════════════════════════════════════════════════════════════════

export interface RelatorioIntegracao {
  blocos_migrados: number
  blocos_com_erro: number
  flashcards_migrados: number
  casos_clinicos_migrados: number
  conexoes_migradas: number
  midia_migrada: number
  ids_unicos: boolean
  status_indices: {
    por_disciplina: number
    por_tags: number
    por_id: number
    por_semestre: number
  }
  performance_ms: number
  validacoes: {
    ids_duplicados: string[]
    referencias_invalidas: string[]
    flashcards_orfaos: string[]
    casos_orfaos: string[]
    conexoes_orfaos: string[]
  }
  timestamp: string
}

export interface Indice {
  por_disciplina: Map<string, string[]>
  por_tags: Map<string, string[]>
  por_id: Map<string, BlocoConteudo>
  por_semestre: Map<number, string[]>
}

// ════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE VALIDAÇÃO
// ════════════════════════════════════════════════════════════════════════════

function validarIDsUnicos(blocos: BlocoConteudo[]): {
  unicos: boolean
  duplicados: string[]
} {
  const vistos = new Map<string, number>()
  const duplicados: string[] = []

  for (const bloco of blocos) {
    const count = (vistos.get(bloco.resumo_id) ?? 0) + 1
    vistos.set(bloco.resumo_id, count)
    if (count > 1 && !duplicados.includes(bloco.resumo_id)) {
      duplicados.push(bloco.resumo_id)
    }
  }

  return {
    unicos: duplicados.length === 0,
    duplicados,
  }
}

function validarReferencias(blocos: BlocoConteudo[]): {
  invalidas: string[]
  flashcards_orfaos: string[]
  casos_orfaos: string[]
  conexoes_orfaos: string[]
} {
  const idsValidos = new Set(blocos.map((b) => b.resumo_id))
  const invalidas: string[] = []
  const flashcards_orfaos: string[] = []
  const casos_orfaos: string[] = []
  const conexoes_orfaos: string[] = []

  for (const bloco of blocos) {
    // Validar flashcards
    if (bloco.flashcards) {
      for (const fc of bloco.flashcards) {
        if (!fc.card_id || !fc.pergunta || !fc.resposta) {
          flashcards_orfaos.push(`${bloco.resumo_id}/${fc.card_id}`)
        }
      }
    }

    // Validar casos clínicos
    if (bloco.casos_clinicos) {
      for (const caso of bloco.casos_clinicos) {
        if (!caso.caso_id || !caso.titulo) {
          casos_orfaos.push(`${bloco.resumo_id}/${caso.caso_id}`)
        }
      }
    }

    // Validar conexões
    if (bloco.conexoes && 'futuras' in bloco.conexoes) {
      const conn = bloco.conexoes as any
      if (conn.futuras && Array.isArray(conn.futuras)) {
        for (const f of conn.futuras) {
          if (f.bloco_id && !idsValidos.has(f.bloco_id)) {
            conexoes_orfaos.push(`${bloco.resumo_id} → ${f.bloco_id}`)
          }
        }
      }
    }

    // Validar pai-filho
    if (bloco.no_pai_id && !idsValidos.has(bloco.no_pai_id)) {
      invalidas.push(`${bloco.resumo_id}: pai inválido ${bloco.no_pai_id}`)
    }
    if (bloco.nos_filhos_ids) {
      for (const filho of bloco.nos_filhos_ids) {
        if (!idsValidos.has(filho)) {
          invalidas.push(`${bloco.resumo_id}: filho inválido ${filho}`)
        }
      }
    }
  }

  return {
    invalidas,
    flashcards_orfaos,
    casos_orfaos,
    conexoes_orfaos,
  }
}

// ════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE INDEXAÇÃO
// ════════════════════════════════════════════════════════════════════════════

function construirIndices(blocos: BlocoConteudo[]): Indice {
  const por_disciplina = new Map<string, string[]>()
  const por_tags = new Map<string, string[]>()
  const por_id = new Map<string, BlocoConteudo>()
  const por_semestre = new Map<number, string[]>()

  for (const bloco of blocos) {
    // Índice por ID
    por_id.set(bloco.resumo_id, bloco)

    // Índice por disciplina
    const disc = bloco.metadata.disciplina
    if (!por_disciplina.has(disc)) {
      por_disciplina.set(disc, [])
    }
    por_disciplina.get(disc)!.push(bloco.resumo_id)

    // Índice por tags
    for (const tag of bloco.metadata.tags) {
      if (!por_tags.has(tag)) {
        por_tags.set(tag, [])
      }
      por_tags.get(tag)!.push(bloco.resumo_id)
    }

    // Índice por semestre
    const sem = bloco.metadata.semestre
    if (!por_semestre.has(sem)) {
      por_semestre.set(sem, [])
    }
    por_semestre.get(sem)!.push(bloco.resumo_id)
  }

  return { por_disciplina, por_tags, por_id, por_semestre }
}

// ════════════════════════════════════════════════════════════════════════════
// MIGRAÇÃO E GRAVAÇÃO
// ════════════════════════════════════════════════════════════════════════════

/**
 * Integra um lote de blocos ao IndexedDB com validação rigorosa
 */
export async function integrarBlocos(blocos: BlocoConteudo[]): Promise<RelatorioIntegracao> {
  const inicioMs = performance.now()
  const timestamp = new Date().toISOString()

  // 1. VALIDAÇÃO DE IDs
  const validacaoIds = validarIDsUnicos(blocos)
  if (!validacaoIds.unicos) {
    console.warn('[INTEGRACAO] Encontrados IDs duplicados:', validacaoIds.duplicados)
  }

  // 2. VALIDAÇÃO DE REFERÊNCIAS
  const validacaoRefs = validarReferencias(blocos)
  if (validacaoRefs.invalidas.length > 0) {
    console.warn('[INTEGRACAO] Referências inválidas encontradas:', validacaoRefs.invalidas)
  }

  // 3. CONSTRUIR ÍNDICES (em memória)
  const indices = construirIndices(blocos)

  // 4. GRAVAR NO INDEXEDDB
  let blocos_com_erro = 0
  try {
    await db.blocos.bulkPut(blocos)
  } catch (e) {
    console.error('[INTEGRACAO] Erro ao gravar blocos:', e)
    blocos_com_erro = blocos.length
  }

  // 5. CONTABILIZAR CONTEÚDO SECUNDÁRIO
  let totalFlashcards = 0
  let totalCasos = 0
  let totalConexoes = 0
  let totalMidia = 0

  for (const bloco of blocos) {
    if (bloco.flashcards) totalFlashcards += bloco.flashcards.length
    if (bloco.casos_clinicos) totalCasos += bloco.casos_clinicos.length
    if (bloco.conexoes) totalConexoes += bloco.conexoes.length
    if (bloco.midia) totalMidia += bloco.midia.length
  }

  // 6. GRAVAR ÍNDICES COMO METADADOS
  const statusIndices = {
    por_disciplina: indices.por_disciplina.size,
    por_tags: indices.por_tags.size,
    por_id: indices.por_id.size,
    por_semestre: indices.por_semestre.size,
  }

  await setMeta('indices_blocos', statusIndices)
  await setMeta('ultima_integracao', timestamp)

  const performanceMs = performance.now() - inicioMs

  const relatorio: RelatorioIntegracao = {
    blocos_migrados: blocos.length - blocos_com_erro,
    blocos_com_erro,
    flashcards_migrados: totalFlashcards,
    casos_clinicos_migrados: totalCasos,
    conexoes_migradas: totalConexoes,
    midia_migrada: totalMidia,
    ids_unicos: validacaoIds.unicos,
    status_indices: statusIndices,
    performance_ms: performanceMs,
    validacoes: validacaoRefs,
    timestamp,
  }

  if (import.meta.env.DEV) {
    console.info(
      `[ANIMA] Integração completa: ${relatorio.blocos_migrados} blocos, ${totalFlashcards} flashcards, ${performanceMs.toFixed(2)}ms`
    )
  }

  await registrarEvento('integracao', relatorio)

  return relatorio
}

// ════════════════════════════════════════════════════════════════════════════
// BACKUP E EXPORTAÇÃO
// ════════════════════════════════════════════════════════════════════════════

/**
 * Exporta todos os blocos e progresso como JSON para backup
 */
export async function exportarBackup(): Promise<{
  timestamp: string
  blocos: BlocoConteudo[]
  progresso: unknown[]
  indices: Record<string, unknown>
}> {
  const blocos = await db.blocos.toArray()
  const progresso = await db.progresso.toArray()
  const indices = await getMeta<Record<string, unknown>>('indices_blocos')

  const backup = {
    timestamp: new Date().toISOString(),
    blocos,
    progresso,
    indices: indices ?? {},
  }

  // Trigger download no navegador
  if (typeof window !== 'undefined') {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `anima-backup-${backup.timestamp.replace(/[:.]/g, '-')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return backup
}

// ════════════════════════════════════════════════════════════════════════════
// CONSULTAS INDEXADAS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Busca blocos por disciplina usando índice Dexie
 */
export async function buscarPorDisciplina(disciplina: string): Promise<BlocoConteudo[]> {
  return db.blocos.where('metadata.disciplina').equals(disciplina).toArray()
}

/**
 * Busca blocos por tag usando índice Dexie (multi-valor)
 */
export async function buscarPorTag(tag: string): Promise<BlocoConteudo[]> {
  return db.blocos.where('metadata.tags').equals(tag).toArray()
}

/**
 * Busca blocos por semestre usando índice Dexie
 */
export async function buscarPorSemestre(semestre: number): Promise<BlocoConteudo[]> {
  return db.blocos.where('metadata.semestre').equals(semestre).toArray()
}

/**
 * Busca um bloco específico por ID
 */
export async function buscarPorID(id: string): Promise<BlocoConteudo | undefined> {
  return db.blocos.get(id)
}

/**
 * Lista todas as disciplinas no banco
 */
export async function listarDisciplinas(): Promise<string[]> {
  const blocos = await db.blocos.toArray()
  const disciplinas = new Set(blocos.map((b) => b.metadata.disciplina))
  return Array.from(disciplinas).sort()
}

/**
 * Lista todas as tags no banco
 */
export async function listarTags(): Promise<string[]> {
  const blocos = await db.blocos.toArray()
  const tags = new Set<string>()
  for (const bloco of blocos) {
    for (const tag of bloco.metadata.tags) {
      tags.add(tag)
    }
  }
  return Array.from(tags).sort()
}

/**
 * Obtém estatísticas de cobertura
 */
export async function obterEstatisticas(): Promise<{
  total_blocos: number
  total_flashcards: number
  total_casos: number
  total_conexoes: number
  total_midia: number
  disciplinas: number
  tags: number
  semestres: number[]
}> {
  const blocos = await db.blocos.toArray()

  let total_flashcards = 0
  let total_casos = 0
  let total_conexoes = 0
  let total_midia = 0
  const semestres = new Set<number>()

  for (const bloco of blocos) {
    if (bloco.flashcards) total_flashcards += bloco.flashcards.length
    if (bloco.casos_clinicos) total_casos += bloco.casos_clinicos.length
    if (bloco.conexoes) total_conexoes += bloco.conexoes.length
    if (bloco.midia) total_midia += bloco.midia.length
    semestres.add(bloco.metadata.semestre)
  }

  const disciplinas = await listarDisciplinas()
  const tags = await listarTags()

  return {
    total_blocos: blocos.length,
    total_flashcards,
    total_casos,
    total_conexoes,
    total_midia,
    disciplinas: disciplinas.length,
    tags: tags.length,
    semestres: Array.from(semestres).sort((a, b) => a - b),
  }
}
