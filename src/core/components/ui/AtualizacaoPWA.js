import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { ouvirSW, aplicarAtualizacao } from '@core/pwa';
import { anunciar } from '@core/store/anuncioStore';
import { tocar } from '@core/anima/som';
/**
 * Aviso de nova versão do app. Fecha o ciclo que estava em código morto: o
 * service worker já emite 'atualizacao_disponivel' (core/pwa.ts) mas nada na UI
 * consumia — o usuário podia ficar preso numa build velha. Agora, quando há
 * versão nova, a ANIMA convida a recarregar (sem forçar, para não perder
 * trabalho em andamento). Quando fica pronto offline pela 1ª vez, um toast leve.
 */
export function AtualizacaoPWA() {
    const [estado, setEstado] = useState('inicial');
    useEffect(() => {
        return ouvirSW((novo) => {
            setEstado(novo);
            if (novo === 'offline_pronto') {
                anunciar('Pronto para uso offline — o organismo cabe no seu bolso.', {
                    tipo: 'sucesso',
                    icone: '⇊',
                });
            }
            else if (novo === 'atualizacao_disponivel') {
                tocar('colheita');
            }
        });
    }, []);
    if (estado !== 'atualizacao_disponivel')
        return null;
    return (_jsxs("div", { role: "status", className: "anima-entra", style: {
            position: 'fixed',
            bottom: 'calc(20px + env(safe-area-inset-bottom))',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '12px 16px',
            maxWidth: 'min(440px, calc(100vw - 32px))',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-accent)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        }, children: [_jsx("span", { "aria-hidden": "true", className: "anima-respira", style: { fontSize: 18, color: 'var(--color-accent)' }, children: "\u2726" }), _jsx("span", { style: { flex: 1, fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.4 }, children: "O organismo evoluiu. Recarregue para a vers\u00E3o nova." }), _jsx("button", { onClick: () => {
                    tocar('transicao');
                    aplicarAtualizacao();
                }, style: {
                    flexShrink: 0,
                    padding: '7px 14px',
                    border: '1px solid transparent',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-accent)',
                    color: '#04121a',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                }, children: "Recarregar" }), _jsx("button", { onClick: () => setEstado('inicial'), "aria-label": "Agora n\u00E3o", style: {
                    flexShrink: 0,
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--color-text-muted)',
                    fontSize: 18,
                    lineHeight: 1,
                    cursor: 'pointer',
                    padding: 2,
                }, children: "\u00D7" })] }));
}
