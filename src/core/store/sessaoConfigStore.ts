import { create } from 'zustand'
import { db } from '@core/db/database'
import type { ConfigSessao, PresetSessao } from '@core/types/schema'

export const PRESETS: Record<PresetSessao, { label: string; retencao_alvo: number; teto_cards_dia: number | null; descricao: string }> = {
  prova: { label: 'Modo Prova', retencao_alvo: 0.97, teto_cards_dia: null, descricao: 'Retenção máxima, sem teto — a prova está perto.' },
  plantao: { label: 'Modo Plantão', retencao_alvo: 0.85, teto_cards_dia: 20, descricao: 'Só o essencial, teto de 20 cards — tempo é curto.' },
  exploracao: { label: 'Modo Exploração', retencao_alvo: 0.75, teto_cards_dia: null, descricao: 'Curiosidade livre, sem pressão de retenção.' },
  manutencao: { label: 'Manutenção', retencao_alvo: 0.85, teto_cards_dia: 15, descricao: 'Sustentar o que já foi conquistado.' },
  padrao: { label: 'Padrão', retencao_alvo: 0.85, teto_cards_dia: null, descricao: 'Equilíbrio — o organismo decide sozinho.' },
}

interface SessaoConfigState {
  config: ConfigSessao | null
  carregar: () => Promise<void>
  aplicarPreset: (p: PresetSessao) => Promise<void>
}

export const useSessaoConfigStore = create<SessaoConfigState>((set, get) => ({
  config: null,

  carregar: async () => {
    const c = await db.sessaoConfig.get('atual')
    set({ config: c ?? null })
  },

  aplicarPreset: async (preset) => {
    const cfg = PRESETS[preset]
    const config: ConfigSessao = {
      chave: 'atual',
      preset,
      retencao_alvo: cfg.retencao_alvo,
      teto_cards_dia: cfg.teto_cards_dia,
      atualizado_em: new Date().toISOString(),
    }
    await db.sessaoConfig.put(config)
    set({ config })
    await get().carregar()
  },
}))
