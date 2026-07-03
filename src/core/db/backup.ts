import { db, getMeta, setMeta } from './database'

// Alinhado à versão do Dexie (database.ts) — antes estava em 3 (defasado),
// o que tornava o campo enganoso. É a versão de FORMA do payload de backup.
const SCHEMA_VERSION = 5

// Tabelas de DADOS DO ALUNO (sagrados). NÃO inclui `blocos`/`meta` (acervo/infra)
// nem `eventos` (telemetria local, não autoral). Antes só progresso+duvidas eram
// salvos — o resto se perdia silenciosamente num reset ou troca de aparelho.
const TABELAS_ALUNO = [
  'progresso',
  'duvidas',
  'checkins',
  'descobertas',
  'diarios',
  'sessaoConfig',
  'provas',
  'sinteses',
  'progressoQuestao',
] as const

// Tabelas com PK auto-incremento (++id): no import, o id do backup NÃO é
// confiável (colide com ids locais). Estas são inseridas sem id + dedup.
const TABELAS_INCREMENTAIS = new Set<string>([
  'duvidas',
  'checkins',
  'descobertas',
  'provas',
  'sinteses',
])

// Epoch em ms de uma data ISO; 0 se ausente/inválida (comparação numérica robusta).
function tsEpoch(iso: string | undefined | null): number {
  if (!iso) return 0
  const t = new Date(iso).getTime()
  return Number.isNaN(t) ? 0 : t
}

export interface BackupProgresso {
  tipo: 'anima-progresso'
  schema_version: number
  exportado_em: string
  tabelas: Record<string, unknown[]>
}

// ── Export do ESTUDANTE (todos os dados autorais) ────────────────────────────
export async function exportarProgresso(): Promise<BackupProgresso> {
  const tabelas: Record<string, unknown[]> = {}
  for (const nome of TABELAS_ALUNO) {
    try {
      tabelas[nome] = await db.table(nome).toArray()
    } catch {
      tabelas[nome] = []
    }
  }
  return {
    tipo: 'anima-progresso',
    schema_version: SCHEMA_VERSION,
    exportado_em: new Date().toISOString(),
    tabelas,
  }
}

export async function baixarBackup(): Promise<void> {
  const backup = await exportarProgresso()
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `anima-organismo-${backup.exportado_em.slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Import com validação e merge por recência ────────────────────────────────
export interface ResultadoImport {
  ok: boolean
  mensagem: string
  restaurados: number
}

interface BackupCompat {
  tipo?: string
  tabelas?: Record<string, unknown[]>
  progresso?: unknown[] // legado (schema_version ≤ 2)
  duvidas?: unknown[]
}

export async function importarProgresso(json: unknown): Promise<ResultadoImport> {
  const b = json as BackupCompat
  if (!b || b.tipo !== 'anima-progresso') {
    return { ok: false, mensagem: 'Arquivo não é um backup ANIMA válido.', restaurados: 0 }
  }
  // aceita formato novo (.tabelas) e o legado (.progresso/.duvidas no topo)
  const tabelas: Record<string, unknown[]> = b.tabelas ? { ...b.tabelas } : {}
  if (!b.tabelas) {
    if (Array.isArray(b.progresso)) tabelas.progresso = b.progresso
    if (Array.isArray(b.duvidas)) tabelas.duvidas = b.duvidas
  }
  if (!Array.isArray(tabelas.progresso)) {
    return { ok: false, mensagem: 'Backup sem dados de progresso.', restaurados: 0 }
  }

  let restaurados = 0
  await db.transaction(
    'rw',
    TABELAS_ALUNO.map((t) => db.table(t)),
    async () => {
      for (const nome of TABELAS_ALUNO) {
        const linhas = tabelas[nome]
        if (!Array.isArray(linhas) || linhas.length === 0) continue
        if (nome === 'progresso' || nome === 'progressoQuestao') {
          // merge por recência (chave natural): NUNCA sobrescrever um registro
          // local mais novo que o do backup. Vale p/ progresso (resumo_id) e
          // progressoQuestao (questao_id) — ambos têm atualizado_em.
          const pk = nome === 'progresso' ? 'resumo_id' : 'questao_id'
          const atuais = new Map(
            (await db.table(nome).toArray()).map((p) => [
              (p as Record<string, string>)[pk],
              tsEpoch((p as { atualizado_em?: string }).atualizado_em),
            ])
          )
          const aGravar = (linhas as Record<string, string>[]).filter((p) => {
            const atualEm = atuais.get(p[pk])
            // preserva o LOCAL em empate (>): backup só grava se for ESTRITAMENTE mais novo
            return atualEm === undefined || tsEpoch(p.atualizado_em) > atualEm
          })
          await db.table(nome).bulkPut(aGravar)
          restaurados += aGravar.length
        } else if (TABELAS_INCREMENTAIS.has(nome)) {
          // tabelas ++id: NUNCA gravar com o id sintético do backup — colisão de
          // auto-increment sobrescreveria registros locais diferentes. Insere SEM
          // id (Dexie realoca) e deduplica por conteúdo p/ não duplicar em re-import.
          const existentes = await db.table(nome).toArray()
          const assinatura = (r: Record<string, unknown>) => {
            const { id: _id, ...resto } = r
            return JSON.stringify(resto)
          }
          const jaTem = new Set(existentes.map((r) => assinatura(r as Record<string, unknown>)))
          const novos = (linhas as Record<string, unknown>[])
            .filter((r) => !jaTem.has(assinatura(r)))
            .map((r) => {
              const { id: _id, ...resto } = r
              return resto
            })
          if (novos.length) await db.table(nome).bulkAdd(novos)
          restaurados += novos.length
        } else {
          // chave natural (diarios=data, sessaoConfig=chave): sobrescrever é o merge correto
          await db.table(nome).bulkPut(linhas)
          restaurados += linhas.length
        }
      }
    }
  )
  return { ok: true, mensagem: 'Seus dados foram restaurados.', restaurados }
}

// ── Snapshot automático rotativo (defesa barata contra perda) ────────────────
const MAX_SNAPSHOTS = 5
const INTERVALO_SNAPSHOT_MS = 5 * 60 * 1000 // no máximo 1 snapshot a cada 5 min
let ultimoSnapshot = 0

/**
 * Chamado após cada revisão. Antes: serializava TODAS as tabelas do aluno a
 * cada card — dezenas de exports completos por sessão de estudo. Agora é
 * throttled: no máximo um snapshot a cada 5 min. `forcar` ignora o intervalo
 * (ex.: ao fechar a sessão ou antes de uma importação).
 */
export async function snapshotAutomatico(forcar = false): Promise<void> {
  const agora = Date.now()
  if (!forcar && agora - ultimoSnapshot < INTERVALO_SNAPSHOT_MS) return
  ultimoSnapshot = agora
  try {
    const backup = await exportarProgresso()
    if ((backup.tabelas.progresso?.length ?? 0) === 0) return // nada a salvar ainda
    const snaps = (await getMeta<BackupProgresso[]>('snapshots')) ?? []
    snaps.unshift(backup)
    await setMeta('snapshots', snaps.slice(0, MAX_SNAPSHOTS))
  } catch {
    // snapshot nunca deve quebrar o app
  }
}

export async function listarSnapshots(): Promise<BackupProgresso[]> {
  return (await getMeta<BackupProgresso[]>('snapshots')) ?? []
}
