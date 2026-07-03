import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
/** Rapid Review / High-Yield colapsável (bloco 2) — o essencial em 10 segundos. */
export function RapidReview({ bloco }) {
    const [aberto, setAberto] = useState(false);
    const destaques = bloco.narrativa.filter((i) => i.tipo === 'highlight');
    if (destaques.length === 0)
        return null;
    return (_jsxs("div", { style: { marginBottom: 28, border: '1px solid var(--color-border-accent)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }, children: [_jsxs("button", { onClick: () => setAberto((a) => !a), style: {
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 18px',
                    background: 'var(--color-bg-card)',
                    border: 'none',
                    cursor: 'pointer',
                }, children: [_jsxs("span", { style: { fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-accent)' }, children: ["\u26A1 Rapid Review \u00B7 ", destaques.length, " pontos"] }), _jsx("span", { style: { fontSize: 14, color: 'var(--color-text-muted)', transform: aberto ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s' }, children: "\u2304" })] }), aberto && (_jsx("div", { style: { padding: '4px 18px 16px', display: 'flex', flexDirection: 'column', gap: 8, animation: 'entrarSuave 0.15s ease' }, children: destaques.map((d, i) => (_jsxs("p", { style: { margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, display: 'flex', gap: 8 }, children: [_jsx("span", { style: { color: 'var(--color-accent)', flexShrink: 0 }, children: "\u2726" }), d.conteudo] }, i))) }))] }));
}
