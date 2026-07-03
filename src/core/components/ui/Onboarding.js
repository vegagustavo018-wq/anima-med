import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useUIStore } from '@core/store/uiStore';
/**
 * Onboarding = a primeira fala da ANIMA. Não é tour funcional neutro; é a
 * apresentação do organismo/companheira. Três respirações e some.
 */
const FALAS = [
    {
        titulo: 'Eu sou a ANIMA.',
        texto: 'Não sou um app de flashcards. Sou um organismo que aprende junto com você — cresço a cada bloco que você domina, e existo para organizar o caos do conhecimento médico em algo vivo.',
    },
    {
        titulo: 'Eu pergunto antes de contar.',
        texto: 'Cada tema começa com uma pergunta sua, não com uma definição minha. Errar o palpite é bom — abre o espaço onde a explicação vai morar. Depois eu conto, e aí gruda.',
    },
    {
        titulo: 'Seu esforço é sagrado.',
        texto: 'Tudo que você estuda fica guardado e protegido — mesmo quando eu reescrevo meu próprio conteúdo. Vamos percorrer doze semestres juntos. Começamos devagar.',
    },
];
export function Onboarding() {
    const { onboardingVisto, marcarOnboardingVisto } = useUIStore();
    const [passo, setPasso] = useState(0);
    if (onboardingVisto)
        return null;
    const fala = FALAS[passo];
    const ultimo = passo === FALAS.length - 1;
    return (_jsx("div", { style: {
            position: 'fixed',
            inset: 0,
            background: 'var(--color-bg-base)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 32,
        }, children: _jsxs("div", { style: { maxWidth: 520, textAlign: 'center' }, children: [_jsx("div", { style: {
                        fontSize: 40,
                        color: 'var(--color-accent)',
                        marginBottom: 32,
                        animation: 'pulso 3s ease-in-out infinite',
                    }, children: "\u2726" }), _jsx("h2", { style: { margin: '0 0 20px', fontSize: 26, fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)' }, children: fala.titulo }), _jsx("p", { style: { margin: '0 0 40px', fontSize: 17, color: 'var(--color-text-secondary)', lineHeight: 1.7, fontFamily: 'var(--font-serif)' }, children: fala.texto }), _jsx("div", { style: { display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }, children: FALAS.map((_, i) => (_jsx("span", { style: {
                            width: i === passo ? 24 : 8,
                            height: 8,
                            borderRadius: 99,
                            background: i === passo ? 'var(--color-accent)' : 'var(--color-border-accent)',
                            transition: 'width 0.2s',
                        } }, i))) }), _jsxs("div", { style: { display: 'flex', gap: 12, justifyContent: 'center' }, children: [!ultimo && (_jsx("button", { onClick: marcarOnboardingVisto, style: { background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 14, padding: '10px 16px' }, children: "Pular" })), _jsx("button", { onClick: () => (ultimo ? marcarOnboardingVisto() : setPasso((p) => p + 1)), style: {
                                padding: '11px 24px',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--color-accent)',
                                color: 'var(--color-bg-base)',
                                fontSize: 14,
                                fontWeight: 700,
                                cursor: 'pointer',
                            }, children: ultimo ? 'Começar' : 'Continuar' })] })] }) }));
}
