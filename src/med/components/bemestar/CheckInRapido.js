import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useCheckInStore } from '@core/store/checkinStore';
const ENERGIAS = [
    { v: 'baixa', label: 'Baixa', icone: '○' },
    { v: 'media', label: 'Média', icone: '◐' },
    { v: 'alta', label: 'Alta', icone: '●' },
];
const HUMORES = [
    { v: 'ansioso', label: 'Ansioso' },
    { v: 'neutro', label: 'Neutro' },
    { v: 'motivado', label: 'Motivado' },
    { v: 'cansado', label: 'Cansado' },
    { v: 'sobrecarregado', label: 'Sobrecarregado' },
];
/** Check-in de Energia e Humor (bloco 7) — 1 toque, adapta a sessão. */
export function CheckInRapido({ onFeito, compacto }) {
    const { registrar } = useCheckInStore();
    const [energia, setEnergia] = useState(null);
    const escolherHumor = async (humor) => {
        const e = energia ?? 'media';
        await registrar(e, humor);
        onFeito?.(e, humor);
    };
    if (!energia) {
        return (_jsxs("div", { children: [_jsx("p", { style: { margin: '0 0 10px', fontSize: compacto ? 12 : 13, color: 'var(--color-text-secondary)' }, children: "Como est\u00E1 sua energia agora?" }), _jsx("div", { style: { display: 'flex', gap: 8 }, children: ENERGIAS.map((e) => (_jsxs("button", { onClick: () => setEnergia(e.v), style: {
                            flex: 1,
                            padding: '10px 8px',
                            border: '1px solid var(--color-border-accent)',
                            borderRadius: 'var(--radius-md)',
                            background: 'transparent',
                            color: 'var(--color-text-secondary)',
                            cursor: 'pointer',
                            fontSize: 12,
                        }, children: [_jsx("div", { style: { fontSize: 16, marginBottom: 2 }, children: e.icone }), e.label] }, e.v))) })] }));
    }
    return (_jsxs("div", { children: [_jsx("p", { style: { margin: '0 0 10px', fontSize: compacto ? 12 : 13, color: 'var(--color-text-secondary)' }, children: "E o humor?" }), _jsx("div", { style: { display: 'flex', gap: 6, flexWrap: 'wrap' }, children: HUMORES.map((h) => (_jsx("button", { onClick: () => escolherHumor(h.v), style: {
                        padding: '6px 12px',
                        border: '1px solid var(--color-border)',
                        borderRadius: 99,
                        background: 'transparent',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        fontSize: 11,
                    }, children: h.label }, h.v))) })] }));
}
