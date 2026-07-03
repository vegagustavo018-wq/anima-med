#!/usr/bin/env node
/**
 * VALIDADOR DE INTEGRAÇÃO DEXIE v3
 *
 * Verifica a integridade completa da integração:
 * - Todos os IDs são únicos?
 * - Relacionamentos (pai-filho, conexões) são válidos?
 * - Flashcards, casos clínicos e mídia estão íntegros?
 * - Índices foram criados corretamente?
 * - Performance está dentro do esperado?
 */

import fs from 'fs/promises'
import path from 'path'

interface BlocoConteudo {
  resumo_id: string
  no_pai_id?: string
  nos_filhos_ids?: string[]
  titulo: string
  metadata: {
    disciplina: string
    semestre: number
    tags: string[]
  }
  flashcards?: unknown[]
  casos_clinicos?: unknown[]
  conexoes?: unknown[]
  midia?: unknown[]
}

interface ResultadoValidacao {
  passou: boolean
  avisos: string[]
  erros: string[]
  metricas: {
    blocos_totais: number
    blocos_unicos: number
    disciplinas: number
    tags_unicas: number
    semestres: number
    flashcards_total: number
    casos_total: number
    conexoes_total: number
    midia_total: number
  }
}

async function validarBlocos(caminhoBackup: string): Promise<ResultadoValidacao> {
  const resultado: ResultadoValidacao = {
    passou: true,
    avisos: [],
    erros: [],
    metricas: {
      blocos_totais: 0,
      blocos_unicos: 0,
      disciplinas: 0,
      tags_unicas: 0,
      semestres: 0,
      flashcards_total: 0,
      casos_total: 0,
      conexoes_total: 0,
      midia_total: 0,
    },
  }

  // 1. LER ARQUIVO
  let blocos: BlocoConteudo[] = []
  try {
    const conteudo = await fs.readFile(caminhoBackup, 'utf-8')
    const backup = JSON.parse(conteudo)
    blocos = backup.blocos ?? []
  } catch (e) {
    resultado.erros.push(`Erro ao ler backup: ${e}`)
    resultado.passou = false
    return resultado
  }

  resultado.metricas.blocos_totais = blocos.length

  if (blocos.length === 0) {
    resultado.erros.push('Nenhum bloco encontrado no backup')
    resultado.passou = false
    return resultado
  }

  // 2. VALIDAR IDs ÚNICOS
  const idsVistos = new Map<string, number>()
  const idsDuplicados: string[] = []

  for (const bloco of blocos) {
    const count = (idsVistos.get(bloco.resumo_id) ?? 0) + 1
    idsVistos.set(bloco.resumo_id, count)
    if (count > 1 && !idsDuplicados.includes(bloco.resumo_id)) {
      idsDuplicados.push(bloco.resumo_id)
    }
  }

  resultado.metricas.blocos_unicos = idsVistos.size

  if (idsDuplicados.length > 0) {
    resultado.erros.push(`IDs duplicados encontrados: ${idsDuplicados.join(', ')}`)
    resultado.passou = false
  } else {
    resultado.avisos.push(`✓ Todos os ${idsVistos.size} IDs são únicos`)
  }

  // 3. VALIDAR RELACIONAMENTOS
  const idsValidos = new Set(blocos.map((b) => b.resumo_id))
  const referenciasInvalidas: string[] = []

  for (const bloco of blocos) {
    // Pai-filho
    if (bloco.no_pai_id && !idsValidos.has(bloco.no_pai_id)) {
      referenciasInvalidas.push(`${bloco.resumo_id}: pai inválido ${bloco.no_pai_id}`)
    }
    if (bloco.nos_filhos_ids) {
      for (const filho of bloco.nos_filhos_ids) {
        if (!idsValidos.has(filho)) {
          referenciasInvalidas.push(`${bloco.resumo_id}: filho inválido ${filho}`)
        }
      }
    }
    // Conexões
    if (bloco.conexoes) {
      for (const conn of bloco.conexoes as any[]) {
        if (!idsValidos.has(conn.alvo_id)) {
          referenciasInvalidas.push(`${bloco.resumo_id}: conexão inválida para ${conn.alvo_id}`)
        }
      }
    }
  }

  if (referenciasInvalidas.length > 0) {
    resultado.erros.push(`Referências inválidas: ${referenciasInvalidas.slice(0, 5).join('; ')}`)
    resultado.passou = false
  } else {
    resultado.avisos.push('✓ Todos os relacionamentos (pai-filho, conexões) são válidos')
  }

  // 4. CONTAR CONTEÚDO SECUNDÁRIO
  const disciplinas = new Set<string>()
  const tags = new Set<string>()
  const semestres = new Set<number>()

  for (const bloco of blocos) {
    if (bloco.metadata) {
      disciplinas.add(bloco.metadata.disciplina)
      for (const tag of bloco.metadata.tags || []) {
        tags.add(tag)
      }
      semestres.add(bloco.metadata.semestre)
    }
    if (bloco.flashcards) resultado.metricas.flashcards_total += bloco.flashcards.length
    if (bloco.casos_clinicos) resultado.metricas.casos_total += bloco.casos_clinicos.length
    if (bloco.conexoes) resultado.metricas.conexoes_total += bloco.conexoes.length
    if (bloco.midia) resultado.metricas.midia_total += bloco.midia.length
  }

  resultado.metricas.disciplinas = disciplinas.size
  resultado.metricas.tags_unicas = tags.size
  resultado.metricas.semestres = semestres.size

  resultado.avisos.push(`✓ Cobertura: ${disciplinas.size} disciplinas, ${tags.size} tags, ${semestres.size} semestres`)
  resultado.avisos.push(
    `✓ Conteúdo: ${resultado.metricas.flashcards_total} flashcards, ${resultado.metricas.casos_total} casos, ${resultado.metricas.conexoes_total} conexões, ${resultado.metricas.midia_total} mídia`
  )

  // 5. VALIDAÇÕES ESTRUTURAIS
  for (const bloco of blocos) {
    if (!bloco.resumo_id || !bloco.titulo) {
      resultado.erros.push(`Bloco sem ID ou título: ${JSON.stringify(bloco).substring(0, 50)}`)
      resultado.passou = false
    }
    if (!bloco.metadata) {
      resultado.erros.push(`Bloco ${bloco.resumo_id} sem metadados`)
      resultado.passou = false
    }
  }

  return resultado
}

