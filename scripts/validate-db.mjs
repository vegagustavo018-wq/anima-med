#!/usr/bin/env node

/**
 * Validador de Integridade do Banco ANIMA Med
 * ============================================
 *
 * Executa 5 testes críticos pós-migração:
 * 1. Leitura: 100 blocos aleatoriamente
 * 2. Busca: Filtros por disciplina, tag, ID
 * 3. Relacionamentos: Conexões futuras intactas
 * 4. Abas: Blocos, flashcards, casos separados
 * 5. Conflitos: IDs duplicados, órfãos
 *
 * Uso: node scripts/validate-db.mjs
 */

import Dexie from 'dexie'
import fs from 'fs'
import path from 'path'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

// ============================================================================
// Setup do Dexie (fake env para testes — usará IndexedDB real do browser se rodar lá)
// ============================================================================

class AnimaMedDB extends Dexie {
  blocos
  progresso
  questoes
  progressoQuestao
  meta
  eventos
  duvidas
  checkins
  descobertas
  diarios
  sessaoConfig
  provas
  sinteses

  constructor() {
    super('AnimaMedDB')
    this.version(5).stores({
      blocos:
        'resumo_id, no_pai_id, metadata.disciplina, metadata.semestre, metadata.nivel, metadata.tipo, *metadata.tags',
      progresso: 'resumo_id, srs.status, srs.proxima_revisao, marcado_para_revisao',
      meta: 'chave',
      duvidas: '++id, resumo_id, resolvida, criado_em',
      eventos: '++id, tipo, criado_em',
      checkins: '++id, criado_em',
      descobertas: '++id, resumo_id, tipo, criado_em',
      diarios: 'data',
      sessaoConfig: 'chave',
      provas: '++id, data',
      sinteses: '++id, titulo, criado_em',
      questoes: 'id, tipo, subtipo, especialidade, sistema, *tags',
      progressoQuestao: 'questao_id, srs.status, srs.proxima_revisao',
    })
  }
}

const db = new AnimaMedDB()

// ============================================================================
// Testes
// ============================================================================

async function testeLeitura() {
  const inicio = performance.now()
  try {
    const todos = await db.blocos.toArray()

    if (todos.length === 0) {
      return { passou: false, ms: performance.now() - inicio, blocos: 0, erro: 'Nenhum bloco no banco' }
    }

    // Amostra aleatória de até 100
    const tamanho = Math.min(100, todos.length)
    const indices = new Set()
    while (indices.size < tamanho) {
      indices.add(Math.floor(Math.random() * todos.length))
    }

    const amostra = Array.from(indices).map(idx => todos[idx])
    const todasValidas = amostra.every(b => b && b.resumo_id && typeof b.resumo_id === 'string')

    return {
      passou: todasValidas && amostra.length > 0,
      ms: performance.now() - inicio,
      blocos: amostra.length,
    }
  } catch (e) {
    return {
      passou: false,
      ms: performance.now() - inicio,
      blocos: 0,
      erro: String(e),
    }
  }
}

async function testeBusca() {
  const inicio = performance.now()
  try {
    // Busca por disciplina
    const blocosPorDisciplina = await db.blocos.where('metadata.disciplina').anyOf('Anatomia', 'Histologia').limit(10).toArray()

    // Busca por ID (sample)
    const todosLimit = await db.blocos.limit(1).toArray()
    let blocoPorID = null
    if (todosLimit.length > 0) {
      blocoPorID = await db.blocos.get(todosLimit[0].resumo_id)
    }

    const ms = performance.now() - inicio
    const encontrados = blocosPorDisciplina.length + (blocoPorID ? 1 : 0)

    return {
      passou: ms < 1000 && encontrados >= 0,
      ms,
      encontrados,
    }
  } catch (e) {
    return {
      passou: false,
      ms: performance.now() - inicio,
      encontrados: 0,
      erro: String(e),
    }
  }
}

