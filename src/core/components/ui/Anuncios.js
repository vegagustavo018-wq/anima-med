import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAnuncioStore } from '@core/store/anuncioStore';
const COR = {
    info: 'var(--color-accent)',
    sucesso: 'var(--color-success)',
    erro: 'var(--color-danger)',
};
const ICONE = {
    info: '✦',
    sucesso: '✓',
    erro: '⚠',
};
/**
 * Pilha de anúncios (toasts) fixada no canto inferior. Container com aria-live
 * "polite" — anúncios novos são lidos por leitores de tela sem roubar o foco.
 */
export function Anuncios() {
    const { anuncios, remover } = useAnuncioStore();
    return (_jsx("div", { "aria-live": "polite", "aria-relevant": "additions", style: {
            position: 'fixed',
            bottom: 'calc(20px + env(safe-area-inset-bottom))',
            right: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            zIndex: 80,
            maxWidth: 'min(360px, calc(100vw - 40px))',
            pointerEvents: 'none',
        }, children: anuncios.map((a) => (_jsxs("button", { onClick: () => remover(a.id), className: "anima-entra", style: {
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                textAlign: 'left',
                padding: '12px 15px',
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderLeft: `3px solid ${COR[a.tipo]}`,
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 28px rgba(0,0,0,0.4)',
                cursor: 'pointer',
                color: 'var(--color-text-primary)',
                fontSize: 13,
                lineHeight: 1.45,
            }, children: [_jsx("span", { "aria-hidden": "true", style: { color: COR[a.tipo], fontSize: 15, flexShrink: 0, marginTop: 1 }, children: a.icone ?? ICONE[a.tipo] }), _jsx("span", { style: { flex: 1 }, children: a.texto })] }, a.id))) }));
}
