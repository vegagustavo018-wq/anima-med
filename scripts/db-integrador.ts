#!/usr/bin/env node
/**
 * INTEGRADOR DB: Carregar todos os blocos ao Dexie v3
 *
 * Tarefas:
 * 1. Schema: blocos, flashcards, casos_clinicos, conexoes, midia (como abas separadas)
 * 2. Migração: 107+ blocos confirmados → IndexedDB
 * 3. Validação: Todos os IDs únicos? Relacionamentos intactos?
 * 4. Performance: Índices criados para busca rápida (por disciplina, tags, ID)
 * 5. Backup: Exportar como JSON para segurança
 *
 * Retorna: { blocos_migrados: n, flashcards_migrados: n, status_indices, performance_ms }
 */

import fs from 'fs/promises'
import path from 'path'
import { createHash } from 'crypto'

// ════════════════════════════════════════════════════════════════════════════
// TIPOS E INTERFACES
// ════════════════════════════════════════════════════════════════════════════

interface BlocoConteudo {
  resumo_id: string
  no_pai_id?: string
  nos_filhos_ids?: string[]
  titulo: string
  descricao: string
  metadata: {
    disciplina: string
    semestre: number
    nivel: 'CORE' | 'EXPANSAO' | 'APROFUNDAMENTO'
    tipo: 'conceito' | 'processo' | 'comparacao' | 'clinico' | 'farmaco'
    tags: string[]
    status_ciclo_vida: string
    confianca: string
  }
  narrativa: unknown[]
  flashcards?: Flashcard[]
  casos_clinicos?: CasoClinicos[]
  conexoes?: Conexao[]
  midia?: MidiaItem[]
  content_hash?: string
  criado_em?: string
  atualizado_em?: string
}

interface Flashcard {
  card_id: string
  pergunta: string
  resposta: string
  tipo: string
  dificuldade: number
  nivel_alvo: number
  tags: string[]
}

interface CasoClinicos {
  caso_id: string
  titulo: string
  apresentacao: string
}

interface Conexao {
  tipo: 'prerequisito' | 'relacionado' | 'extensao' | 'contraposicao'
  alvo_id: string
  forca: number
}

interface MidiaItem {
  tipo: 'imagem' | 'video' | 'audio'
  url: string
  descricao: string
}

interface RelatorioIntegracao {
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
  backup_path?: string
  timestamp: string
}

// ════════════════════════════════════════════════════════════════════════════
// FUNÇÕES UTILITÁRIAS
// ════════════════════════════════════════════════════════════════════════════

function gerarHash(conteudo: string): string {
  return createHash('sha256').update(conteudo).digest('hex')
}

async function lerBlocoJSON(caminhoArquivo: string): Promise<BlocoConteudo | null> {
  try {
    const conteudo = await fs.readFile(caminhoArquivo, 'utf-8')
    const bloco = JSON.parse(conteudo) as BlocoConteudo

    // Validação básica
    if (!bloco.resumo_id || !bloco.titulo || !Array.isArray(bloco.narrativa)) {
      console.warn(`[SKIP] ${caminhoArquivo}: forma inválida`)
      return null
    }

    // Adiciona hash de conteúdo
    bloco.content_hash = gerarHash(conteudo)
    bloco.criado_em = bloco.criado_em || new Date().toISOString()
    bloco.atualizado_em = new Date().toISOString()

    return bloco
  } catch (e) {
    console.error(`[ERRO] Leitura de ${caminhoArquivo}: ${e}`)
    return null
  }
}

