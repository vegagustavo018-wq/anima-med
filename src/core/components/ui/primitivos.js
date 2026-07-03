import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
// ── Container de página ───────────────────────────────────────────────────────
export function Pagina({ children, largura = 1100 }) {
    return _jsx("div", { style: { padding: '32px 40px', maxWidth: largura, margin: '0 auto' }, children: children });
}
// ── Breadcrumb ────────────────────────────────────────────────────────────────
export function Breadcrumb({ itens }) {
    return (_jsx("nav", { style: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }, children: itens.map((it, i) => (_jsxs("span", { style: { display: 'flex', gap: 8, alignItems: 'center' }, children: [it.to ? (_jsx(Link, { to: it.to, style: { fontSize: 12, color: 'var(--color-text-secondary)', textDecoration: 'none' }, children: it.label })) : (_jsx("span", { style: { fontSize: 12, color: 'var(--color-text-muted)' }, children: it.label })), i < itens.length - 1 && (_jsx("span", { style: { fontSize: 12, color: 'var(--color-text-muted)' }, children: "\u203A" }))] }, i))) }));
}
// ── Cabeçalho de página ───────────────────────────────────────────────────────
export function CabecalhoPagina({ titulo, subtitulo, acao, }) {
    return (_jsxs("header", { style: {
            marginBottom: 32,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 16,
        }, children: [_jsxs("div", { children: [_jsx("h1", { style: { margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)' }, children: titulo }), subtitulo && (_jsx("p", { style: { margin: '6px 0 0', color: 'var(--color-text-secondary)', fontSize: 14 }, children: subtitulo }))] }), acao] }));
}
// ── Cartão clicável ───────────────────────────────────────────────────────────
export function Cartao({ children, onClick, to, cor, style, }) {
    const base = {
        display: 'block',
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderTop: cor ? `3px solid ${cor}` : '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 18,
        cursor: onClick || to ? 'pointer' : 'default',
        textAlign: 'left',
        textDecoration: 'none',
        transition: 'border-color 0.15s, background 0.15s',
        width: '100%',
        ...style,
    };
    const hover = (e, on) => {
        e.currentTarget.style.background = on ? 'var(--color-bg-hover)' : 'var(--color-bg-card)';
        if (cor)
            e.currentTarget.style.borderTopColor = cor;
    };
    if (to)
        return (_jsx(Link, { to: to, style: base, onMouseEnter: (e) => hover(e, true), onMouseLeave: (e) => hover(e, false), children: children }));
    return (_jsx("button", { onClick: onClick, style: base, onMouseEnter: (e) => hover(e, true), onMouseLeave: (e) => hover(e, false), children: children }));
}
// ── Grade responsiva ──────────────────────────────────────────────────────────
export function Grade({ children, min = 240 }) {
    return (_jsx("div", { style: {
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`,
            gap: 16,
        }, children: children }));
}
// ── Fala da ANIMA ─────────────────────────────────────────────────────────────
export function FalaAnima({ texto, grande = false }) {
    return (_jsxs("div", { style: {
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
            padding: grande ? '20px 24px' : '14px 18px',
            background: 'var(--color-accent-glow)',
            border: '1px solid var(--color-border-accent)',
            borderRadius: 'var(--radius-lg)',
        }, children: [_jsx("span", { style: {
                    fontSize: grande ? 24 : 18,
                    color: 'var(--color-accent)',
                    lineHeight: 1,
                    flexShrink: 0,
                    marginTop: 2,
                }, children: "\u2726" }), _jsx("p", { style: {
                    margin: 0,
                    fontSize: grande ? 17 : 14,
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.6,
                    fontFamily: 'var(--font-serif)',
                }, children: texto })] }));
}
// ── Badge de nível/estado ─────────────────────────────────────────────────────
export function Badge({ children, cor }) {
    return (_jsx("span", { style: {
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: cor ?? 'var(--color-text-muted)',
            padding: '2px 8px',
            border: `1px solid ${cor ?? 'var(--color-border)'}`,
            borderRadius: 99,
        }, children: children }));
}
// ── Estado vazio ──────────────────────────────────────────────────────────────
export function EstadoVazio({ children }) {
    return (_jsx("div", { style: {
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '48px 32px',
            textAlign: 'center',
        }, children: children }));
}
