import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Botao } from '@core/components/ui/controles';
function normalizar(s) {
    return s
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}
const NOTAS = [
    { q: 1, label: 'Errei', cor: 'var(--color-danger)' },
    { q: 3, label: 'Difícil', cor: 'var(--color-warning)' },
    { q: 4, label: 'Bom', cor: 'var(--color-accent)' },
    { q: 5, label: 'Fácil', cor: 'var(--color-success)' },
];
/**
 * Player de flashcard: modo flip (revelar → autoavaliar) e modo type-in (digitar
 * a resposta curta → comparação normalizada → autoavaliar). Entrega o P3.
 */
export function FlashcardPlayer({ card, aoAvaliar, numero, total, }) {
    const [revelado, setRevelado] = useState(false);
    const [texto, setTexto] = useState('');
    const [mostrarDica, setMostrarDica] = useState(false);
    const digitar = card.subtipo === 'digitar';
    const acertouDigitar = digitar && normalizar(texto) === normalizar(card.verso);
    const revelar = () => setRevelado(true);
    return (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }, children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, color: 'var(--color-accent)', letterSpacing: '0.06em' }, children: card.especialidade.toUpperCase() }), _jsxs("span", { style: { fontSize: 11, color: 'var(--color-text-muted)' }, children: [numero, " / ", total] })] }), _jsx("p", { style: { fontSize: 17, lineHeight: 1.5, color: 'var(--color-text-primary)', margin: '0 0 18px', fontWeight: 600 }, children: card.frente }), card.dica && !revelado && (_jsx("button", { onClick: () => setMostrarDica((v) => !v), style: { border: 'none', background: 'transparent', color: 'var(--color-text-muted)', fontSize: 12, cursor: 'pointer', padding: 0, marginBottom: 14 }, children: mostrarDica ? `💡 ${card.dica}` : '💡 Ver dica' })), digitar && !revelado && (_jsxs("div", { style: { display: 'flex', gap: 8, marginBottom: 14 }, children: [_jsx("input", { autoFocus: true, value: texto, "aria-label": "Sua resposta", onChange: (e) => setTexto(e.target.value), onKeyDown: (e) => e.key === 'Enter' && revelar(), placeholder: "Digite sua resposta\u2026", style: {
                            flex: 1,
                            padding: '11px 14px',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--color-bg-card)',
                            color: 'var(--color-text-primary)',
                            fontSize: 14,
                            outline: 'none',
                        } }), _jsx(Botao, { onClick: revelar, variante: "secundario", children: "Verificar" })] })), !revelado && !digitar && (_jsx(Botao, { onClick: revelar, variante: "primario", som: "revelar", children: "Revelar resposta" })), revelado && (_jsxs("div", { className: "anima-surge", role: "status", "aria-live": "polite", children: [digitar && (_jsx("p", { style: { margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: acertouDigitar ? 'var(--color-success)' : 'var(--color-danger)' }, children: acertouDigitar ? '✓ Correto' : `✕ Você escreveu: "${texto || '—'}"` })), _jsxs("div", { style: {
                            padding: '14px 16px',
                            background: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)',
                            marginBottom: 14,
                        }, children: [_jsx("p", { style: { margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)' }, children: card.verso }), card.fraseParaPaciente && (_jsxs("p", { style: { margin: '12px 0 0', fontSize: 13, lineHeight: 1.5, color: 'var(--color-text-secondary)', fontStyle: 'italic', borderLeft: '2px solid var(--color-border-accent)', paddingLeft: 10 }, children: ["\uD83D\uDDE3 \"", card.fraseParaPaciente, "\""] }))] }), _jsx("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' }, children: NOTAS.map((n) => (_jsx("button", { onClick: () => aoAvaliar(n.q), className: "anima-lift", style: {
                                flex: 1,
                                minWidth: 72,
                                padding: '10px 12px',
                                border: `1px solid ${n.cor}`,
                                borderRadius: 'var(--radius-md)',
                                background: 'transparent',
                                color: n.cor,
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: 'pointer',
                            }, children: n.label }, n.q))) })] }))] }));
}
