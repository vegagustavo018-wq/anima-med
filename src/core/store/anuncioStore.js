import { create } from 'zustand';
import { tocar } from '@core/anima/som';
let sequencia = 0;
const SOM_PADRAO = {
    info: 'toque',
    sucesso: 'sucesso',
    erro: 'erro',
};
/**
 * Fila de anúncios efêmeros (toasts) com feedback sonoro e leitura por
 * leitores de tela (o container tem aria-live). Uso: `anunciar('Backup salvo')`.
 */
export const useAnuncioStore = create((set) => ({
    anuncios: [],
    anunciar: (texto, opts = {}) => {
        const tipo = opts.tipo ?? 'info';
        const id = ++sequencia;
        set((s) => ({ anuncios: [...s.anuncios, { id, texto, tipo, icone: opts.icone }] }));
        const som = opts.som === undefined ? SOM_PADRAO[tipo] : opts.som;
        if (som)
            tocar(som);
        const duracao = opts.duracao ?? 3400;
        if (duracao > 0) {
            setTimeout(() => {
                set((s) => ({ anuncios: s.anuncios.filter((a) => a.id !== id) }));
            }, duracao);
        }
        return id;
    },
    remover: (id) => set((s) => ({ anuncios: s.anuncios.filter((a) => a.id !== id) })),
}));
/** Atalho fora de componentes React. */
export function anunciar(texto, opts) {
    return useAnuncioStore.getState().anunciar(texto, opts);
}