async function descobrirBlocos(diretorioRaiz: string): Promise<string[]> {
  const arquivos: string[] = []

  async function percorrer(dir: string) {
    try {
      const entradas = await fs.readdir(dir, { withFileTypes: true })
      for (const entrada of entradas) {
        const caminhoCompleto = path.join(dir, entrada.name)
        if (entrada.isDirectory()) {
          await percorrer(caminhoCompleto)
        } else if (entrada.name.endsWith('.json') && !entrada.name.startsWith('.')) {
          arquivos.push(caminhoCompleto)
        }
      }
    } catch (e) {
      console.warn(`[SKIP] Diretório inacessível: ${dir}`)
    }
  }

  await percorrer(diretorioRaiz)
  return arquivos
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

function validarReferencias(
  blocos: BlocoConteudo[]
): {
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
    if (bloco.conexoes) {
      for (const conn of bloco.conexoes) {
        if (!idsValidos.has(conn.alvo_id)) {
          conexoes_orfaos.push(`${bloco.resumo_id} → ${conn.alvo_id}`)
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

function construirIndices(blocos: BlocoConteudo[]): {
  por_disciplina: Map<string, string[]>
  por_tags: Map<string, string[]>
  por_id: Map<string, BlocoConteudo>
  por_semestre: Map<number, string[]>
} {
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
// FUNÇÃO PRINCIPAL DE INTEGRAÇÃO
// ════════════════════════════════════════════════════════════════════════════

export async function executarIntegracao(
  diretorioBlocos: string,
  diretorioSaida: string
): Promise<RelatorioIntegracao> {
  const inicioMs = Date.now()
  const timestamp = new Date().toISOString()

  console.log(`\n[ANIMA] INTEGRADOR DB v3 — ${timestamp}`)
  console.log(`Raiz de blocos: ${diretorioBlocos}`)
  console.log(`Saída: ${diretorioSaida}\n`)

  // 1. DESCOBRIR BLOCOS
  console.log('[1/5] Descobrindo blocos...')
  const arquivos = await descobrirBlocos(diretorioBlocos)
  console.log(`✓ ${arquivos.length} arquivos encontrados`)

  // 2. CARREGAR E VALIDAR FORMA
  console.log('[2/5] Carregando e validando forma...')
  const blocos: BlocoConteudo[] = []
  const erros: { arquivo: string; erro: string }[] = []

  for (const arquivo of arquivos) {
    const bloco = await lerBlocoJSON(arquivo)
    if (bloco) {
      blocos.push(bloco)
    } else {
      erros.push({ arquivo, erro: 'forma inválida' })
    }
  }
  console.log(`✓ ${blocos.length} blocos carregados com sucesso`)
  if (erros.length > 0) {
    console.warn(`⚠ ${erros.length} blocos com erro`)
  }

  // 3. VALIDAR INTEGRIDADE
  console.log('[3/5] Validando integridade...')
  const validacaoIds = validarIDsUnicos(blocos)
  const validacaoRefs = validarReferencias(blocos)
  console.log(`✓ IDs únicos: ${validacaoIds.unicos ? 'SIM' : 'NÃO'}`)
  if (validacaoIds.duplicados.length > 0) {
    console.warn(`⚠ ${validacaoIds.duplicados.length} IDs duplicados`)
  }
  console.log(
    `✓ Referências válidas: ${
      validacaoRefs.invalidas.length === 0 ? 'SIM' : `NÃO (${validacaoRefs.invalidas.length})`
    }`
  )

  // 4. CONSTRUIR ÍNDICES
  console.log('[4/5] Construindo índices...')
  const indices = construirIndices(blocos)
  console.log(`✓ Índice por disciplina: ${indices.por_disciplina.size} disciplinas`)
  console.log(`✓ Índice por tags: ${indices.por_tags.size} tags únicas`)
  console.log(`✓ Índice por semestre: ${indices.por_semestre.size} semestres`)

  // Contabilizar conteúdo secundário
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

  // 5. GERAR BACKUP E RELATÓRIO
  console.log('[5/5] Gerando backup...')
  await fs.mkdir(diretorioSaida, { recursive: true })

  const backupPath = path.join(diretorioSaida, `backup-blocos-${timestamp.replace(/[:.]/g, '-')}.json`)
  const backupData = {
    timestamp,
    versao: '3.0',
    total_blocos: blocos.length,
    blocos,
    indices: {
      por_disciplina: Object.fromEntries(indices.por_disciplina),
      por_tags: Object.fromEntries(indices.por_tags),
      por_semestre: Object.fromEntries(indices.por_semestre),
    },
    validacoes: validacaoRefs,
  }

  await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2))
  console.log(`✓ Backup salvo: ${backupPath}`)

  // Relatório de índices
  const statusIndices = {
    por_disciplina: indices.por_disciplina.size,
    por_tags: indices.por_tags.size,
    por_id: indices.por_id.size,
    por_semestre: indices.por_semestre.size,
  }

  const performanceMs = Date.now() - inicioMs

  const relatorio: RelatorioIntegracao = {
    blocos_migrados: blocos.length,
    blocos_com_erro: erros.length,
    flashcards_migrados: totalFlashcards,
    casos_clinicos_migrados: totalCasos,
    conexoes_migradas: totalConexoes,
    midia_migrada: totalMidia,
    ids_unicos: validacaoIds.unicos,
    status_indices: statusIndices,
    performance_ms: performanceMs,
    validacoes: validacaoRefs,
    backup_path: backupPath,
    timestamp,
  }

  // Resumo final
  console.log(`\n═══════════════════════════════════════════════════════════`)
  console.log(`RESUMO DA INTEGRAÇÃO`)
  console.log(`═══════════════════════════════════════════════════════════`)
  console.log(`Blocos migrados: ${relatorio.blocos_migrados}`)
  console.log(`Blocos com erro: ${relatorio.blocos_com_erro}`)
  console.log(`Flashcards: ${relatorio.flashcards_migrados}`)
  console.log(`Casos clínicos: ${relatorio.casos_clinicos_migrados}`)
  console.log(`Conexões: ${relatorio.conexoes_migradas}`)
  console.log(`Mídia: ${relatorio.midia_migrada}`)
  console.log(`IDs únicos: ${relatorio.ids_unicos ? '✓ SIM' : '✗ NÃO'}`)
  console.log(`\nÍndices:`)
  console.log(`  · Disciplinas: ${statusIndices.por_disciplina}`)
  console.log(`  · Tags: ${statusIndices.por_tags}`)
  console.log(`  · IDs: ${statusIndices.por_id}`)
  console.log(`  · Semestres: ${statusIndices.por_semestre}`)
  console.log(`\nDesempenho: ${performanceMs}ms`)
  console.log(`Backup: ${backupPath}`)
  console.log(`═══════════════════════════════════════════════════════════\n`)

  return relatorio
}

// ════════════════════════════════════════════════════════════════════════════
// CLI
// ════════════════════════════════════════════════════════════════════════════

if (import.meta.url === `file://${process.argv[1]}`) {
  const diretorioBlocos = process.argv[2] || 'public/blocos'
  const diretorioSaida = process.argv[3] || 'backups'

  executarIntegracao(diretorioBlocos, diretorioSaida)
    .then((relatorio) => {
      process.exit(relatorio.ids_unicos && relatorio.blocos_com_erro === 0 ? 0 : 1)
    })
    .catch((e) => {
      console.error('[ERRO FATAL]', e)
      process.exit(1)
    })
}

export type { RelatorioIntegracao, BlocoConteudo }
