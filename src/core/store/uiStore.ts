import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { NivelDominio } from '@core/types/schema'

export type Tema = 'escuro' | 'claro' | 'oled' | 'sepia'
export type FonteLeitura = 'padrao' | 'dislexia' | 'serifada'
export type PaletaCor = 'padrao' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'alto-contraste'
export type PerfilSessao = 'pico' | 'manutencao' | 'exausto' | 'padrao'

interface UIState {
  tema: Tema
  sidebarAberta: boolean
  reduzirMovimento: boolean
  som: boolean // efeitos sonoros sutis (Web Audio sintetizado)
  modoFoco: boolean

  // Filtro global CORE / EXPANSAO / APROFUNDAMENTO
  filtroNivel: Record<NivelDominio, boolean>

  // "Continuar de onde parei"
  ultimoBloco: string | null
  ultimaRota: string | null

  onboardingVisto: boolean

  // Bloco 10 — Acessibilidade e Personalização
  fonte: FonteLeitura
  tamanhoFonte: number // multiplicador 0.85–1.4
  larguraColuna: 'estreita' | 'normal' | 'larga'
  paleta: PaletaCor
  perfilSessao: PerfilSessao

  setTema: (t: Tema) => void
  toggleSidebar: () => void
  setReduzirMovimento: (v: boolean) => void
  setSom: (v: boolean) => void
  toggleFoco: () => void
  toggleNivel: (n: NivelDominio) => void
  setUltimo: (blocoId: string | null, rota: string | null) => void
  marcarOnboardingVisto: () => void
  setFonte: (f: FonteLeitura) => void
  setTamanhoFonte: (n: number) => void
  setLarguraColuna: (l: 'estreita' | 'normal' | 'larga') => void
  setPaleta: (p: PaletaCor) => void
  setPerfilSessao: (p: PerfilSessao) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      tema: 'escuro',
      sidebarAberta: true,
      reduzirMovimento: false,
      som: true,
      modoFoco: false,
      filtroNivel: { CORE: true, EXPANSAO: true, APROFUNDAMENTO: true },
      ultimoBloco: null,
      ultimaRota: null,
      onboardingVisto: false,
      fonte: 'padrao',
      tamanhoFonte: 1,
      larguraColuna: 'normal',
      paleta: 'padrao',
      perfilSessao: 'padrao',

      setTema: (tema) => set({ tema }),
      toggleSidebar: () => set((s) => ({ sidebarAberta: !s.sidebarAberta })),
      setReduzirMovimento: (reduzirMovimento) => set({ reduzirMovimento }),
      setSom: (som) => set({ som }),
      toggleFoco: () => set((s) => ({ modoFoco: !s.modoFoco })),
      toggleNivel: (n) =>
        set((s) => ({ filtroNivel: { ...s.filtroNivel, [n]: !s.filtroNivel[n] } })),
      setUltimo: (ultimoBloco, ultimaRota) => set({ ultimoBloco, ultimaRota }),
      marcarOnboardingVisto: () => set({ onboardingVisto: true }),
      setFonte: (fonte) => set({ fonte }),
      setTamanhoFonte: (tamanhoFonte) => set({ tamanhoFonte }),
      setLarguraColuna: (larguraColuna) => set({ larguraColuna }),
      setPaleta: (paleta) => set({ paleta }),
      setPerfilSessao: (perfilSessao) => set({ perfilSessao }),
    }),
    {
      name: 'anima-ui',
      partialize: (s) => ({
        tema: s.tema,
        sidebarAberta: s.sidebarAberta,
        reduzirMovimento: s.reduzirMovimento,
        som: s.som,
        filtroNivel: s.filtroNivel,
        ultimoBloco: s.ultimoBloco,
        ultimaRota: s.ultimaRota,
        onboardingVisto: s.onboardingVisto,
        fonte: s.fonte,
        tamanhoFonte: s.tamanhoFonte,
        larguraColuna: s.larguraColuna,
        paleta: s.paleta,
        perfilSessao: s.perfilSessao,
      }),
    }
  )
)

/** Detecta prefers-reduced-motion do sistema e sincroniza uma vez. */
export function sincronizarMovimento(): void {
  try {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) useUIStore.getState().setReduzirMovimento(true)
  } catch {
    // ignora
  }
}
