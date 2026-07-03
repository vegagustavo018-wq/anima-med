import Dexie, { type EntityTable } from 'dexie'
import type {
  BlocoConteudo,
  ProgressoBloco,
  Duvida,
  CheckIn,
  Descoberta,
  EntradaDiario,
  ConfigSessao,
  Prova,
  Sintese,
} from '@core/types/schema'
import type { ItemQuestao, ProgressoQuestao } from '@core/types/questoes'

// Registro de metadados do app (versões, manifesto de ingestão, snapshots)
export interface MetaRegistro {
  chave: string
  valor: unknown
}

// Evento de telemetria pessoal (local — nunca sai do dispositivo)
export interface Evento {
  id?: number
  tipo: string
  dados?: unknown
  criado_em: string
}

interface AnimaDB {
  blocos: EntityTable<BlocoConteudo, 'resumo_id'>
  progresso: EntityTable<ProgressoBloco, 'resumo_id'>
  meta: EntityTable<MetaRegistro, 'chave'>
  duvidas: EntityTable<Duvida, 'id'>
  eventos: EntityTable<Evento, 'id'>
  checkins: EntityTable<CheckIn, 'id'>
  descobertas: EntityTable<Descoberta, 'id'>
  diarios: EntityTable<EntradaDiario, 'data'>
  sessaoConfig: EntityTable<ConfigSessao, 'chave'>
  provas: EntityTable<Prova, 'id'>
  sinteses: EntityTable<Sintese, 'id'>
  questoes: EntityTable<ItemQuestao, 'id'>
  progressoQuestao: EntityTable<ProgressoQuestao, 'questao_id'>
}

const db = new Dexie('AnimaMedDB') as Dexie & AnimaDB

// ── v1: schema legado (tabela única com progresso acoplado) ──────────────────
db.version(1).stores({
  blocos: [
    'resumo_id',
    'no_pai_id',
    '*nos_filhos_ids',
    'metadata.disciplina',
    'metadata.semestre',
    'metadata.nivel',
    'metadata.tipo',
    '*metadata.tags',
    'metricas_estudo.status',
    'metricas_estudo.proxima_revisao',
  ].join(', '),
})

// ── v2: separação conteúdo/progresso + tabelas de apoio ──────────────────────
db.version(2)
  .stores({
    blocos: [
      'resumo_id',
      'no_pai_id',
      'metadata.disciplina',
      'metadata.semestre',
      'metadata.nivel',
      'metadata.tipo',
      '*metadata.tags',
    ].join(', '),
    progresso: ['resumo_id', 'srs.status', 'srs.proxima_revisao', 'marcado_para_revisao'].join(
      ', '
    ),
    meta: 'chave',
    duvidas: '++id, resumo_id, resolvida, criado_em',
    eventos: '++id, tipo, criado_em',
  })
  .upgrade(async (tx) => {
    // Migração: extrai qualquer progresso que vivia dentro dos blocos antigos
    const agora = new Date().toISOString()
    const antigos = await tx.table('blocos').toArray()
    for (const b of antigos) {
      const m = b.metricas_estudo
      if (m && (m.vezes_lido > 0 || m.ultima_leitura)) {
        await tx.table('progresso').put({
          resumo_id: b.resumo_id,
          vezes_lido: m.vezes_lido ?? 0,
          ultima_leitura: m.ultima_leitura ?? null,
          tempo_total_estudo_minutos: m.tempo_total_estudo_minutos ?? 0,
          marcado_para_revisao: m.marcado_para_revisao ?? false,
          srs: {
            facilidade: m.facilidade ?? 2.5,
            intervalo_dias: m.intervalo_dias ?? 0,
            repeticoes: m.repeticoes ?? 0,
            proxima_revisao: m.proxima_revisao ?? null,
            ultima_revisao: m.ultima_revisao ?? null,
            status: m.status ?? 'novo',
            lapsos: 0,
          },
          srs_cards: {},
          palpites: [],
          auto_avaliacao: m.auto_avaliacao ?? {
            explicar_para_leigo: null,
            prever_sintomas: null,
            aplicar_caso_novo: null,
            conexoes_claras: null,
          },
          calibracao: [],
          notas_do_usuario: m.notas_do_usuario ?? '',
          diario_aprendizagem: m.diario_aprendizagem ?? '',
          destaques: [],
          criado_em: agora,
          atualizado_em: agora,
        })
      }
      // Remove o campo acoplado do bloco
      delete b.metricas_estudo
      await tx.table('blocos').put(b)
    }
  })

// ── v3: bem-estar, crescimento, autoria, produtividade ────────────────────────
db.version(3)
  .stores({
    checkins: '++id, criado_em',
    descobertas: '++id, resumo_id, tipo, criado_em',
    diarios: 'data',
    sessaoConfig: 'chave',
    provas: '++id, data',
  })
  .upgrade(async (tx) => {
    // Compatibiliza registros antigos de progresso sem os novos campos
    const todos = await tx.table('progresso').toArray()
    for (const p of todos) {
      let mudou = false
      if (!Array.isArray(p.historico_revisoes)) {
        p.historico_revisoes = []
        mudou = true
      }
      if (!Array.isArray(p.destaques)) {
        p.destaques = []
        mudou = true
      } else if (p.destaques.some((d: { cor?: string }) => !d.cor)) {
        p.destaques = p.destaques.map((d: { trecho: string; criado_em: string; cor?: string }) => ({
          ...d,
          cor: d.cor ?? 'amarelo',
        }))
        mudou = true
      }
      if (mudou) await tx.table('progresso').put(p)
    }
  })

// ── v4: canvas de síntese ──────────────────────────────────────────────────
db.version(4).stores({
  sinteses: '++id, titulo, criado_em',
})

// ── v5: Questões (banco de MCQ + flashcards) ─────────────────────────────────
// `questoes` = conteúdo regenerável (id natural, ingerido de /questoes/*.json).
// `progressoQuestao` = desempenho do aluno (SAGRADO, chave natural questao_id).
db.version(5).stores({
  questoes: 'id, tipo, subtipo, especialidade, sistema, *tags',
  progressoQuestao: 'questao_id, srs.status, srs.proxima_revisao',
})

export { db }
export type { AnimaDB }

// ── Helpers de meta ──────────────────────────────────────────────────────────
export async function getMeta<T = unknown>(chave: string): Promise<T | undefined> {
  const r = await db.meta.get(chave)
  return r?.valor as T | undefined
}

export async function setMeta(chave: string, valor: unknown): Promise<void> {
  await db.meta.put({ chave, valor })
}

// ── Telemetria pessoal (local) ───────────────────────────────────────────────
export async function registrarEvento(tipo: string, dados?: unknown): Promise<void> {
  try {
    await db.eventos.add({ tipo, dados, criado_em: new Date().toISOString() })
  } catch {
    // telemetria nunca deve quebrar o app
  }
}
