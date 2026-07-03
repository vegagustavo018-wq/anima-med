import { ingerirBlocos } from './ingest'
import { carregarBancoQuestoes } from './questoes'
import { garantirPersistencia } from './storage'
import { snapshotAutomatico } from './backup'
import { registrarEvento } from './database'

let bootPromise: Promise<void> | null = null

/**
 * Inicialização do organismo. Roda uma vez por sessão:
 * 1. Garante persistência do armazenamento (progresso não pode ser despejado)
 * 2. Ingere blocos do bundle (idempotente — só toca o que mudou, nunca o progresso)
 * 3. Faz snapshot automático do progresso
 */
export function bootstrap(): Promise<void> {
  if (bootPromise) return bootPromise
  bootPromise = (async () => {
    const status = await garantirPersistencia()
    const rel = await ingerirBlocos()
    const banco = await carregarBancoQuestoes()
    await snapshotAutomatico()
    await registrarEvento('boot', { persistente: status.persistente, ingestao: rel, questoes: banco })
    if (import.meta.env.DEV) {
      console.info(
        `[ANIMA] boot · ${rel.total} blocos (${rel.criados} novos, ${rel.atualizados} atualizados, ${rel.inalterados} iguais) · ${banco.total} questões${banco.recarregado ? ' (recarregadas)' : ''} · persistência: ${status.persistente}`
      )
      if (rel.erros.length) console.warn('[ANIMA] erros de ingestão:', rel.erros)
    }
  })()
  return bootPromise
}
