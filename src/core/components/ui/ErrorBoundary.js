import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
import { baixarBackup } from '@core/db/backup';
import { registrarEvento } from '@core/db/database';
/**
 * Rede de segurança: um erro de render em qualquer tela não deve virar tela
 * branca sem contexto — o aluno precisa saber que os dados dele estão a salvo.
 * Tom da ANIMA: acolhe, não alarma.
 */
export class ErrorBoundary extends Component {
    state = { erro: null };
    static getDerivedStateFromError(erro) {
        return { erro };
    }
    componentDidCatch(erro, info) {
        void registrarEvento('erro_render', { mensagem: erro.message, stack: info.componentStack });
    }
    render() {
        if (!this.state.erro)
            return this.props.children;
        return (_jsx("div", { style: {
                minHeight: '100svh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                background: 'var(--color-bg-base, #0a0e1a)',
                color: 'var(--color-text-primary, #e8edf5)',
                fontFamily: 'var(--font-sans, system-ui)',
            }, children: _jsxs("div", { style: { maxWidth: 460, textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: 40, color: 'var(--color-accent, #4fd1c5)', marginBottom: 16 }, children: "\u2726" }), _jsx("h1", { style: { fontSize: 20, fontWeight: 600, margin: '0 0 10px' }, children: "Algo trope\u00E7ou por aqui." }), _jsxs("p", { style: { fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-secondary, #8b9ab5)', margin: '0 0 6px' }, children: ["Respire \u2014 ", _jsx("strong", { children: "seus dados est\u00E3o salvos localmente" }), ", nada se perdeu. Foi s\u00F3 esta tela que travou."] }), _jsx("p", { style: { fontSize: 12, color: 'var(--color-text-muted, #7a8aa8)', margin: '0 0 24px', fontFamily: 'var(--font-mono, monospace)' }, children: this.state.erro.message }), _jsxs("div", { style: { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }, children: [_jsx("button", { onClick: () => window.location.reload(), style: {
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: 8,
                                    background: 'var(--color-accent, #4fd1c5)',
                                    color: 'var(--color-bg-base, #0a0e1a)',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }, children: "Recarregar" }), _jsx("button", { onClick: () => void baixarBackup(), style: {
                                    padding: '10px 20px',
                                    border: '1px solid var(--color-border, #2a3550)',
                                    borderRadius: 8,
                                    background: 'transparent',
                                    color: 'var(--color-text-secondary, #8b9ab5)',
                                    fontSize: 14,
                                    cursor: 'pointer',
                                }, children: "Baixar backup dos meus dados" })] })] }) }));
    }
}
