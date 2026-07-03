import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useProgressoStore } from '@core/store/progressoStore';
const NIVEIS = [
    { v: 1, label: 'Travei' },
    { v: 2, label: 'Consegui parcialmente' },
    { v: 3, label: 'Consegui bem' },
    { v: 4, label: 'Ensinaria com clareza' },
];
/**
 * Modo Ensinar (bloco 4) — técnica de Feynman: explique como se fosse para
 * um leigo, depois avalie sua própria clareza. Sem API externa — o
 * julgamento é seu, e isso já é o exercício.
 */
export function ModoEnsinar({ resumo_id, titulo, progresso }) {
    const { salvarDiario, setAutoAvaliacao } = useProgressoStore();
    const [texto, setTexto] = useState(progresso?.diario_aprendizagem ?? '');
    const [salvo, setSalvo] = useState(true);
    useEffect(() => {
        setTexto(progresso?.diario_aprendizagem ?? '');
    }, [resumo_id, progresso?.diario_aprendizagem]);
    useEffect(() => {
        if (salvo)
            return;
        const t = setTimeout(async () => {
            await salvarDiario(resumo_id, texto);
            setSalvo(true);
        }, 700);
        return () => clearTimeout(t);
    }, [texto, salvo, resumo_id, salvarDiario]);
    const nivelAtual = progresso?.auto_avaliacao.explicar_para_leigo ?? null;
    return (_jsxs("div", { children: [_jsxs("p", { style: { margin: '0 0 6px', fontSize: 14, color: 'var(--color-text-primary)', fontWeight: 600 }, children: ["Explique \"", titulo, "\" como se fosse para algu\u00E9m que nunca ouviu falar disso"] }), _jsx("p", { style: { margin: '0 0 14px', fontSize: 12, color: 'var(--color-text-muted)' }, children: "Sem jarg\u00E3o. Se voc\u00EA travar em algum ponto, esse \u00E9 exatamente o ponto que precisa de mais estudo." }), _jsx("textarea", { value: texto, onChange: (e) => {
                    setTexto(e.target.value);
                    setSalvo(false);
                }, rows: 6, placeholder: "Comece: 'Bom, imagina que...'", style: {
                    width: '100%',
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '14px 16px',
                    color: 'var(--color-text-primary)',
                    fontSize: 14,
                    lineHeight: 1.6,
                    fontFamily: 'var(--font-serif)',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                } }), _jsx("p", { style: { margin: '4px 0 0', fontSize: 10, color: 'var(--color-text-muted)', textAlign: 'right' }, children: salvo ? 'salvo' : 'salvando...' }), _jsxs("div", { style: { marginTop: 20 }, children: [_jsx("p", { style: { margin: '0 0 8px', fontSize: 12, color: 'var(--color-text-secondary)' }, children: "Com que clareza voc\u00EA conseguiu explicar?" }), _jsx("div", { style: { display: 'flex', gap: 6, flexWrap: 'wrap' }, children: NIVEIS.map((n) => (_jsx("button", { onClick: () => setAutoAvaliacao(resumo_id, 'explicar_para_leigo', n.v), style: {
                                padding: '7px 14px',
                                borderRadius: 99,
                                border: `1px solid ${nivelAtual === n.v ? 'var(--color-accent)' : 'var(--color-border)'}`,
                                background: nivelAtual === n.v ? 'var(--color-accent-glow)' : 'transparent',
                                color: nivelAtual === n.v ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                fontSize: 12,
                                cursor: 'pointer',
                            }, children: n.label }, n.v))) })] })] }));
}