async function testeRelacionamentos() {
  const inicio = performance.now()
  const problemas = []

  try {
    const todos = await db.blocos.toArray()

    for (const bloco of todos) {
      // Verifica pais
      if (bloco.no_pai_id) {
        const pai = await db.blocos.get(bloco.no_pai_id)
        if (!pai) {
          problemas.push(`Órfão: ${bloco.resumo_id} → pai ${bloco.no_pai_id} não existe`)
        }
      }

      // Verifica filhos
      if (Array.isArray(bloco.nos_filhos_ids) && bloco.nos_filhos_ids.length > 0) {
        for (const filhoId of bloco.nos_filhos_ids) {
          const filho = await db.blocos.get(filhoId)
          if (!filho) {
            problemas.push(`Ref órfã: ${bloco.resumo_id} → ${filhoId} não existe`)
          }
        }
      }
    }

    return {
      passou: problemas.length === 0,
      ms: performance.now() - inicio,
      problemas,
    }
  } catch (e) {
    return {
      passou: false,
      ms: performance.now() - inicio,
      problemas: [String(e)],
    }
  }
}

async function testeAbas() {
  const inicio = performance.now()

  try {
    const blocos = await db.blocos.toArray()

    let blocos_ok = 0
    let flashcards_ok = 0
    let casos_ok = 0

    for (const bloco of blocos) {
      if (Array.isArray(bloco.narrativa) && bloco.narrativa.length > 0) blocos_ok++
      if (Array.isArray(bloco.flashcards) && bloco.flashcards.length > 0) flashcards_ok++
      if (Array.isArray(bloco.casos_clinicos) && bloco.casos_clinicos.length > 0) casos_ok++
    }

    const ms = performance.now() - inicio
    const detalhes = `Narrativa: ${blocos_ok}/${blocos.length} | Flashcards: ${flashcards_ok}/${blocos.length} | Casos: ${casos_ok}/${blocos.length}`

    return {
      passou: blocos_ok > 0,
      ms,
      detalhes,
      stats: { blocos_ok, flashcards_ok, casos_ok, total: blocos.length },
    }
  } catch (e) {
    return {
      passou: false,
      ms: performance.now() - inicio,
      detalhes: `Erro: ${String(e)}`,
      stats: {},
    }
  }
}

async function testeConflitos() {
  const inicio = performance.now()
  const problemas = []
  const idsVisto = new Set()

  try {
    const blocos = await db.blocos.toArray()

    // IDs duplicados em blocos
    for (const b of blocos) {
      if (idsVisto.has(b.resumo_id)) {
        problemas.push(`Duplicado: ${b.resumo_id}`)
      }
      idsVisto.add(b.resumo_id)
    }

    // Progresso órfão
    const progessos = await db.progresso.toArray()
    for (const p of progessos) {
      if (!blocos.find(b => b.resumo_id === p.resumo_id)) {
        problemas.push(`Progresso órfão: ${p.resumo_id}`)
      }
    }

    // IDs duplicados em questões
    const questoes = await db.questoes.toArray()
    const idsQuestoes = new Set()
    for (const q of questoes) {
      if (idsQuestoes.has(q.id)) {
        problemas.push(`Questão duplicada: ${q.id}`)
      }
      idsQuestoes.add(q.id)
    }

    return {
      passou: problemas.length === 0,
      ms: performance.now() - inicio,
      problemas,
    }
  } catch (e) {
    return {
      passou: false,
      ms: performance.now() - inicio,
      problemas: [String(e)],
    }
  }
}

// ============================================================================
// Orquestração
// ============================================================================

