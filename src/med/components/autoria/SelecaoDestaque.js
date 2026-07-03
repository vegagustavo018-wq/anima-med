import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
const CORES = [
    { v: 'amarelo', hex: '#f6e05e', nome: 'importante' },
    { v: 'vermelho', hex: '#fc8181', nome: 'dúvida' },
    { v: 'roxo', hex: '#b794f4', nome: 'conexão' },
    { v: 'verde', hex: '#68d391', nome: 'compreendido' },
];
/**
 * Highlights multi-cor semânticos (bloco 9). Selecione texto na narrativa —
 * um popover de 4 cores aparece para classificar por que aquele trecho importa.
 */
export function SelecaoDestaque({ onDestacar, children }) {
    const ref = useRef(null);
    const [popover, setPopover] = useState(null);
    const aoSoltar = () => {
        const sel = window.getSelection();
        const trecho = sel?.toString().trim() ?? '';
        if (!trecho || trecho.length < 3 || !ref.current) {
            setPopover(null);
            return;
        }
        const range = sel.getRangeAt(0);
        if (!ref.current.contains(range.commonAncestorContainer)) {
            setPopover(null);
            return;
        }
        const rect = range.getBoundingClientRect();
        const box = ref.current.getBoundingClientRect();
        setPopover({ x: rect.left - box.left + rect.width / 2, y: rect.top - box.top - 8, trecho });
    };
    const escolher = (cor) => {
        if (!popover)
            return;
        onDestacar(popover.trecho, cor);
        setPopover(null);
        window.getSelection()?.removeAllRanges();
    };
    return (_jsxs("div", { ref: ref, onMouseUp: aoSoltar, style: { position: 'relative' }, children: [children, popover && (_jsx("div", { style: {
                    position: 'absolute',
                    left: popover.x,
                    top: popover.y,
                    transform: 'translate(-50%, -100%)',
                    display: 'flex',
                    gap: 4,
                    padding: '6px 8px',
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-accent)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    zIndex: 30,
                    animation: 'entrarSuave 0.12s ease',
                }, children: CORES.map((c) => (_jsx("button", { onClick: () => escolher(c.v), title: c.nome, style: {
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: c.hex,
                        border: 'none',
                        cursor: 'pointer',
                    } }, c.v))) }))] }));
}
