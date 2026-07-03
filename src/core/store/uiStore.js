import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useUIStore = create()(persist((set) => ({
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
    toggleNivel: (n) => set((s) => ({ filtroNivel: { ...s.filtroNivel, [n]: !s.filtroNivel[n] } })),
    setUltimo: (ultimoBloco, ultimaRota) => set({ ultimoBloco, ultimaRota }),
    marcarOnboardingVisto: () => set({ onboardingVisto: true }),
    setFonte: (fonte) => set({ fonte }),
    setTamanhoFonte: (tamanhoFonte) => set({ tamanhoFonte }),
    setLarguraColuna: (larguraColuna) => set({ larguraColuna }),
    setPaleta: (paleta) => set({ paleta }),
    setPerfilSessao: (perfilSessao) => set({ perfilSessao }),
}), {
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
}));
/** Detecta prefers-reduced-motion do sistema e sincroniza uma vez. */
export function sincronizarMovimento() {
    try {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mq.matches)
            useUIStore.getState().setReduzirMovimento(true);
    }
    catch {
        // ignora
    }
}