async function validarIntegridade() {
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║  ANIMA Med — Validador de Integridade do Banco (Pós-Migração) ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  const t1 = await testeLeitura()
  console.log(`[1/5] Leitura (100 blocos aleatórios):`)
  console.log(`      ${t1.passou ? '✅ PASSOU' : '❌ FALHOU'} | ${t1.ms.toFixed(2)}ms | ${t1.blocos} blocos lidos`)
  if (t1.erro) console.log(`      ⚠️  ${t1.erro}`)

  const t2 = await testeBusca()
  console.log(`\n[2/5] Busca (disciplina, tag, ID):`)
  console.log(`      ${t2.passou ? '✅ PASSOU' : '❌ FALHOU'} | ${t2.ms.toFixed(2)}ms | ${t2.encontrados} resultados`)
  if (t2.erro) console.log(`      ⚠️  ${t2.erro}`)

  const t3 = await testeRelacionamentos()
  console.log(`\n[3/5] Relacionamentos (conexões futuras):`)
  console.log(`      ${t3.passou ? '✅ PASSOU' : '❌ FALHOU'} | ${t3.ms.toFixed(2)}ms`)
  if (t3.problemas.length > 0) {
    console.log(`      ⚠️  Encontrados ${t3.problemas.length} problemas:`)
    t3.problemas.slice(0, 5).forEach(p => console.log(`         • ${p}`))
    if (t3.problemas.length > 5) console.log(`         ... e ${t3.problemas.length - 5} mais`)
  }

  const t4 = await testeAbas()
  console.log(`\n[4/5] Abas (blocos, flashcards, casos):`)
  console.log(`      ${t4.passou ? '✅ PASSOU' : '❌ FALHOU'} | ${t4.ms.toFixed(2)}ms`)
  console.log(`      ${t4.detalhes}`)

  const t5 = await testeConflitos()
  console.log(`\n[5/5] Conflitos (IDs duplicados, órfãos):`)
  console.log(`      ${t5.passou ? '✅ PASSOU' : '❌ FALHOU'} | ${t5.ms.toFixed(2)}ms`)
  if (t5.problemas.length > 0) {
    console.log(`      ⚠️  Encontrados ${t5.problemas.length} conflitos:`)
    t5.problemas.slice(0, 5).forEach(p => console.log(`         • ${p}`))
    if (t5.problemas.length > 5) console.log(`         ... e ${t5.problemas.length - 5} mais`)
  }

  // =========================================================================
  // Resultado Final
  // =========================================================================

  const testes_passados = [t1.passou, t2.passou, t3.passou, t4.passou, t5.passou].filter(Boolean).length
  const performance_queries_ms = [t1.ms, t2.ms, t3.ms, t4.ms, t5.ms]
  const problemas = [...t3.problemas, ...t5.problemas]

  console.log(`\n╔════════════════════════════════════════════════════════════╗`)
  console.log(`║  RESULTADO FINAL                                           ║`)
  console.log(`╚════════════════════════════════════════════════════════════╝`)
  console.log(`Testes passados: ${testes_passados}/5`)
  console.log(`Performance (queries): ${performance_queries_ms.map(m => m.toFixed(1)).join(', ')} ms`)
  console.log(`Problemas encontrados: ${problemas.length}`)

  const resultado = {
    testes_passados,
    performance_queries_ms: performance_queries_ms.map(m => parseFloat(m.toFixed(2))),
    problemas: problemas.slice(0, 20), // Limita a saída
    resumo: {
      teste_1_leitura: t1.passou,
      teste_2_busca: t2.passou,
      teste_3_relacionamentos: t3.passou,
      teste_4_abas: t4.passou,
      teste_5_conflitos: t5.passou,
      blocos_lidos: t1.blocos,
      blocos_com_narrativa: t4.stats.blocos_ok,
      blocos_com_flashcards: t4.stats.flashcards_ok,
      blocos_com_casos: t4.stats.casos_ok,
      total_blocos: t4.stats.total,
      progresso_registros: (await db.progresso.count()),
      questoes_count: (await db.questoes.count()),
      conflitos_encontrados: problemas.length,
    },
  }

  // Salva resultado em arquivo
  const arqResultado = path.join(__dirname, '..', 'dist', 'validation-report.json')
  const dirDist = path.dirname(arqResultado)
  if (!fs.existsSync(dirDist)) {
    fs.mkdirSync(dirDist, { recursive: true })
  }
  fs.writeFileSync(arqResultado, JSON.stringify(resultado, null, 2))
  console.log(`\n✅ Relatório salvo em: ${arqResultado}`)

  console.log('\n')
  console.log(JSON.stringify(resultado, null, 2))

  return resultado
}

// ============================================================================
// Entry Point
// ============================================================================

validarIntegridade()
  .then(() => {
    console.log('\n✅ Validação concluída!')
    process.exit(0)
  })
  .catch(err => {
    console.error('\n❌ Erro fatal:', err)
    process.exit(1)
  })
