import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
const CICLO = [
    { fase: 'inspirar', duracao: 4000, rotulo: 'Inspire' },
    { fase: 'segurar', duracao: 4000, rotulo: 'Segure' },
    { fase: 'expirar', duracao: 4000, rotulo: 'Expire' },
    { fase: 'pausa', duracao: 4000, rotulo: 'Pausa' },
];
/**
 * Respiração guiada pela bioluminescência (box breathing 4-4-4-4). O próprio
 * organismo respira com você. Bloco 7.
 */
export function RespiracaoGuiada({ reduzirMovimento, ciclos = 4, onCompleto }) {
    const [passo, setPasso] = useState(0);
    const [ciclosFeitos, setCiclosFeitos] = useState(0);
    const atual = CICLO[passo % CICLO.length];
    useEffect(() => {
        if (ciclosFeitos >= ciclos) {
            onCompleto?.();
            return;
        }
        const t = setTimeout(() => {
            const prox = passo + 1;
            setPasso(prox);
            if (prox % CICLO.length === 0)
                setCiclosFeitos((c) => c + 1);
        }, atual.duracao);
        return () => clearTimeout(t);
    }, [passo, ciclosFeitos, ciclos, atual.duracao, onCompleto]);
    const escala = atual.fase === 'inspirar' ? 1.4 : atual.fase === 'expirar' ? 0.7 : atual.fase === 'segurar' ? 1.4 : 0.7;
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }, children: [_jsx("div", { style: {
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, var(--color-accent-glow), transparent 70%)',
                    border: '1.5px solid var(--color-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: reduzirMovimento ? undefined : `scale(${escala})`,
                    transition: reduzirMovimento ? undefined : `transform ${atual.duracao}ms ease-in-out`,
                }, children: _jsx("span", { style: { fontSize: 15, fontWeight: 600, color: 'var(--color-accent)' }, children: atual.rotulo }) }), _jsxs("p", { style: { marginTop: 24, fontSize: 12, color: 'var(--color-text-muted)' }, children: ["Ciclo ", Math.min(ciclosFeitos + 1, ciclos), " de ", ciclos] })] }));
}
