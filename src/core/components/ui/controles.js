import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useId, useRef, useState, } from 'react';
import { createPortal } from 'react-dom';
import { tocar } from '@core/anima/som';
const PADDING = {
    sm: '6px 12px',
    md: '9px 16px',
    lg: '13px 22px',
};
const FONTE = { sm: 12, md: 13.5, lg: 15 };
function estiloVariante(v) {
    switch (v) {
        case 'primario':
            return { background: 'var(--color-accent)', color: '#04121a', border: '1px solid transparent', fontWeight: 700 };
        case 'perigo':
            return { background: 'transparent', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', fontWeight: 600 };
        case 'fantasma':
            return { background: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid transparent', fontWeight: 500 };
        case 'secundario':
        default:
            return { background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', fontWeight: 600 };
    }
}
export function Botao({ children, onClick, variante = 'secundario', tamanho = 'md', icone, disabled, som = 'toque', tipo = 'button', largura, title, ariaLabel, style, }) {
    return (_jsxs("button", { type: tipo, onClick: () => {
            if (disabled)
                return;
            if (som)
                tocar(som);
            onClick?.();
        }, disabled: disabled, title: title, "aria-label": ariaLabel, className: "anima-lift", style: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: PADDING[tamanho],
            fontSize: FONTE[tamanho],
            borderRadius: 'var(--radius-md)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            width: largura,
            transition: 'transform 0.12s ease, filter 0.12s ease, background 0.15s ease',
            ...estiloVariante(variante),
            ...style,
        }, children: [icone && _jsx("span", { "aria-hidden": "true", style: { display: 'inline-flex', fontSize: '1.05em' }, children: icone }), children] }));
}
// ── Skeleton (carregando) ───────────────────────────────────────────────────────
export function Skeleton({ largura = '100%', altura = 16, raio = 'var(--radius-sm)', style, }) {
    return (_jsx("span", { "aria-hidden": "true", className: "anima-skeleton", style: { display: 'block', width: largura, height: altura, borderRadius: raio, ...style } }));
}
/** Bloco de N linhas de skeleton, para prévias de texto carregando. */
export function SkeletonTexto({ linhas = 3 }) {
    return (_jsx("div", { role: "status", "aria-label": "Carregando", style: { display: 'flex', flexDirection: 'column', gap: 10 }, children: Array.from({ length: linhas }).map((_, i) => (_jsx(Skeleton, { largura: i === linhas - 1 ? '60%' : '100%', altura: 14 }, i))) }));
}
export function Abas({ itens, ativa, onMudar, ariaLabel = 'Seções', }) {
    const refs = useRef({});
    const aoTeclar = (e, idx) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')
            return;
        e.preventDefault();
        const passo = e.key === 'ArrowRight' ? 1 : -1;
        const prox = itens[(idx + passo + itens.length) % itens.length];
        onMudar(prox.id);
        refs.current[prox.id]?.focus();
        tocar('transicao');
    };
    return (_jsx("div", { role: "tablist", "aria-label": ariaLabel, style: { display: 'flex', gap: 2, borderBottom: '1px solid var(--color-border)', overflowX: 'auto' }, children: itens.map((it, idx) => {
            const sel = it.id === ativa;
            return (_jsxs("button", { ref: (el) => {
                    refs.current[it.id] = el;
                }, role: "tab", "aria-selected": sel, tabIndex: sel ? 0 : -1, onClick: () => {
                    if (!sel) {
                        onMudar(it.id);
                        tocar('toque');
                    }
                }, onKeyDown: (e) => aoTeclar(e, idx), style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '10px 16px',
                    border: 'none',
                    background: 'transparent',
                    color: sel ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    fontWeight: sel ? 700 : 500,
                    fontSize: 13.5,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    borderBottom: sel ? '2px solid var(--color-accent)' : '2px solid transparent',
                    marginBottom: -1,
                    transition: 'color 0.15s ease',
                }, children: [it.label, it.contagem != null && (_jsx("span", { style: {
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '1px 7px',
                            borderRadius: 99,
                            background: sel ? 'var(--color-accent-glow)' : 'var(--color-bg-card)',
                            color: sel ? 'var(--color-accent)' : 'var(--color-text-muted)',
                        }, children: it.contagem }))] }, it.id));
        }) }));
}
// ── Diálogo modal (foco preso, Esc, clique-fora) ─────────────────────────────────
const FOCAVEIS = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
export function Dialogo({ aberto, onFechar, titulo, children, largura = 520, }) {
    const painelRef = useRef(null);
    const tituloId = useId();
    useEffect(() => {
        if (!aberto)
            return;
        const anterior = document.activeElement;
        // foca o primeiro elemento focável do painel (ou o próprio painel)
        const t = setTimeout(() => {
            const alvo = painelRef.current?.querySelector(FOCAVEIS) ?? painelRef.current;
            alvo?.focus();
        }, 0);
        const aoTeclar = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onFechar();
                return;
            }
            if (e.key !== 'Tab' || !painelRef.current)
                return;
            const focaveis = Array.from(painelRef.current.querySelectorAll(FOCAVEIS));
            if (focaveis.length === 0) {
                e.preventDefault();
                return;
            }
            const primeiro = focaveis[0];
            const ultimo = focaveis[focaveis.length - 1];
            if (e.shiftKey && document.activeElement === primeiro) {
                e.preventDefault();
                ultimo.focus();
            }
            else if (!e.shiftKey && document.activeElement === ultimo) {
                e.preventDefault();
                primeiro.focus();
            }
        };
        document.addEventListener('keydown', aoTeclar);
        return () => {
            clearTimeout(t);
            document.removeEventListener('keydown', aoTeclar);
            anterior?.focus?.();
        };
    }, [aberto, onFechar]);
    if (!aberto)
        return null;
    return createPortal(_jsx("div", { onClick: onFechar, style: {
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 70,
            padding: 24,
            animation: 'entrarSuave 0.15s ease',
        }, children: _jsxs("div", { ref: painelRef, role: "dialog", "aria-modal": "true", "aria-labelledby": tituloId, tabIndex: -1, onClick: (e) => e.stopPropagation(), style: {
                width: '100%',
                maxWidth: largura,
                maxHeight: '85vh',
                overflowY: 'auto',
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-accent)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                animation: 'entrarBaixo 0.2s ease',
                outline: 'none',
            }, children: [_jsxs("header", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--color-border)',
                    }, children: [_jsx("h2", { id: tituloId, style: { margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }, children: titulo }), _jsx("button", { onClick: onFechar, "aria-label": "Fechar", style: {
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--color-text-muted)',
                                fontSize: 20,
                                lineHeight: 1,
                                cursor: 'pointer',
                                padding: 4,
                            }, children: "\u00D7" })] }), _jsx("div", { style: { padding: 20 }, children: children })] }) }), document.body);
}
// ── Hook: controla estado aberto/fechado de um diálogo ──────────────────────────
export function useDialogo(inicial = false) {
    const [aberto, setAberto] = useState(inicial);
    return {
        aberto,
        abrir: () => setAberto(true),
        fechar: () => setAberto(false),
        alternar: () => setAberto((v) => !v),
    };
}
