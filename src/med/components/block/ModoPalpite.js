import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
/**
 * Inversão pedagógica: antes de revelar a narrativa, a ANIMA pergunta.
 * O erro no palpite é DESEJADO (pretesting effect) — abre o buraco que a
 * narrativa vai preencher. O palpite é guardado para o reencontro em espiral.
 */
export function ModoPalpite({ pergunta, dica, onRevelar }) {
    const [resposta, setResposta] = useState('');
    return (_jsxs("div", { style: {
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border-accent)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px 32px',
            margin: '8px 0 40px',
        }, children: [_jsxs("div", { style: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }, children: [_jsx("span", { style: { fontSize: 18, color: 'var(--color-accent)' }, children: "\u2726" }), _jsx("span", { style: {
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: 'var(--color-accent)',
                        }, children: "Antes de eu contar \u2014 o que voc\u00EA acha?" })] }), _jsx("p", { style: {
                    margin: '0 0 6px',
                    fontSize: 18,
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.5,
                    fontFamily: 'var(--font-serif)',
                }, children: pergunta }), dica && (_jsx("p", { style: { margin: '0 0 16px', fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic' }, children: dica })), _jsx("textarea", { value: resposta, onChange: (e) => setResposta(e.target.value), placeholder: "Arrisque. Errar aqui faz a explica\u00E7\u00E3o grudar melhor depois.", rows: 3, style: {
                    width: '100%',
                    background: 'var(--color-bg-base)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    color: 'var(--color-text-primary)',
                    fontSize: 14,
                    fontFamily: 'var(--font-sans)',
                    resize: 'vertical',
                    marginTop: 8,
                    boxSizing: 'border-box',
                } }), _jsxs("div", { style: { display: 'flex', gap: 12, marginTop: 16, alignItems: 'center' }, children: [_jsx("button", { onClick: () => onRevelar(resposta), style: {
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--color-accent)',
                            color: 'var(--color-bg-base)',
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: 'pointer',
                        }, children: "Revelar a resposta \u2192" }), _jsx("button", { onClick: () => onRevelar(''), style: {
                            padding: '10px 16px',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            background: 'transparent',
                            color: 'var(--color-text-muted)',
                            fontSize: 13,
                            cursor: 'pointer',
                        }, children: "Pular" })] })] }));
}
