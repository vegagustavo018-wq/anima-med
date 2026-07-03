import { create } from 'zustand'
import { tocar, type NomeSom } from '@core/anima/som'

export type TipoAnuncio = 'info' | 'sucesso' | 'erro'

export interface Anuncio {
  id: number
  texto: string
  tipo: TipoAnuncio
  icone?: string
}

interface OpcoesAnuncio {
  tipo?: TipoAnuncio
  icone?: string
  duracao?: number // ms; 0 = não some sozinho
  som?: NomeSom | null
}

interface AnuncioState {
  anuncios: Anuncio[]
  anunciar: (texto: string, opts?: OpcoesAnuncio) => number
  remover: (id: number) => void
}

let sequencia = 0
const SOM_PADRAO: Record<TipoAnuncio, NomeSom | null> = {
  info: 'toque',
  sucesso: 'sucesso',
  erro: 'erro',
}

/**
 * Fila de anúncios efêmeros (toasts) com feedback sonoro e leitura por
 * leitores de tela (o container tem aria-live). Uso: `anunciar('Backup salvo')`.
 */
export const useAnuncioStore = create<AnuncioState>((set) => ({
  anuncios: [],
  anunciar: (texto, opts = {}) => {
    const tipo = opts.tipo ?? 'info'
    const id = ++sequencia
    set((s) => ({ anuncios: [...s.anuncios, { id, texto, tipo, icone: opts.icone }] }))
    const som = opts.som === undefined ? SOM_PADRAO[tipo] : opts.som
    if (som) tocar(som)
    const duracao = opts.duracao ?? 3400
    if (duracao > 0) {
      setTimeout(() => {
        set((s) => ({ anuncios: s.anuncios.filter((a) => a.id !== id) }))
      }, duracao)
    }
    return id
  },
  remover: (id) => set((s) => ({ anuncios: s.anuncios.filter((a) => a.id !== id) })),
}))

/** Atalho fora de componentes React. */
export function anunciar(texto: string, opts?: OpcoesAnuncio): number {
  return useAnuncioStore.getState().anunciar(texto, opts)
}