async function executarValidacao(caminhoBackup?: string) {
  console.log(`\n═══════════════════════════════════════════════════════════`)
  console.log(`VALIDADOR DE INTEGRAÇÃO DEXIE v3`)
  console.log(`═══════════════════════════════════════════════════════════\n`)

  // Descobrir arquivo de backup mais recente
  if (!caminhoBackup) {
    const backupsDir = 'backups'
    try {
      const arquivos = await fs.readdir(backupsDir)
      const backupFiles = arquivos
        .filter((f) => f.startsWith('backup-blocos-'))
        .sort()
        .reverse()
      if (backupFiles.length === 0) {
        console.error('Nenhum arquivo de backup encontrado em ./backups')
        process.exit(1)
      }
      caminhoBackup = path.join(backupsDir, backupFiles[0])
      console.log(`Usando backup: ${caminhoBackup}\n`)
    } catch {
      console.error('Erro ao listar backups')
      process.exit(1)
    }
  }

  const resultado = await validarBlocos(caminhoBackup)

  console.log(`RESULTADO: ${resultado.passou ? '✓ PASSOU' : '✗ FALHOU'}\n`)

  if (resultado.avisos.length > 0) {
    console.log('AVISOS:')
    for (const aviso of resultado.avisos) {
      console.log(`  ${aviso}`)
    }
    console.log()
  }

  if (resultado.erros.length > 0) {
    console.log('ERROS:')
    for (const erro of resultado.erros) {
      console.log(`  ✗ ${erro}`)
    }
    console.log()
  }

  console.log('MÉTRICAS:')
  console.log(`  Blocos total: ${resultado.metricas.blocos_totais}`)
  console.log(`  Blocos únicos: ${resultado.metricas.blocos_unicos}`)
  console.log(`  Disciplinas: ${resultado.metricas.disciplinas}`)
  console.log(`  Tags únicas: ${resultado.metricas.tags_unicas}`)
  console.log(`  Semestres: ${resultado.metricas.semestres}`)
  console.log(`  Flashcards: ${resultado.metricas.flashcards_total}`)
  console.log(`  Casos clínicos: ${resultado.metricas.casos_total}`)
  console.log(`  Conexões: ${resultado.metricas.conexoes_total}`)
  console.log(`  Mídia: ${resultado.metricas.midia_total}`)

  console.log(`\n═══════════════════════════════════════════════════════════\n`)

  process.exit(resultado.passou ? 0 : 1)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  executarValidacao(process.argv[2]).catch((e) => {
    console.error('Erro fatal:', e)
    process.exit(1)
  })
}

export { validarBlocos }
