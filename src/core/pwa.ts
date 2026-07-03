import { registerSW } from 'virtual:pwa-register'

/**
 * Registra o service worker do PWA. Sem isto o app não instala nem funciona
 * offline. registerType='prompt' no vite.config → oferecemos atualização em vez
 * de recarregar sozinhos (não perder trabalho em andamento).
 */
let atualizar: ((recarregar?: boolean) => Promise<void>) | null = null
const ouvintes = new Set<(estado: EstadoSW) => void>()

export type EstadoSW = 'inicial' | 'offline_pronto' | 'atualizacao_disponivel'
let estadoAtual: EstadoSW = 'inicial'

function emitir(estado: EstadoSW) {
  estadoAtual = estado
  for (const fn of ouvintes) fn(estado)
}

export function registrarSW(): void {
  if (typeof window === 'undefined') return
  atualizar = registerSW({
    immediate: true,
    onOfflineReady() {
      emitir('offline_pronto')
    },
    onNeedRefresh() {
      emitir('atualizacao_disponivel')
    },
  })
}

/** Aplica a atualização pendente (recarrega com o SW novo). */
export function aplicarAtualizacao(): void {
  void atualizar?.(true)
}

/** Assina mudanças de estado do SW (para uma UI de "atualização disponível"). */
export function ouvirSW(fn: (estado: EstadoSW) => void): () => void {
  ouvintes.add(fn)
  fn(estadoAtual)
  return () => ouvintes.delete(fn)
}
